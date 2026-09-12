# Core API

API NestJS versionada em `/v1`, com autenticação por padrão. Apenas
`POST /v1/auth/register`, `POST /v1/auth/login`, `POST /v1/auth/refresh`,
`POST /v1/auth/logout` e `GET /v1/health` usam `@Public()`.

## Comandos

```bash
pnpm --filter @template/api prisma:generate
pnpm --filter @template/api prisma:migrate
pnpm --filter @template/api dev
pnpm --filter @template/api test
```

## Segurança

- Início falha se variáveis obrigatórias, secrets JWT, chave AES-256 ou CORS
  não forem válidos.
- Todas as entradas passam por `ValidationPipe` whitelist.
- Prisma cifra `User.displayName` antes de gravar e decifra somente após ler.
- Sessions guardam hash Argon2id do refresh token, nunca o token puro.
- `AuditService` usa HMAC para IP e não registra email, senha ou token.

## Migrations

A migration inicial ativa `pgcrypto`, cria users/sessions/audit_logs e índices.
Em produção, o container executa `pnpm prisma:deploy` antes de iniciar Nest.
