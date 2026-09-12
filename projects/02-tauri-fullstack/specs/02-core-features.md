# 02 - Features do core

## Auth

- Cadastro, login, refresh e logout.
- Password hash Argon2id.
- Access JWT de 15 min; refresh JWT rotacionado, armazenado em cookie
  `HttpOnly`, `Secure`, `SameSite=Strict`.
- Papeis: `admin`, `member`, `guest`; permissoes sao strings `recurso:acao`.

## Security

- Helmet, CORS por allowlist, throttling e validacao global whitelist.
- Rotas que usam cookie e alteram estado verificam `Origin` contra `APP_ORIGINS`.
- Auditoria guarda ator, acao, alvo, metadados nao sensiveis e data.

## Database

- PostgreSQL 16, Prisma e extensao `pgcrypto`.
- Campos identificados como `@encrypted` no schema sao cifrados com
  AES-256-GCM antes de persistir.
- A chave e base64 de exatamente 32 bytes e nunca e registrada em logs.

## i18n

- `pt-BR` e `en` obrigatorios. Frontend carrega JSON em `app/public/locales/`.
- API escolhe idioma por `Accept-Language`, com `pt-BR` como fallback.
