# AGENT-TEMPLATE

Este arquivo e o **modelo base** que cada `AGENT.md` de projeto importa/estende.

> **Agentes de IA (GLM, MiniMax ou qualquer outro):** leiam primeiro
> [`shared/AI-ONBOARDING.md`](./AI-ONBOARDING.md) — regras absolutas, sequencia
> de boot, loops de verificacao e formato de resposta. Este arquivo define as
> regras por projeto; o onboarding define como trabalhar.

## 1. Identidade do projeto

Preencha em cada `AGENT.md`:

- Nome:
- Stack:
- Core version:
- Plugin manifest schema:

## 2. Caminho unico obrigatorio (DO)

A IA **so pode** usar o que o core ja entrega. Lista de recursos garantidos pelo core (ajustar por projeto):

- [ ] Auth (login, refresh, OAuth, 2FA slot)
- [ ] Banco de dados (Prisma/Models canonicos)
- [ ] Seguranca (helmet, throttler, CSRF, App Check)
- [ ] i18n (pt-BR + en) via `useI18n()` / `t()`
- [ ] Design system (tokens + componentes)
- [ ] Plugins registry (carregar manifests)

## 3. Regra de plugin (DO NOT criar fora do core)

Se uma feature **nao** cabe no core, ela **obrigatoriamente** vira plugin:

1. Criar pasta `plugins/<id-do-plugin>/`
2. Criar `plugin.json` com `id`, `version`, `coreMinVersion`, permissoes,
   backend, frontend e `i18n`
3. Backend expoe o registrar no ponto de entrada declarado no manifesto
   (`registerPlugin(registry)` no Firebase; `plugin.register(registry)` no Tauri)
4. Frontend expoe rotas/componentes
5. PR valida com `pnpm validate:plugins`

**Proibido** criar arquivos de feature soltos em `core/`, `app/`, `api/`.

## 4. Loops de auto-verificacao (rodar antes de PR)

Os comandos abaixo usam `pnpm` (projeto Tauri). No projeto Firebase, use o
equivalente `npm run <script>`.

```bash
# Loop 1 - baseline
pnpm install
pnpm typecheck
pnpm test
pnpm build

# Loop 2 - i18n (chaves pt-BR + en batendo)
pnpm validate:i18n

# Loop 3 - seguranca (regras/encryption/headers)
pnpm validate:security

# Loop 4 - plugins (manifestos validos, sem imports cruzados)
pnpm validate:plugins

# Loop 5 - smoke E2E
pnpm docker:up
pnpm smoke
```

Se qualquer loop falhar, **nao merge**. Corrija ate passar.

## 5. Auto-alimentacao do AGENT.md

Ao terminar uma feature:

1. Atualizar `specs/CHANGELOG.md` (append-only, com data e resumo).
2. Se houver nova regra ou restricao, adicionar em `## 2. Caminho unico obrigatorio` ou `## 3. Regra de plugin`.
3. Rodar `pnpm agent:sync` (regenera secoes automaticas do AGENT.md a partir de specs/manifests).
4. Commitar AGENT.md + CHANGELOG.md no mesmo PR da feature.

## 6. Criterio de "entregavel funcional"

Uma feature so e considerada pronta quando:

- [ ] Codigo escrito e tipado
- [ ] Testes do core passando
- [ ] 5 loops verdes
- [ ] `specs/CHANGELOG.md` atualizado
- [ ] `AGENT.md` regenerado/sincronizado
- [ ] PR aprovado

## 7. Checklist de seguranca obrigatorio

- [ ] Toda coluna marcada como sensivel usa a extension de criptografia
- [ ] Nenhum secret commitado (usar `.env`, `.env.example` so com placeholders)
- [ ] Firebase: App Check + Security Rules revisadas
- [ ] NestJS: helmet, throttler, CSRF (se aplicavel), guards de role ativos
- [ ] Logs nao contem PII em texto puro

## 8. i18n - regra de ouro

Toda string de UI **deve** estar em ambos os arquivos `public/locales/pt-BR.json` e `en.json`. Sem fallback hardcoded em codigo. Sem ingles em commits se a string e exibida.