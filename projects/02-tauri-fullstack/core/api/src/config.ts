import { createHash } from 'node:crypto';

const requiredEnvironment = [
  'DATABASE_URL',
  'DATA_ENCRYPTION_KEY',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

export function assertRuntimeConfiguration(): void {
  const missing = requiredEnvironment.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const encryptionKey = Buffer.from(process.env.DATA_ENCRYPTION_KEY ?? '', 'base64');
  if (encryptionKey.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must be a base64 value decoding to exactly 32 bytes');
  }

  for (const name of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if ((process.env[name] ?? '').length < 32) {
      throw new Error(`${name} must contain at least 32 characters`);
    }
  }

  const origins = allowedOrigins();
  if (origins.length === 0) {
    throw new Error('APP_ORIGINS must contain at least one allowed origin');
  }
}

export function allowedOrigins(): string[] {
  return (process.env.APP_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function configurationFingerprint(): string {
  return createHash('sha256')
    .update(`${process.env.DATABASE_URL ?? ''}|${process.env.APP_ORIGINS ?? ''}`)
    .digest('hex')
    .slice(0, 12);
}
