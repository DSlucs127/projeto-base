# Core Auth

O codigo executavel esta em `core/api/src/auth/`. Este contrato e fechado:

- Argon2id para senha (minimo 12 caracteres).
- Access JWT curto no header Bearer.
- Refresh JWT rotacionado, hash Argon2id no PostgreSQL e cookie HttpOnly.
- Roles `admin`, `member`, `guest`; permissions `recurso:acao`.

Plugins consomem identidade e permissoes por guard/decorator; eles nunca
emitem tokens, leem hashes de senha ou alteram sessoes diretamente.
