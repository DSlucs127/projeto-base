# AGENT.md - 02-tauri-fullstack

> Fonte operacional para agentes. Este arquivo e regenerado por `pnpm agent:sync`;
> apenas o bloco `local-edits` pode receber regras locais persistentes.

## Identidade

- **Nome:** 02-tauri-fullstack
- **Stack:** React + Vite + Tailwind + Tauri v2; NestJS + Prisma + PostgreSQL
- **Core version:** `1.0.0`
- **Plugin manifest:** [`plugins/_template/plugin.schema.json`](./plugins/_template/plugin.schema.json)

## Caminho unico obrigatorio

1. `core/api/` e o unico backend: auth, autorizacao, seguranca, PostgreSQL,
   i18n e registry de plugins vivem nele.
2. `app/` e o unico cliente: UI usa `design-system/`, `useI18n()` e
   `app/src/lib/api.ts`; nao fala com PostgreSQL diretamente.
3. Funcionalidade de dominio nao listada no core **obrigatoriamente** e um
   plugin em `plugins/<id>/`, com manifest validado, permissoes explicitas e
   arquivos `pt-BR` e `en`.
4. Dados sensiveis usam `CryptoService` + Prisma Client Extension (AES-256-GCM).
   Segredos vem de `.env`; o servidor deve falhar ao iniciar sem chaves validas.
5. Nao crie strings de interface em codigo. Toda chave existe em
   `app/public/locales/pt-BR.json` e `app/public/locales/en.json`.
6. Especificacoes em `specs/` sao a fonte de verdade e `specs/CHANGELOG.md` e
   append-only: toda alteracao funcional atualiza ambos antes de finalizar.

## Fluxo obrigatorio para qualquer feature

1. Ler `specs/00-architecture.md`, `specs/03-plugin-contract.md` e a spec do
   modulo afetado.
2. Decidir se pertence ao core. Se nao for auth, security, database, i18n,
   design system ou registry, criar/alterar somente um plugin.
3. Implementar tipado, com validacao de input, autorizacao e auditoria quando
   houver mudanca de estado.
4. Atualizar pt-BR, en, specs e changelog.
5. Rodar todos os loops abaixo. Corrigir falhas; nunca declarar entrega pronta
   com loop falho.
6. Rodar `pnpm agent:sync` e incluir o AGENT.md regenerado na entrega.

## Loops de auto-verificacao

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm validate:i18n
pnpm validate:security
pnpm validate:plugins
pnpm validate:agent
cp .env.example .env  # preencher valores reais antes de subir
pnpm docker:up
pnpm smoke
```

## Entrega funcional obrigatoria

Uma entrega nao esta pronta sem codigo compilavel, testes relevantes, build,
validadores, smoke test, specs/CHANGELOG atualizados e nenhuma chave/PII
exposta. Nao use TODO, mock silencioso ou fallback de sucesso para substituir
integracao, erro ou seguranca real.

<!-- generated:start -->
## Estado gerado

- Core version: `1.0.0`
- Plugins ativos: 0
- Hash specs/manifests: `51463846831a`

_Nenhum plugin ativo._
<!-- generated:end -->

<!-- local-edits:start -->
<!-- local-edits:end -->
