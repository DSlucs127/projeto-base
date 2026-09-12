# 01-firebase-android

Template de projeto Android com Firebase. Cloud Functions e o unico backend
gerenciado; nao ha Hosting ou aplicacao web neste checkout.

## Stack

- Firebase Auth (email/password e anonimo; provedores adicionais exigem plugin/configuracao)
- Firestore + Security Rules + indexes
- App Check (Play Integrity)
- Cloud Storage + Security Rules
- Cloud Functions Node 20 (TypeScript, callable HTTPS)
- Android Kotlin (Compose + Views), XML resources, Gradle KTS
- Design system proprio consumindo `shared/DESIGN-TOKENS.md`
- i18n pt-BR + en via `strings.xml` em duas pastas

## Quickstart

```bash
# 1. Instalar dependencias Node do template (Functions + validators)
npm install

# 2. Validar e compilar o bundle Functions
npm run validate
npm run build

# 3. Instalar a CLI Firebase quando for usar emuladores ou deploy
npm i -g firebase-tools

# 4. Login e selecionar projeto
firebase login
firebase use --add

# 5. Subir emulador local (Auth, Firestore, Functions, Storage)
docker compose -f tools/docker-compose.emulator.yml up -d
firebase emulators:start --import=./.emu-data --export-on-exit=./.emu-data

# 6. Deploy (nao ha Hosting neste template)
firebase deploy --only functions,firestore,storage
```

## Configuracao Android obrigatoria

O Google Services plugin esta aplicado ao modulo `app`. Antes de abrir ou
compilar o app, no mesmo projeto Firebase:

1. Registre as duas aplicacoes Android: `app.template.firebase` (release) e
   `app.template.firebase.debug` (debug).
2. Baixe um `google-services.json` que contenha **as duas** entradas `client`.
3. Salve o arquivo real em
   `app/android/app/google-services.json`, ao lado de
   [`google-services.json.example`](./app/android/app/google-services.json.example).
   O arquivo real e ignorado e nao deve ser commitado.
4. Configure o provider App Check de cada app: Play Integrity para release e o
   token de Debug App Check para desenvolvimento/emulador.

O checkout inclui o Gradle Wrapper 8.5 completo (`gradlew`, `gradlew.bat` e
`gradle/wrapper/gradle-wrapper.jar`). Para usá-lo, continuam obrigatórios:

- JDK 17;
- Android SDK configurado; e
- o `app/android/app/google-services.json` local descrito acima, com os
  clientes release e debug.

Depois:

```bash
cd app/android
# macOS/Linux
./gradlew :app:assembleDebug
# Windows
gradlew.bat :app:assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

O build inclui `:design-system` explicitamente e mapeia os contratos Kotlin de
`core/` para o source set do app; nenhum checkout externo e necessario.

## Functions e plugins

`firebase.json` deploya apenas `core/functions` como codebase `default`.
`npm run build` le os plugins ativos em `plugins/<id>/`, gera seus imports
estaticos no bundle default e compila tudo junto. Assim `api` e os registrars
compartilham o mesmo registry em memoria. Sem plugins ativos (como neste
template), `api` informa que nenhum callable foi empacotado; ele nao promete
rotas inexistentes.

## Estrutura

```
01-firebase-android/
├── AGENT.md              # guardrails (estado sincronizado por agent:sync)
├── README.md
├── firebase.json         # config CLI
├── firestore.indexes.json
├── firestore.rules       # regras de seguranca Firestore
├── storage.rules         # regras de seguranca Storage
├── specs/                # verdade do sistema (sempre atualizar)
├── core/                 # auth, database, security, i18n, functions
├── plugins/              # plugins isolados (cada feature aqui)
├── app/android/          # projeto Android
├── design-system/        # tokens + componentes Android
└── tools/                # validators + scripts + emulator compose
```

## Filosofia

> Core obrigatorio + plugins isolados. Nada de feature solta em `core/`, `app/` ou `functions/`.

Veja [`AGENT.md`](./AGENT.md) para guardrails e [`plugins/README.md`](./plugins/README.md) para o contrato de plugin.