# core/database

Schemas canonicos do Firestore + repository generico.

## Estrutura

- [`SCHEMAS.md`](./SCHEMAS.md) - schemas canonicos (`users`, `plugin_manifests`, `audit_logs`).
- `FirestoreRepository.kt` - CRUD generico tipado para plugins estenderem.

## Regra

Cada plugin que precisa de colecao:

1. Declara o path em `plugin.json > firebase.collections`.
2. Estende `FirestoreRepository<T>` com seu tipo de dominio.
3. Documenta schema em `plugins/<id>/SCHEMAS.md`.

Nenhum plugin le/escreve Firestore direto. Toda chamada passa por Cloud Functions
(Callable ou HTTPS) usando Admin SDK, ou pelo repository via Android.