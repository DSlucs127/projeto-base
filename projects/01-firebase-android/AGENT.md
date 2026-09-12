# AGENT.md - 01-firebase-android

> Regras do projeto. Rode `npm run agent:sync` depois de alterar a configuracao
> de deploy ou a estrutura Android; o bloco de estado abaixo e atualizado pelo
> script.

## Identidade

- Nome: **01-firebase-android**
- Stack: Firebase (Auth, Firestore, App Check, Storage, Cloud Functions Node 20) + Android Kotlin
- Core version: `1.0.0`
- Plugin manifest schema: [`plugins/_template/plugin.schema.json`](./plugins/_template/plugin.schema.json)

## Regras deste projeto

1. Toda logica de negocio vai em **plugin** dentro de `plugins/<id>/`. O core
   contem apenas contratos, seguranca e o bootstrap.
2. Android (`app/android/`) consome Firebase e Cloud Functions; nao implementa
   regra de negocio.
3. Toda callable passa por `assertAppCheck` e usa `enforceAppCheck: true`.
4. Firestore e Storage negam acesso por padrao. Libere apenas paths explicitamente listados.
5. Toda string de UI vai em `app/android/app/src/main/res/values/strings.xml`
   e `values-en/strings.xml`.
6. Nunca commite `google-services.json`, keystores ou segredos.

<!-- generated-state:start -->
## Estado gerado

- Android inclui `:design-system` e mapeia `../../../core` como fonte Kotlin do app.
- Firebase deploya um unico codebase Functions (`default`, `core/functions`); Hosting nao e configurado neste template.
- `npm run build` gera os registrars dos plugins ativos no bundle Functions padrao antes de compilar.
- O template nao contem plugins ativos: `api` responde claramente que nenhum callable foi empacotado ate que um plugin seja adicionado e o deploy seja refeito.
<!-- generated-state:end -->

## Caminho unico obrigatorio (DO)

- **Auth**: Firebase Auth (email/password e anonimo; provedores adicionais
  exigem plugin/configuracao).
- **Database**: Firestore com colecoes canonicas em `core/database/SCHEMAS.md`.
- **Seguranca**: App Check (Play Integrity em release) e Security Rules.
- **i18n**: `strings.xml` e helper em `core/i18n/I18n.kt`.
- **Design system**: tokens e componentes em `design-system/`.
- **Plugins**: cada plugin ativo fornece `functions/src/*.ts`; o build Functions
  gera imports estaticos para o bundle `default`.

## Regra de plugin (DO NOT)

Se uma feature nao cabe no core:

1. Crie `plugins/<id>/` com `plugin.json`, `functions/src/index.ts` e, se
   necessario, UI em `app/src/android/...`.
2. Exporte o registrar nomeado em `plugin.json.functions.register`.
3. Mantenha `plugin.json.functions.module` apontando para
   `./functions/src/<arquivo>.ts`.
4. Declare as permissoes e os paths de Firebase no manifesto e nas Rules.
5. Rode `npm run validate:plugins` e `npm run build`; redeploy Functions para
   ativar a nova callable.

Nao existe codebase Functions separado para plugins, nem descoberta dinamica de
modulos em producao. O registrador e empacotado junto com `core/functions`, o
que garante que `api` e os plugins compartilhem o mesmo registry.

## Verificacao

```bash
npm install
npm run typecheck
npm test
npm run build
npm run validate
npm run agent:sync
```

O smoke requer Firebase CLI e emuladores em execucao; nao e uma validacao
offline. O Gradle Wrapper 8.5 completo esta disponivel neste checkout: use
`./gradlew` (macOS/Linux) ou `gradlew.bat` (Windows) em `app/android`. JDK 17,
Android SDK configurado e um `app/android/app/google-services.json` local com
clientes release e debug continuam obrigatorios.

## Auto-alimentacao

1. Adicione uma entrada em `specs/CHANGELOG.md`.
2. Atualize estas regras se o contrato ou uma restricao mudar.
3. Rode `npm run agent:sync`.
4. Em repositorios Git, inclua `AGENT.md` e o changelog na mesma mudanca.

## Links

- [`README.md`](./README.md)
- [`specs/00-architecture.md`](./specs/00-architecture.md)
- [`specs/03-plugin-contract.md`](./specs/03-plugin-contract.md)
- [`specs/04-security.md`](./specs/04-security.md)
- [`plugins/README.md`](./plugins/README.md)
