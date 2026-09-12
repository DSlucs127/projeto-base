# AI-ONBOARDING

Instrucoes operacionais para **qualquer agente de IA** (GLM, MiniMax, Claude,
GPT, Gemini, Copilot ou outro) trabalhar neste repositorio sem quebrar o core.
Siga as secoes **na ordem**. Nao pule etapas. Se algo nao estiver listado aqui,
a resposta padrao e: **nao faca; pergunte.**

## 0. Regras absolutas (nunca violar)

1. **Core e fechado.** Nada de regra de negocio dentro de `core/`, `app/`,
   `api/` ou `functions/`. Feature nova = plugin novo em `plugins/<id>/`.
2. **Nao edite arquivos gerados**: `design-system/src/tokens.css`,
   `colors.xml`, `core/functions/src/generatedPlugins.ts`, `dist/`.
   Edite a fonte (`shared/design-system/tokens.json` ou `themes/*.json`) e
   rode o gerador.
3. **Nao commite segredos**: `.env`, `google-services.json`, keystores,
   chaves. Exemplos ficam em `*.example`.
4. **Toda string de UI** existe em `pt-BR` E `en` (locales ou strings.xml).
   Sem texto hardcoded em codigo.
5. **specs/ e a verdade.** Mudou comportamento? Atualize a spec afetada e
   faca uma entrada append-only em `specs/CHANGELOG.md`.
6. **Nunca declare entrega pronta com validador vermelho.** Corrija ate verde.

## 1. Sequencia obrigatoria de boot (toda sessao)

```
1. Leia <projeto>/AGENT.md            -> regras e estado do projeto
2. Leia <projeto>/specs/00-architecture.md -> fronteiras do sistema
3. Leia a spec do modulo que voce vai tocar (02-core-features, 03-plugin-contract,
   04-security, 05-i18n)
4. Rode os validadores ANTES de comecar: pnpm validate (ou npm run validate)
   -> se ja estiver vermelho, pare e reporte; nao "conserte" sem autorizacao.
```

## 2. Como implementar qualquer tarefa

```
1. Classifique: a tarefa pertence ao core (auth, security, database, i18n,
   design system, registry) ou a um dominio de negocio?
   -> negocio: crie/edite plugins/<id>/ com plugin.json valido.
2. Implemente tipado (TS estrito) ou no padrao do arquivo vizinho.
3. Adicione testes quando houver logica nova (vitest no 02; validators no 01).
4. i18n: adicione a chave em pt-BR E en nos dois arquivos de locales.
5. Design: use SOMENTE tokens do design system (--ds-* / ds_color_* /
   temas de shared/design-system/themes/). Nada de hex solto.
6. Atualize specs/CHANGELOG.md (append-only) e rode pnpm/npm agent:sync.
7. Rode TODOS os loops de verificacao (secao 3). Fix ate verde.
```

## 3. Loops de verificacao (rodar sempre, na ordem)

| Projeto | Comando |
|---|---|
| 02-tauri-fullstack | `pnpm lint && pnpm typecheck && pnpm test && pnpm validate` |
| 01-firebase-android | `npm run lint && npm run typecheck && npm run validate` |

Interpretacao de falha:

- `lint` vermelho -> corrija o codigo (nao desative a regra sem justificar no
  changelog).
- `validate:i18n` -> chave faltando em pt-BR ou en.
- `validate:security` -> regra de seguranca violada; leia a mensagem inteira.
- `validate:plugins` -> manifest fora do schema (`plugins/_template/plugin.schema.json`).
- `typecheck` -> erro de tipos; nunca use `any` para "resolver".

## 4. Design system: como mudar visual sem tocar em codigo

- Catalogo de temas: `shared/design-system/THEMES.md`
  (default, ocean, forest, sunset, mono).
- Aplicar um tema, a partir da raiz do projeto:
  `node ../../shared/design-system/sync-tokens.mjs --theme ocean`
- Criar tema de marca: copie `themes/default.json`, troque os hex, mantenha as
  9 chaves por modo, aplique e valide contraste (AA).
- Tipografia/espacamento/raio/sombra/motion vivem em
  `shared/design-system/tokens.json` e valem para todos os projetos.

## 5. Duplicar este repositorio para um projeto novo

```bash
node shared/new-project.mjs --from projects/02-tauri-fullstack --to ../meu-app --slug meu-app --theme ocean
```

Passo a passo completo: `shared/NEW-PROJECT.md`.

## 6. Formato de resposta esperado do agente

Ao terminar uma tarefa, reporte:

1. O que mudou (arquivos + motivo).
2. Resultado dos loops (colar o resumo final de cada comando).
3. Entrada adicionada ao `specs/CHANGELOG.md`.
4. O que ficou pendente e por que.

## 7. Erros comuns de IA (proibidos aqui)

- Criar `components/MinhaFeature.tsx` fora de plugin/design system.
- Adicionar coluna/rota/guard no core para atender uma feature.
- "Consertar" validador desativando regra ou apagando teste.
- Misturar idioma: codigo/commits em ingles, UI em pt-BR + en, docs pt-BR.
- Dizer "pronto" com loop vermelho ou sem changelog.
