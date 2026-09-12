# Core Plugins Registry

O registry executavel esta em `core/api/src/plugins/`. No boot ele:

1. Descobre `plugin.json` em `plugins/<id>/` (ignora pastas `_` e ocultas).
2. Valida forma, permissoes e compatibilidade com a versao do core.
3. Carrega o entrypoint backend declarado (`backend/*.js`, **CommonJS puro**,
   restrito a pasta do plugin) e chama `register(registry)` — o registry
   expoe apenas `addRoute`. Qualquer erro **falha o boot** (fail closed).
4. Carrega os arquivos i18n do plugin e os expoe ao `I18nService`.

Limites de seguranca do entrypoint: ele roda in-process, sem sandbox. Nao
importa modulos do core (`@nestjs/*`, Prisma), nao le segredos e nao adiciona
middleware global. Codigo de plugin que exigir mais que `addRoute` precisa ser
promovido a modulo revisado do core.
