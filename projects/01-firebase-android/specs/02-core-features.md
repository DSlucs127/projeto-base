# 02-core-features

Capacidades implementadas pelo core deste scaffold. Plugins consomem estes
contratos; uma capacidade nao listada aqui deve ser implementada no plugin que
a requer.

## Auth

- `core/auth/Auth.kt` oferece cadastro/login por email e senha, login anonimo,
  logout, estado de sessao via `Auth.userState` e refresh de ID token.
- O cliente le `role` e `permissions`; somente a callable
  `setUserClaims` usa Admin SDK para gravar custom claims.
- Google, Apple e backoff de refresh nao possuem implementacao neste template.

## Database

- Schemas canonicos vivem em `core/database/SCHEMAS.md`.
- `core/database/FirestoreRepository.kt` e o contrato CRUD tipado para
  colecoes explicitamente autorizadas.
- Auditoria e escrita somente pelo backend em
  `core/functions/src/audit.ts`; as Rules bloqueiam o cliente em
  `/audit_logs`.

## Security e i18n

- `core/security/appCheckInit.kt` instala o provider recebido da variante e
  obtem token renovado para debug.
- Os providers ficam nos source sets Android: Debug App Check em debug e Play
  Integrity em release.
- `core/i18n/I18n.kt` resolve recursos Android pelo locale atual.
- `core/functions/src/translate.ts` localiza erros de Functions a partir dos
  dicionarios registrados por plugins.

## Functions e plugins

- `core/functions/src/index.ts` exporta `api` e `setUserClaims`, com App Check.
- `core/functions/src/pluginsRegistry.ts` resolve callables registradas no
  boot. `scripts/bundle-plugins.mjs` gera os imports de plugins ativos antes da
  compilacao.
- O template nao tem plugin ativo nem callable de dominio; `api` relata essa
  condicao explicitamente.

## Design system e Storage

- `design-system/src/main/kotlin/` contem o tema Compose e componentes
  `DSButton`, `DSCard` e `DSTextField`.
- Este checkout fornece Rules de Storage, mas nao um `StorageRepository` ou
  fluxos de upload. Implemente-os em um plugin quando necessarios.
