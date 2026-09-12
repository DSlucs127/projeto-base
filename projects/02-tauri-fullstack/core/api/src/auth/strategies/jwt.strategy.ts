import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AccessTokenPayload, AuthenticatedUser, UserRole } from '../auth.types';

function isUserRole(value: string): value is UserRole {
  return value === 'admin' || value === 'member' || value === 'guest';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  validate(payload: AccessTokenPayload): AuthenticatedUser {
    if (
      typeof payload.sub !== 'string' ||
      !isUserRole(payload.role) ||
      !Array.isArray(payload.permissions) ||
      !payload.permissions.every((permission) => typeof permission === 'string')
    ) {
      throw new Error('Invalid access token payload');
    }

    return {
      id: payload.sub,
      role: payload.role,
      permissions: payload.permissions,
    };
  }
}
