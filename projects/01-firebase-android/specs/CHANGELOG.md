# CHANGELOG

Append-only. Toda feature nova adiciona uma entrada. Formato:

```
## YYYY-MM-DD - <resumo>
- tipo: feat | fix | chore | docs | refactor
- plugin: <id do plugin> | core | n/a
- arquivos: <principais arquivos>
- impacto: <resumo do efeito>
- quebra?: sim/nao (se sim, como migrar)
```

## 2026-09-12 - templates replicaveis: temas de design system, scaffold e onboarding de IA
- tipo: feat
- plugin: core
- arquivos: ../../shared/design-system/themes/*, ../../shared/design-system/THEMES.md, ../../shared/design-system/sync-tokens.mjs, ../../shared/new-project.mjs, ../../shared/AI-ONBOARDING.md, ../../shared/NEW-PROJECT.md, package.json, ../../shared/DESIGN-TOKENS.md, ../../README.md
- impacto: sync-tokens aceita --theme/--theme-file e gera colors.xml light/night
  a partir de 5 presets; novo script `theme`; `shared/new-project.mjs`
  instancia novos projetos Android ja renomeando ids; guias AI-ONBOARDING e
  NEW-PROJECT para agentes de IA.
- quebra?: nao

## 2026-09-12 - tooling de lint
- tipo: chore
- plugin: core
- arquivos: eslint.config.mjs, package.json, .gitignore, shared/CONVENTIONS.md
- impacto: adiciona ESLint flat config (typescript-eslint + import + security)
  com scripts `lint`/`lint:fix` na raiz; .gitignore cobre `.eslintcache`.
- quebra?: nao

## 2026-01-01 - bootstrap inicial
- tipo: chore
- plugin: n/a
- arquivos: AGENT.md, README.md, firebase.json, firestore.rules, storage.rules, specs/*
- impacto: estrutura inicial do template.
- quebra?: nao

## 2026-09-11 - remediacao do checkout Firebase Android
- tipo: fix
- plugin: core
- arquivos: app/android/*.gradle.kts, core/functions/*, core/security/appCheckInit.kt, firebase.json, tools/scripts/*, README.md, AGENT.md
- impacto: checkout passa a ter caminho documentado para configurar Firebase,
  compilar Android e empacotar plugins no unico codebase Functions.
- quebra?: sim (plugins deixam de ter codebase Firebase independente; use
  `functions/src/*.ts`, `npm run build` e deploy do codebase `default`).
## 2026-09-11 - saneamento do template (tokens, i18n, seguranca, git)
- tipo: fix
- plugin: core
- arquivos: .gitignore, tools/scripts/check-i18n.ts, tools/scripts/check-security.ts, core/functions/src/index.ts, core/functions/src/audit.ts, app/android/app/src/main/res/values*/{strings,colors}.xml, plugins/_template/{plugin.json,plugin.schema.json}, package.json, specs/*
- impacto: adiciona .gitignore (node_modules/lib/builds fora do repo); check-i18n
  passa a validar o catalogo compartilhado de verdade (flatten + mapeamento
  ponto->underscore + valores exatos); check-security varre callables de plugins;
  setUserClaims valida role contra allowlist e permissoes contra padrao
  `recurso:acao`; sanitizacao de metadata cobre mais fragmentos sensiveis;
  manifesto de plugin unifica `coreMinVersion` (camelCase); strings.xml alinhadas
  ao catalogo compartilhado; colors.xml gerados a partir de
  shared/design-system/tokens.json via `npm run tokens:sync`.
- quebra?: sim (manifestos com `core_min_version` snake_case devem renomear para
  `coreMinVersion`; strings.xml antigas devem ser regeneradas pelo catalogo).
