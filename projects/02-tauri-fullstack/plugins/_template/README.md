# Template de plugin

1. Copie `_template` para `plugins/<seu-plugin>`.
2. Troque todos os campos de exemplo em `plugin.json` e `backend/index.js`.
3. Adicione i18n identico em pt-BR/en em `locales/`.
4. Registre rotas no `register(registry)` do entrypoint e espelhe-as em
   `plugin.json` (`frontend.routes`).
5. Rode `pnpm validate:plugins`, `pnpm validate:i18n`, testes e build.

O entrypoint backend e **CommonJS puro** (`backend/*.js`), carregado pelo
registry no boot do core. Ele nao importa modulos do core, nao le segredos e
falha o boot se quebrar. O template em si nao e carregado (pastas `_` sao
ignoradas).
