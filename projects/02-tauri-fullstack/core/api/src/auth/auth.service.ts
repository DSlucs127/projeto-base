import { randomUUID } from 'node:crypto';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import { Role, type User } from '@prisma/client';
import * as argon2 from 'argon2';
import type { Request } from 'express';

import type { PrismaService } from '../database/prisma.service';
import type { AuditService } from '../security/audit.service';

import type {
  AccessTokenPayload,
  AuthResult,
  RefreshTokenPayload,
  UserRole,
  UserView,
} from './auth.types';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

const PASSWORD_HASH_OPTIONS: argon2.Options & { type: typeof argon2.argon2id } = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

function normalizedEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toUserRole(role: Role): UserRole {
  switch (role) {
    case Role.ADMIN:
      return 'admin';
    case Role.GUEST:
      return 'guest';
    default:
      return 'member';
  }
}

function parseDuration(value: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match) {
    throw new Error('JWT_REFRESH_TTL must use an integer followed by s, m, h, or d');
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const units: Record<string, number> = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  const multiplier = unit ? units[unit] : undefined;
  if (!Number.isSafeInteger(amount) || amount <= 0 || !multiplier) {
    throw new Error('JWT_REFRESH_TTL is invalid');
  }
  return amount * multiplier;
}

@Injectable()
export class AuthService {
  private dummyHash?: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Verifica a senha contra o hash do usuario. Quando o usuario nao existe,
   * verifica contra um hash dummy para manter o tempo de resposta constante
   * (evita enumeracao de emails por timing).
   */
  private async verifyPassword(hash: string | undefined, password: string): Promise<boolean> {
    this.dummyHash ??= await argon2.hash(randomUUID(), PASSWORD_HASH_OPTIONS);
    return argon2.verify(hash ?? this.dummyHash, password);
  }

  async register(dto: RegisterDto, request?: Request): Promise<AuthResult> {
    const email = normalizedEmail(dto.email);
    const existing = await this.prisma.client.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('Account cannot be created with these credentials');
    }

    const displayName = dto.displayName?.trim() || null;
    const passwordHash = await argon2.hash(dto.password, PASSWORD_HASH_OPTIONS);
    const user = await this.prisma.client.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        role: Role.MEMBER,
      },
    });
    const result = await this.issueTokens(user);

    await this.audit.record(
      {
        actorId: user.id,
        actorType: 'user',
        action: 'user.register',
        targetType: 'user',
        targetId: user.id,
      },
      request,
    );

    return result;
  }

  async login(dto: LoginDto, request?: Request): Promise<AuthResult> {
    const user = await this.prisma.client.user.findUnique({
      where: { email: normalizedEmail(dto.email) },
    });
    const passwordOk = await this.verifyPassword(user?.passwordHash, dto.password);
    if (!user || !user.isActive || !passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.issueTokens(user);
    await this.audit.record(
      {
        actorId: user.id,
        actorType: 'user',
        action: 'user.login',
        targetType: 'user',
        targetId: user.id,
      },
      request,
    );
    return result;
  }

  async refresh(refreshToken: string, request?: Request): Promise<AuthResult> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.prisma.client.session.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    });
    if (
      !session ||
      session.userId !== payload.sub ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.user.isActive ||
      !(await argon2.verify(session.tokenHash, refreshToken))
    ) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    await this.prisma.client.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const result = await this.issueTokens(session.user);
    await this.audit.record(
      {
        actorId: session.user.id,
        actorType: 'user',
        action: 'user.token.refresh',
        targetType: 'session',
        targetId: session.id,
      },
      request,
    );
    return result;
  }

  async logout(refreshToken: string, request?: Request): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.prisma.client.session.findUnique({
      where: { id: payload.sid },
      select: { id: true, userId: true, revokedAt: true },
    });
    if (!session || session.userId !== payload.sub || session.revokedAt) {
      throw new UnauthorizedException('Invalid refresh session');
    }

    await this.prisma.client.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
    await this.audit.record(
      {
        actorId: session.userId,
        actorType: 'user',
        action: 'user.logout',
        targetType: 'session',
        targetId: session.id,
      },
      request,
    );
  }

  async profile(id: string): Promise<UserView> {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is unavailable');
    }
    return this.toUserView(user);
  }

  private async issueTokens(user: User): Promise<AuthResult> {
    const role = toUserRole(user.role);
    const permissions = [...user.permissions];
    const accessPayload: AccessTokenPayload = { sub: user.id, role, permissions };
    const sessionId = randomUUID();
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      sid: sessionId,
      type: 'refresh',
    };
    const refreshTtl = this.config.get<string>('JWT_REFRESH_TTL', '30d');
    const refreshExpiresAt = new Date(Date.now() + parseDuration(refreshTtl));
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(accessPayload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m'),
      }),
      this.jwt.signAsync(refreshPayload, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      }),
    ]);

    await this.prisma.client.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash: await argon2.hash(refreshToken, PASSWORD_HASH_OPTIONS),
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt,
      user: this.toUserView(user),
    };
  }

  private async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      if (
        payload.type !== 'refresh' ||
        typeof payload.sub !== 'string' ||
        typeof payload.sid !== 'string'
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private toUserView(user: User): UserView {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: toUserRole(user.role),
      permissions: [...user.permissions],
    };
  }
}
