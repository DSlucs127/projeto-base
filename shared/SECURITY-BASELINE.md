# SECURITY-BASELINE

Baseline de seguranca que vale para **todos** os projetos desta raiz.

## 1. Principios

1. **Defense in depth**: seguranca em camadas (rede, app, dados).
2. **Fail closed**: padrao e negar; permitir explicitamente.
3. **Least privilege**: cada modulo/plugin recebe o minimo de permissao possivel.
4. **Audit everything**: acoes sensiveis viram linhas em `audit_logs`.
5. **Encrypt at rest + in transit**: TLS em transito, AES-256-GCM em repouso.

## 2. Criptografia em repouso (Postgres)

- Habilitar extensao `pgcrypto` via migration inicial.
- Colunas marcadas como sensiveis passam por **Prisma Client Extension** que:
  - Criptografa com **AES-256-GCM**.
  - Persiste `iv`, `auth_tag` e `ciphertext` em colunas separadas (ou em uma coluna JSON com prefixo `enc:v1:`).
  - Chave vem de `process.env.DATA_ENCRYPTION_KEY` (32 bytes, base64).
- Campos sensiveis sao declarados por **lista explicita** na extension (ex.:
  `USER_ENCRYPTED_FIELDS` em `core/api/src/database/prisma-crypto.extension.ts`
  do projeto Tauri). Novo campo sensivel = nova entrada na lista + migration +
  teste de round-trip. Comentarios `/// @encrypted` no schema Prisma servem
  apenas como documentacao; a extension nao interpreta comentarios.
- Rotacao de chave: o prefixo `enc:v1:` embute a versao do formato. A tabela
  `key_versions` (`id`, `key`, `created_at`, `retired_at`) e o caminho planejado
  para rotacao, mas **ainda nao faz parte do template** - implemente-a antes de
  precisar rotacionar chaves em producao.

Exemplo minimo de uso:

```ts
// src/database/prisma-crypto.extension.ts
import { Prisma, PrismaClient } from '@prisma/client';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const PREFIX = 'enc:v1:';

function getKey(): Buffer {
  const raw = process.env.DATA_ENCRYPTION_KEY ?? '';
  const buf = Buffer.from(raw, 'base64');
  if (buf.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must decode to 32 bytes');
  }
  return buf;
}

function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString('base64')}.${tag.toString('base64')}.${ct.toString('base64')}`;
}

function decrypt(payload: string): string {
  if (!payload.startsWith(PREFIX)) return payload;
  const [, ivB64, tagB64, ctB64] = payload.slice(PREFIX.length).split('.');
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const pt = Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]);
  return pt.toString('utf8');
}

export const cryptoExtension = Prisma.defineExtension((client) =>
  client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // exemplo: aplicar em colunas conhecidas
          return query(args);
        },
      },
    },
  }),
);
```

> A extension real e gerada por convencao (lista de colunas marcadas). Os projetos conretos especializam.

## 3. Criptografia em transito

- **Tauri (fullstack)**: nginx/Traefik com TLS automatico (Let's Encrypt) na frente do container da API.
- **Firebase**: App Check + Security Rules + Identity Platform.
- **Android**: Network Security Config forca TLS 1.2+ e desativa cleartext.

## 4. Autenticacao

- Senhas: bcrypt com cost >= 12, ou argon2id (preferido).
- Tokens: access token JWT curta duracao (15 min) + refresh token longa duracao em cookie HttpOnly/Secure/SameSite=Strict.
- 2FA slot no core (TOTP).
- Bloqueio por tentativa (rate limit por IP e por usuario).

## 5. Autorizacao

- Roles canonicas: `admin`, `member`, `guest`.
- Plugin declara `permissions` no manifesto. Core expoe guard `PermissionGuard`.
- Toda rota publica precisa estar listada explicitamente; default e `Authenticated`.

## 6. Headers e HTTP

- `helmet` ativo (CSP, HSTS, X-Frame-Options DENY, etc).
- `throttler` ativo (limite por IP/rota).
- CORS fechado para origens conhecidas via env.
- CSRF para rotas state-changing com cookie auth.

## 7. Firebase (projeto 01)

- API keys podem ser publicas **apenas** se acompanhadas de Security Rules + App Check.
- App Check (Play Integrity no Android, reCAPTCHA Enterprise na web).
- Rules bloqueiam leitura/escrita por padrao; abrimos apenas paths explicitamente permitidos.
- Cloud Functions validam App Check token em **toda** callable.

## 8. Auditoria

Tabela/colecao `audit_logs` grava:

- `actor_id`, `actor_type` (`user` | `system` | `plugin`)
- `plugin_id` (se aplicavel)
- `action` (`user.login`, `user.password.reset`, `plugin.finance.entry.create`)
- `target_type`, `target_id`
- `metadata` (json)
- `ip`, `user_agent`
- `created_at`

## 9. Segredos

- `.env.example` so com placeholders.
- `.env` real nunca commitado.
- Em producao, montar via secrets manager (Doppler, Vault, AWS SSM).
- Rotacao documentada por chave.

## 10. Checklist pre-PR

- [ ] `pnpm validate:security` verde
- [ ] Nenhum `console.log` com PII
- [ ] Nenhum secret novo no historico git
- [ ] Regras/permissions revisadas se houver mudanca de autorizacao