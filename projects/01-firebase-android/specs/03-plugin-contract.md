# 03-plugin-contract

## Manifesto

Todo plugin declara `plugin.json` na raiz:

```json
{
  "id": "finance.ledger",
  "name": "Finance Ledger",
  "version": "0.1.0",
  "coreMinVersion": "1.0.0",
  "description": "Controle financeiro pessoal",
  "permissions": ["read:users", "write:finance_entries"],
  "firebase": {
    "collections": ["finance_entries"],
    "storage_paths": ["plugins/finance/**"]
  },
  "functions": {
    "module": "./functions/src/index.ts",
    "register": "registerPlugin"
  },
  "android": {
    "package": "app.plugins.finance",
    "routes": ["/finance", "/finance/entry/:id"]
  },
  "i18n": {
    "pt-BR": "./locales/pt-BR.json",
    "en":    "./locales/en.json"
  }
}
```

Schema formal: [`plugins/_template/plugin.schema.json`](../plugins/_template/plugin.schema.json).

## Backend (Cloud Functions)

```ts
// plugins/finance/functions/src/index.ts
import type { PluginRegistrar } from '../../../../core/functions/src/pluginsRegistry';

export const registerPlugin: PluginRegistrar = (registry) => {
  registry.addCallable('finance.entry.create', createEntry);
  registry.addCallable('finance.entry.list',  listEntries);
};
```

`registerPlugin` e chamado por `bootPlugins()` depois de `initializeApp()`.
No build, o gerador le cada manifesto ativo e cria imports estaticos no bundle
`core/functions`. Nao existe codebase Firebase separado para plugins e um
manifesto nao ativa/desativa codigo em runtime: alteracoes de plugin exigem
`npm run build` e deploy das Functions.

## Android

Plugins podem declarar `android.package` e `routes` para documentacao e para a
integracao que o aplicativo hospedeiro implementar. Este scaffold nao fornece
um `PluginRouter`, descoberta em runtime nem uma API `/plugins/active`.
Cada plugin que precisar de UI traz suas Activities/Fragments em
`plugins/<id>/app/src/android/<package>/`.

## Permissoes

`permissions` sao strings tipo `read:users`, `write:finance_entries`. Somente
`setUserClaims` em `core/functions/src/index.ts` atribui custom claims via
Admin SDK; o cliente apenas as le.

Plugin **nao concede** permissao a si mesmo - o admin faz via painel.

## Versionamento

- `MAJOR` quebra contrato: requer migracao.
- `MINOR` adiciona capacidade retrocompativel.
- `PATCH` corrige bug.

`coreMinVersion` e validado no manifesto e documenta a compatibilidade
minima. Este scaffold ainda nao implementa bloqueio automatico de versoes em
runtime; avalie a compatibilidade antes de empacotar e fazer deploy.

## i18n por plugin

Cada plugin pode trazer seu proprio `locales/pt-BR.json` e `en.json` para seu
contrato. Este scaffold nao faz merge nem descoberta de recursos Android em
runtime; a aplicacao hospedeira deve integrar esses recursos quando adicionar a
UI do plugin.

## Auditoria

Plugin dispara `audit_logs` para acoes sensiveis via:

```ts
import { audit } from '../../../../core/functions/src/audit';
await audit(context, 'plugin.finance.entry.create', { entryId });
```