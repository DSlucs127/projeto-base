import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type { CookieOptions, Request, Response } from 'express';

import { CsrfOriginGuard } from '../security/csrf-origin.guard';
import { Public } from '../security/public.decorator';

import type { AuthService } from './auth.service';
import type { AuthResult, AuthenticatedUser, UserView } from './auth.types';
import { CurrentUser } from './current-user.decorator';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async register(
    @Body() dto: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string; user: UserView }> {
    return this.setRefreshCookie(await this.auth.register(dto, request), response);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string; user: UserView }> {
    return this.setRefreshCookie(await this.auth.login(dto, request), response);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @UseGuards(CsrfOriginGuard)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ accessToken: string; user: UserView }> {
    return this.setRefreshCookie(
      await this.auth.refresh(this.refreshToken(request), request),
      response,
    );
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  @UseGuards(CsrfOriginGuard)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.auth.logout(this.refreshToken(request), request);
    response.clearCookie(REFRESH_COOKIE, this.cookieOptions());
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserView> {
    return this.auth.profile(user.id);
  }

  private setRefreshCookie(
    result: AuthResult,
    response: Response,
  ): { accessToken: string; user: UserView } {
    response.cookie(REFRESH_COOKIE, result.refreshToken, {
      ...this.cookieOptions(),
      expires: result.refreshExpiresAt,
    });
    return { accessToken: result.accessToken, user: result.user };
  }

  private refreshToken(request: Request): string {
    const token = request.cookies?.[REFRESH_COOKIE];
    if (typeof token !== 'string' || token.length === 0) {
      throw new UnauthorizedException('Refresh token is required');
    }
    return token;
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    };
  }
}
