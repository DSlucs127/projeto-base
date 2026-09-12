# Changelog - 01-firebase-android

Todas as mudancas deste projeto devem ser registradas aqui.

Formato: [Mantido em pt-BR/en conforme padrao do shared/I18N-KEYS.json].

## [Unreleased]

### Added
- Estrutura inicial de core (auth, database, security, i18n, functions)
- Plugins template com `plugin.json` + schema JSON
- Android Gradle Kotlin (Compose + Hilt + Firebase BoM)
- Design system Android (tokens + DSButton/DSCard/DSTextField)
- Validators (i18n, plugins, security) + Docker Compose para emuladores
- `tools/scripts/agent-sync.ts` para sincronizar o estado de AGENT.md
- Gradle Wrapper 8.5 completo em `app/android` (`gradlew`, `gradlew.bat` e
  `gradle/wrapper/gradle-wrapper.jar`)

### Security
- Default deny em `firestore.rules` e `storage.rules`
- App Check (Play Integrity) inicializado em `MainApplication`
- Audit logs canonicos pelo helper de Cloud Functions

### Fixed
- Android Gradle agora inclui `:design-system`, mapeia os fontes Kotlin de
  `core/` e aplica Google Services com configuracao documentada para debug e
  release.
- O unico bundle Functions inicializa o Admin SDK antes do acesso lazy ao
  Firestore e registra plugins ativos antes de rotear `api`.
- Firebase Hosting e o codebase `plugins` inexistentes foram removidos.
- Validators ESM usam `import.meta.url`; o install na raiz instala todos os
  workspaces documentados.
