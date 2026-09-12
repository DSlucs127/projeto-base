# core/i18n

Padrao de i18n pt-BR + en.

## Em Android

- `values/strings.xml` (padrao, pt-BR)
- `values-en/strings.xml` (ingles)

## Em Cloud Functions

```ts
import { tr } from './translate';
throw new HttpsError('unauthenticated', tr(req, 'auth.error.invalid'));
```

## Validator

```bash
npm run validate:i18n
```

Compara `values/strings.xml` e `values-en/strings.xml` com o catalogo canonico
em [`shared/I18N-KEYS.json`](../../../shared/I18N-KEYS.json).
Falha se alguma chave faltar em qualquer lado.

## Mapeamento de chaves

Resource names do Android nao aceitam pontos. A conversao canonica e `.` -> `_`:

| Catalogo (`I18N-KEYS.json`) | Resource (`strings.xml`) |
| --- | --- |
| `app.name` | `app_name` |
| `auth.login.title` | `auth_login_title` |
| `errors.404` | `errors_404` |

Os valores em `strings.xml` devem ser identicos aos do catalogo; o validator
compara chave e valor nos dois locales.