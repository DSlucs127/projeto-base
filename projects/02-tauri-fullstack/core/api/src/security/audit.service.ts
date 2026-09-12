import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { hashForAudit } from '../database/prisma-crypto.extension';
import type { PrismaService } from '../database/prisma.service';

export interface AuditEvent {
  actorId?: string;
  actorType: 'user' | 'system' | 'plugin';
  pluginId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, boolean | number | string | null>;
}

const SENSITIVE_FRAGMENTS = [
  'password',
  'passwd',
  'secret',
  'token',
  'authorization',
  'bearer',
  'jwt',
  'apikey',
  'api_key',
  'credential',
  'cookie',
];
const MAX_METADATA_ENTRIES = 50;

function sanitizeMetadata(
  metadata: Record<string, boolean | number | string | null> | undefined,
): Record<string, boolean | number | string | null> | undefined {
  if (!metadata) return undefined;
  const entries = Object.entries(metadata).slice(0, MAX_METADATA_ENTRIES);
  const out: Record<string, boolean | number | string | null> = {};
  for (const [key, value] of entries) {
    const normalized = key.toLowerCase();
    if (SENSITIVE_FRAGMENTS.some((fragment) => normalized.includes(fragment))) continue;
    out[key] = typeof value === 'string' ? value.slice(0, 1024) : value;
  }
  return out;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(event: AuditEvent, request?: Request): Promise<void> {
    const forwarded = request?.get('x-forwarded-for');
    const requestIp = typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : request?.ip;
    const userAgent = request?.get('user-agent');

    await this.prisma.client.auditLog.create({
      data: {
        actorId: event.actorId,
        actorType: event.actorType,
        pluginId: event.pluginId,
        action: event.action,
        targetType: event.targetType,
        targetId: event.targetId,
        metadata: sanitizeMetadata(event.metadata),
        ipHash: requestIp ? hashForAudit(requestIp) : undefined,
        userAgent: userAgent?.slice(0, 256),
      },
    });
  }
}
