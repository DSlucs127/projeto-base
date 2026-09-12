import type {
  CanActivate,
  ExecutionContext} from '@nestjs/common';
import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

import { allowedOrigins } from '../config';

@Injectable()
export class CsrfOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.get('origin');

    if (!origin || !allowedOrigins().includes(origin)) {
      throw new ForbiddenException('Invalid request origin');
    }
    return true;
  }
}
