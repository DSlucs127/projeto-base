# Changelog

Formato append-only. Registre novas entradas no topo, com data UTC, escopo,
impacto de seguranca e validacoes executadas.

## 2026-09-12 - templates replicaveis: temas de design system, scaffold e onboarding de IA

- tipo: feat
- plugin: core
- arquivos: ../../shared/design-system/themes/*, ../../shared/design-system/THEMES.md, ../../shared/design-system/sync-tokens.mjs, ../../shared/new-project.mjs, ../../shared/AI-ONBOARDING.md, ../../shared/NEW-PROJECT.md, package.json, ../../shared/DESIGN-TOKENS.md, ../../README.md
- impacto: sync-tokens passa a aceitar --theme/--theme-file (5 presets: default,
  ocean, forest, sunset, mono) com auto-deteccao de saidas web/Android; novo
  script `theme`; `shared/new-project.mjs` duplica o template renomeando
  identificadores; guias AI-ONBOARDING e NEW-PROJECT padronizam o trabalho de
  agentes de IA (GLM, MiniMax ou qualquer outro).
- quebra?: nao


## 2026-09-11 - Saneamento do template (plugins executaveis, i18n, seguranca)

- Plugins backend passam a ser reais: `backend/*.js` (CommonJS puro, restrito a
  pasta do plugin) e carregado no boot com `register(registry)`; erro falha o
  boot. `src/plugin.ts` morto foi removido do template.
- `validate:plugins` passa a exigir entrypoint existente (`backend/*.js`).
- i18n da API: mensagens do core movidas para `core/i18n/locales/{pt-BR,en}.json`
  e mescladas com os locales dos plugins ativos.
- Frontend consome `/v1/plugins/routes` (`usePlugins`) e i18n recebe fallback
  canonico pt-BR sem quebrar renderizacao.
- Seguranca: CSP explicita no `tauri.conf.json`; headers (HSTS, nosniff, DENY,
  Referrer/Permissions-Policy) e CSP no Caddyfile; login com tempo constante
  contra enumeracao de email; metadata de auditoria sanitizada e limitada.
- Docker: lockfile congelado nos builds, healthchecks para api/web, locales e
  plugins copiados para a imagem de runtime.
- Estrutura: pastas vazias removidas; `tools/validators/` incorporado ao
  `tools/README.md`; `tokens:sync` gera CSS/Android a partir de
  `shared/design-system/tokens.json`.
- Validacoes: typecheck, testes e 4 validadores verdes.

## 2026-09-12 - tooling de lint, higiene de build e testes de contrato
- tipo: chore
- plugin: core
- arquivos: eslint.config.mjs, package.json, .gitignore, core/api/src/auth/dto/register.dto.spec.ts, core/api/src/i18n/i18n.service.spec.ts, app/dist (removido), core/api/dist (removido), shared/CONVENTIONS.md
- impacto: adiciona ESLint flat config (typescript-eslint + import + security) com
  scripts `lint`/`lint:fix`; .gitignore passa a cobrir `*.tsbuildinfo` e
  `.eslintcache`; artefatos de build (dist) removidos da arvore; novos testes
  Vitest cobrem validacao do RegisterDto e o comportamento do I18nService
  (locale padrao, fallback pt-BR e erro de chave ausente).
- quebra?: nao

## 2026-09-11 - Bootstrap 1.0.0

- Criada a arquitetura Tauri v2 + React/Vite + NestJS/Prisma/PostgreSQL.
- Definido core fechado, contrato de plugins, i18n pt-BR/en e design system.
- Adicionados Docker Compose, Caddy TLS, baseline de criptografia e loops de
  validacao obrigatorios.
