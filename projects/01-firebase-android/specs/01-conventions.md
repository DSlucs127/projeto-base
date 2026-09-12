# 01-conventions

Convencoes especificas deste projeto. As transversais estao em [`shared/CONVENTIONS.md`](../../../shared/CONVENTIONS.md).

## 1. Android (Kotlin)

- `compileSdk` e `targetSdk`: 34.
- `minSdk`: 24 (Android 7.0).
- Linguagem: Kotlin 1.9+.
- UI: Compose para novas telas; Views permitidas em `plugins/_legacy` se justificado.
- DI: Hilt.
- Networking: Firebase SDK + Ktor/Retrofit apenas para chamadas externas (NUNCA para Firestore).

## 2. Cloud Functions (TypeScript)

- Runtime: Node 20 (functions v2).
- TypeScript estrito.
- Cada callable valida App Check com `assertAppCheck(req)`.
- O scaffold usa validacao manual de payload nas callables existentes. Adicione
  uma biblioteca de schema somente quando uma feature precisar dela e documente
  a escolha no plugin.

## 3. Firestore

- Colecoes em `snake_case` no plural (`plugin_manifests`, `audit_logs`).
- Documentos tem sempre: `id`, `created_at`, `updated_at`, `created_by`, `updated_by`.
- Timestamps sao `serverTimestamp()`.

## 4. Storage

- Paths em `snake_case`.
- Cada usuario sobe em `users/{uid}/...`.
- Plugin sobe em `plugins/{pluginId}/...`.

## 5. Plugins

- ID em `kebab-case` ou `dotted.lower` (ex: `finance.ledger`).
- Versionamento SemVer no manifesto.
- Toda escrita em Firestore feita pelo backend via Admin SDK; client so le (a menos que a regra permita).

## 6. Commits

Conventional Commits. Veja `shared/CONVENTIONS.md`.

## 7. Testes

- Android: JUnit 4 + MockK estao configurados no modulo `app`.
- Cloud Functions: o script atual informa que ainda nao ha testes; adicione
  testes com a feature que introduzir logica.
- Integracao/e2e com emulador Firebase e Compose devem ser adicionados quando
  houver fluxo para exercitar.