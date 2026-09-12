# NEW-PROJECT - Duplicar um template para um projeto novo

Guia para **humanos e agentes de IA** criarem um projeto a partir deste
repositorio. Dois caminhos: automatico (recomendado) e manual.

## 1. Escolha o template

| Template | Use quando |
|---|---|
| `projects/02-tauri-fullstack` | app web + desktop (Tauri v2) + mobile com backend proprio (NestJS + Prisma + PostgreSQL em VPS) |
| `projects/01-firebase-android` | app Android puro, backend 100% Firebase (Auth/Firestore/Functions) |

## 2. Caminho automatico (1 comando)

A partir da raiz deste repositorio:

```bash
node shared/new-project.mjs \
  --from projects/02-tauri-fullstack \
  --to ../meu-app \
  --slug meu-app \
  --theme ocean
```

O script:

1. Copia o template (sem `node_modules`, builds, `.env` e segredos).
2. Renomeia identificadores (`@template/*` -> `@meu-app/*`, nomes de package,
   titulos de README/AGENT).
3. Aplica um tema do catalogo `shared/design-system/THEMES.md`
   (default, ocean, forest, sunset, mono).
4. Imprime o checklist final.

`--slug` e opcional (padrao: nome da pasta de destino) e deve ser kebab-case.

## 3. Caminho manual

```bash
# 1. Copie
Copy-Item -Recurse projects/02-tauri-fullstack ../meu-app

# 2. Renomeie identificadores em todos os arquivos de texto:
#    "02-tauri-fullstack" -> "meu-app"
#    "tauri-fullstack-template" -> "meu-app-template"
#    "@template/" -> "@meu-app/"
#    (no 01: "01-firebase-android" e "firebase-android-template")

# 3. Instale e valide
cd ../meu-app
pnpm install            # (02) ou: npm install (01)
pnpm validate           # (02) ou: npm run validate (01)
```

## 4. Pos-instalacao (checklist obrigatorio)

1. `git init` + primeiro commit.
2. **02**: copie `.env.example` para `.env`, gere e preencha
   `DATABASE_URL` e todas as chaves obrigatorias; rode `pnpm install`.
   **01**: coloque o `google-services.json` real (release + debug) em
   `app/android/app/`; rode `npm install`.
3. Renomeie metadata do app:
   - **02**: `app/src-tauri/tauri.conf.json` (`productName`, `identifier`).
   - **01**: `namespace`/`applicationId` no `app/android/build.gradle.kts`
     e pacotes Kotlin (`app.template.firebase` -> seu pacote).
4. **Identidade visual**: escolha um tema
   (`node ../../shared/design-system/sync-tokens.mjs --theme <nome>`) ou crie
   o seu em `shared/design-system/themes/<marca>.json` (guia em THEMES.md).
   O core nao muda; so os tokens.
5. **Dominio**: reescreva as locales `pt-BR.json`/`en.json` (e `strings.xml`)
   com as strings do seu produto. As chaves atuais sao exemplos do template.
6. Rode todos os validadores (`shared/AI-ONBOARDING.md`, secao 3).
7. Apague do novo projeto o que nao for usar e registre o bootstrap no
   `specs/CHANGELOG.md`.

## 5. Depois de criar: contratando um agente de IA

Cole isto no inicio da conversa com o agente (GLM, MiniMax, etc.):

```text
Voce trabalha no projeto <meu-app> (copiado do template <02|01>).
Leia e siga OBRIGATORIAMENTE, nesta ordem:
1. shared/AI-ONBOARDING.md (regras absolutas, loops e formato de resposta)
2. AGENT.md do projeto
3. specs/00-architecture.md e a spec do modulo da tarefa
Regras que nunca mudam: core fechado (feature nova = plugin), i18n pt-BR/en,
design system so com tokens/temas, segredos nunca commitados, specs/CHANGELOG
append-only, entrega so com todos os validadores verdes.
Tarefa: <descreva a tarefa>
```

## 6. Manutencao dos templates

Melhorias feitas direto em `projects/01-...` ou `projects/02-...` (e em
`shared/`) beneficiam todos os projetos futuros. Projetos ja criados sao
donos do proprio codigo: sincronize melhorias manualmente quando fizer sentido.
