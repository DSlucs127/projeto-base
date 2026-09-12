# 00-architecture

Visao geral da arquitetura do projeto **01-firebase-android**.

## 1. Diagrama de camadas

```
+---------------------------------------------------------+
|                      app/android                         |
|  (Kotlin + Compose/Views, consome Firebase + Cloud Fns)   |
+----------------------------+----------------------------+
                             |
                             v
+---------------------------------------------------------+
|                    Cloud Functions Node                  |
|   core/functions (bundle default + registrars de plugins) |
|   (auth, App Check, pluginsRegistry)                      |
+----------------------------+----------------------------+
                             |
                             v
+---------------------------------------------------------+
|                  Firebase (provedor gerenciado)           |
|   Auth | Firestore (+ Rules) | Storage (+ Rules) | App    |
|   Check                                                      |
+---------------------------------------------------------+
```

## 2. Core fixo (nao mexer)

- `core/auth/`      - contratos de Auth (papel, custom claims, refresh).
- `core/database/`  - schemas canonicos Firestore.
- `core/security/`  - App Check helpers + audit log helper.
- `core/i18n/`      - chaves carregadas em runtime.
- `core/functions/` - entrypoint do Functions, pluginsRegistry.

## 3. Plugins

Cada plugin mora em `plugins/<id>/`. Um plugin pode ter:

- `functions/` (codigo TS que se registra em `pluginsRegistry`).
- `app/android/...` (Activities/Fragments/componentes Android do plugin).
- `locales/` (pt-BR.json, en.json se for puramente web).
- `plugin.json` (manifesto).

## 4. Fluxo de boot

1. `npm run build` le os manifestos dos plugins ativos e gera imports estaticos
   para seus modulos TypeScript no bundle `core/functions`.
2. `firebase deploy --only functions` sobe somente esse codebase `default`.
3. Depois de `initializeApp()`, `bootPlugins()` registra cada registrar no
   mesmo `pluginsRegistry` usado pelo callable `api`.
4. Sem plugin ativo, nenhuma callable de dominio existe e `api` retorna um
   erro explicito de precondicao em vez de prometer uma rota.

## 5. Decisoes

- **Sem servidor nosso** - Firebase gerencia Auth, DB, Storage e Functions. Custo e escopo de seguranca delegados para o provedor.
- **App Check obrigatorio** - protege contra abuso de API keys.
- **i18n em pt-BR + en** - via strings.xml duplicado.
- **Plugins compilam juntos** - todos os modulos ativos de
  `plugins/<id>/functions/src` entram no unico bundle Functions `default`; nao
  ha codebase `plugins` separado ou estado em memoria entre codebases.
- **Sem Hosting** - como nao existe `app/web`, `firebase.json` nao declara
  Hosting nem emulador de Hosting.