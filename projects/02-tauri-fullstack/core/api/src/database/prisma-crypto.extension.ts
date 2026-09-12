import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from 'node:crypto';

import { Prisma, PrismaClient } from '@prisma/client';

const ALGORITHM = 'aes-256-gcm';
const PREFIX = 'enc:v1:';
const USER_ENCRYPTED_FIELDS = ['displayName'] as const;
const WRITE_OPERATIONS = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
]);

type UnknownRecord = Record<string, unknown>;

function isPlainRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function encryptionKey(): Buffer {
  const key = Buffer.from(process.env.DATA_ENCRYPTION_KEY ?? '', 'base64');
  if (key.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must decode to exactly 32 bytes');
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${PREFIX}${iv.toString('base64')}.${authTag.toString('base64')}.${ciphertext.toString('base64')}`;
}

export function decrypt(payload: string): string {
  if (!payload.startsWith(PREFIX)) {
    return payload;
  }

  const parts = payload.slice(PREFIX.length).split('.');
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    throw new Error('Encrypted payload is malformed');
  }

  const ivBase64 = parts[0];
  const tagBase64 = parts[1];
  const ciphertextBase64 = parts[2];
  if (!ivBase64 || !tagBase64 || !ciphertextBase64) {
    throw new Error('Encrypted payload is malformed');
  }
  const decipher = createDecipheriv(
    ALGORITHM,
    encryptionKey(),
    Buffer.from(ivBase64, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tagBase64, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextBase64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

export function hashForAudit(value: string): string {
  return createHmac('sha256', encryptionKey()).update(value).digest('hex');
}

function transformWriteData(value: unknown, fields: readonly string[]): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => transformWriteData(entry, fields));
  }
  if (!isPlainRecord(value)) {
    return value;
  }

  const copy: UnknownRecord = { ...value };
  for (const field of fields) {
    const current = copy[field];
    if (typeof current === 'string' && !current.startsWith(PREFIX)) {
      copy[field] = encrypt(current);
    }
  }
  return copy;
}

function transformArguments<T>(args: T, fields: readonly string[]): T {
  if (!isPlainRecord(args)) {
    return args;
  }

  const copy: UnknownRecord = { ...args };
  if ('data' in copy) copy.data = transformWriteData(copy.data, fields);
  if ('create' in copy) copy.create = transformWriteData(copy.create, fields);
  if ('update' in copy) copy.update = transformWriteData(copy.update, fields);
  return copy as T;
}

function transformReadResult<T>(value: T, fields: readonly string[]): T {
  if (Array.isArray(value)) {
    return value.map((entry) => transformReadResult(entry, fields)) as T;
  }
  if (!isPlainRecord(value)) {
    return value;
  }

  const copy: UnknownRecord = { ...value };
  for (const field of fields) {
    const current = copy[field];
    if (typeof current === 'string' && current.startsWith(PREFIX)) {
      copy[field] = decrypt(current);
    }
  }
  for (const [key, current] of Object.entries(copy)) {
    if (key !== 'metadata') {
      copy[key] = transformReadResult(current, fields);
    }
  }
  return copy as T;
}

/**
 * Encrypts the schema fields explicitly marked `@encrypted` before Prisma
 * writes, and decrypts them only after reads. This is intentionally scoped to
 * User until another field is documented and added to the registry.
 */
export const cryptoExtension = Prisma.defineExtension((client) =>
  client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const fields = model === 'User' ? USER_ENCRYPTED_FIELDS : [];
          const operationArgs = WRITE_OPERATIONS.has(operation)
            ? transformArguments(args, fields)
            : args;
          const result = await query(operationArgs);

          return transformReadResult(result, fields);
        },
      },
    },
  }),
);

export function createEncryptedPrismaClient() {
  return new PrismaClient().$extends(cryptoExtension);
}

export type EncryptedPrismaClient = ReturnType<typeof createEncryptedPrismaClient>;
