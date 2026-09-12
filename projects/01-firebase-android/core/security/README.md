# core/security

Inicializacao de App Check para o cliente Android.

## App Check (obrigatorio)

- `appCheckInit.kt::init(app, providerFactory)` e chamado em
  `MainApplication.onCreate()`.
- O source set debug fornece `DebugAppCheckProvider` (o token aparece no
  logcat); o source set release fornece `PlayIntegrityAppCheckProvider`.
- `getDebugToken()` renova e retorna o token de App Check como texto.

## Audit log

As Rules bloqueiam escrita direta em `/audit_logs`. Use
`core/functions/src/audit.ts` a partir de uma callable para toda auditoria;
nao existe helper Android que prometa uma escrita que as Rules recusam.

## Custom claims (role, permissions[])

Definidos **apenas** via Admin SDK no backend:

```ts
import { getAuth } from 'firebase-admin/auth';

await getAuth().setCustomUserClaims(uid, {
  role: 'member',
  permissions: ['read:users', 'write:finance_entries'],
});
```

Client so le os claims (`Auth.role`, `Auth.permissions`).