# core/

Codigo canonico do sistema. **Nenhuma regra de negocio aqui**.

| Subdir | Conteudo |
|--------|----------|
| `auth/` | `Auth.kt` - wrapper Firebase Auth + claims |
| `database/` | `SCHEMAS.md` + `FirestoreRepository.kt` - CRUD canonico |
| `security/` | `appCheckInit.kt` - inicializacao de App Check no Android |
| `i18n/` | `I18n.kt` - resolver de strings + `t()` |
| `functions/` | Cloud Functions Node 20 + `pluginsRegistry` |

Toda extensao deve ser um **plugin** declarado em `plugins/<id>/plugin.json`.
No Android, `app/android/app/build.gradle.kts` mapeia os fontes Kotlin deste
diretorio para o source set do app. No backend, `core/functions` e o unico
codebase Firebase e compila os registrars dos plugins ativos no mesmo bundle.