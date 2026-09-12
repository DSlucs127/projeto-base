# Core Security

Implementacao: `core/api/src/security/`.

- Helmet, validação whitelist e throttling global.
- CORS por `APP_ORIGINS`; nao existe wildcard.
- CSRF/origin guard para refresh/logout por cookie.
- `PermissionGuard` para toda extensao que exigir permissoes.
- `AuditService` faz hash HMAC do IP e limita user-agent; nunca grava tokens,
  senhas, email ou ciphertext.
