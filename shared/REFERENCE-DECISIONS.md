# Decisões técnicas e referências

Referências oficiais usadas para escolher os contratos dos dois templates.

| Tema | Decisão no template | Referência |
| --- | --- | --- |
| Tauri mobile | Biblioteca com `staticlib`, `cdylib`, `rlib` e entrypoint mobile separado | [Tauri v2 mobile](https://v2.tauri.app/develop/) |
| Tauri security | Capabilities explícitas, apenas `core:default` | [Tauri capabilities](https://v2.tauri.app/security/capabilities/) |
| Prisma | Criptografia aplicada por Client Extension, não middleware legado | [Prisma Client Extensions](https://www.prisma.io/docs/orm/prisma-client/client-extensions) |
| NestJS | Helmet, validation pipe, guard de autenticação e throttling | [NestJS security](https://docs.nestjs.com/security/helmet) |
| PostgreSQL | `pgcrypto` no schema de banco e acesso apenas na rede interna | [PostgreSQL pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html) |
| Firebase | App Check, Firestore/Storage Rules fail-closed, Play Integrity no Android | [Firebase App Check](https://firebase.google.com/docs/app-check/android/play-integrity-provider) |

As referências dão a direção técnica; as specs de cada projeto são os
contratos operacionais locais e devem ser atualizadas junto da implementação.
