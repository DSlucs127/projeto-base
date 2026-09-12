import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const requirements: Array<[string, RegExp, string]> = [
  ['core/api/src/main.ts', /helmet\(/, 'Helmet is not enabled'],
  ['core/api/src/main.ts', /app\.enableCors\(/, 'CORS is not configured'],
  ['core/api/src/main.ts', /forbidNonWhitelisted:\s*true/, 'validation is not fail-closed'],
  ['core/api/src/database/prisma-crypto.extension.ts', /aes-256-gcm/, 'AES-256-GCM is absent'],
  ['core/api/src/database/prisma-crypto.extension.ts', /DATA_ENCRYPTION_KEY/, 'encryption key validation is absent'],
  ['core/api/src/auth/auth.service.ts', /argon2id/, 'Argon2id is absent'],
  ['core/api/src/auth/auth.controller.ts', /CsrfOriginGuard/, 'cookie routes lack origin protection'],
  ['.gitignore', /^\.env$/m, '.env is not ignored'],
];
const errors: string[] = [];

for (const [relativePath, expected, message] of requirements) {
  const file = path.join(root, relativePath);
  if (!existsSync(file)) {
    errors.push(`${relativePath}: file is missing`);
    continue;
  }
  if (!expected.test(readFileSync(file, 'utf8'))) {
    errors.push(`${relativePath}: ${message}`);
  }
}

const compose = readFileSync(path.join(root, 'docker-compose.yml'), 'utf8');
const dbSection = compose.split('\n  api:')[0] ?? '';
if (!/networks: \[internal\]/.test(dbSection) || /^\s+ports:/m.test(dbSection)) {
  errors.push('docker-compose.yml: PostgreSQL must be internal-only and have no published port');
}

if (errors.length > 0) {
  for (const error of errors) console.error(`[security] ${error}`);
  process.exit(1);
}
console.log('security OK');
