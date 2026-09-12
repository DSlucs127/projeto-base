# 03 - Contrato de plugins

Cada plugin e uma aplicacao interna em `plugins/<id>/`:

```text
plugins/<id>/
├── plugin.json
├── backend/index.js      # CommonJS puro, carregado no boot
├── locales/pt-BR.json
└── locales/en.json
```

`plugin.json` precisa declarar id, SemVer, `coreMinVersion`, permissoes,
rotas frontend e entrypoint backend (`backend/*.js`). IDs usam pontos, por
exemplo `finance.expenses`; permissoes usam `recurso:acao`.

No boot, o core valida o manifesto, carrega o entrypoint e chama
`register(registry)` — o registry expoe apenas `addRoute`. Qualquer erro
falha o boot (fail closed). O entrypoint e CommonJS puro, restrito a pasta do
plugin, sem sandbox: nao importa clientes de banco, ignora guards, nao adiciona
middleware global e nao usa segredos fora da configuracao do core. Extensao
mais rica que isso precisa virar modulo revisado do core. O usuario recebe
apenas plugins para os quais possui todas as permissoes exigidas.

`pnpm validate:plugins` valida todos os manifests fora de `_template`,
incluindo a existencia e o formato do entrypoint backend.
