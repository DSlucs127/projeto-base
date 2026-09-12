# Core Database

O schema e migrations sao `core/api/prisma/`; a extensao Prisma de
criptografia e `core/api/src/database/prisma-crypto.extension.ts`.

Ao acrescentar um campo sensivel:

1. Declare-o no schema com comentario `@encrypted`.
2. Adicione explicitamente o campo ao registry da extensao.
3. Crie migration e teste de round-trip.
4. Atualize `specs/02-core-features.md` e `specs/CHANGELOG.md`.

Plugins nao executam queries de Prisma diretamente.
