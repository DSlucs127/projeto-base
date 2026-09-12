# Template de plugin

Copie esta pasta para `../<seu-id>/` e personalize.

Pontos de edicao:

1. `plugin.json` - trocar `id`, `name`, `version`, `permissions`.
2. `functions/src/index.ts` - implementar callables.
3. `locales/*.json` - strings em pt-BR + en.
4. (opcional) `app/src/android/...` - UI Android do plugin.

O backend do plugin nao e um codebase Firebase independente. `npm run build`
gera o import do modulo definido por `plugin.json.functions.module` e o
empacota em `core/functions`. Exporte o nome definido em
`plugin.json.functions.register` (o template usa `registerPlugin`).