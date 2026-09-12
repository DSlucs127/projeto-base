# Projeto base

Repositorio de **templates-base** para dois tipos de projeto, ambos com a mesma filosofia:

- **Core fixo e obrigatorio** (auth, seguranca, banco, i18n, design tokens).
- **Plugins isolados** que se acoplam ao core via manifesto (`plugin.json`).
- **Specs vivas** que descrevem a verdade do sistema.
- **AGENT.md auto-alimentado** com guardrails e loops de auto-verificacao.
- **i18n pt-BR + en** obrigatorios.
- **Deploy VPS-ready** via Docker Compose.

> Qualquer coisa fora do core **tem** que ser um plugin. Sem excecoes.

## Projetos

| Caminho | Stack | Quando usar |
|---|---|---|
| [`projects/01-firebase-android/`](./projects/01-firebase-android/AGENT.md) | Firebase (Auth/Firestore/Storage/Cloud Functions Node) + Android Kotlin | Apps moveis Android puros, sem servidor proprio. |
| [`projects/02-tauri-fullstack/`](./projects/02-tauri-fullstack/AGENT.md) | Tauri v2 + React/Vite/Tailwind + NestJS + Prisma + PostgreSQL | Apps desktop + mobile + web, com backend proprio em VPS. |

## Camada compartilhada

[`shared/`](./shared/) guarda convencoes que valem para os dois projetos:

- `AGENT-TEMPLATE.md` - modelo do AGENT.md com guardrails e loops.
- `SECURITY-BASELINE.md` - baseline de seguranca (AES-256-GCM, pgcrypto, App Check, helmet, CSRF).
- `DESIGN-TOKENS.md` - tokens visuais canonicos.
- `I18N-KEYS.json` - chaves i18n pt-BR/en.
- `CONVENTIONS.md` - naming, commits, branches, PR, versionamento de plugins.
- `REFERENCE-DECISIONS.md` - referencias oficiais que fundamentam as escolhas
  de Tauri v2, Prisma, NestJS, PostgreSQL e Firebase.

## Quickstart: criar um projeto novo

```powershell
# Automatico (copia, renomeia identificadores e aplica um tema visual):
node shared/new-project.mjs --from projects/02-tauri-fullstack --to ../meu-app --slug meu-app --theme ocean
# ou
node shared/new-project.mjs --from projects/01-firebase-android --to ../meu-app-android --slug meu-app-android --theme forest

# Depois siga o checklist impresso e o guia completo:
#   shared/NEW-PROJECT.md
```

Instancia manual (equivalente ao caminho antigo):

```powershell
Copy-Item -Recurse projects\02-tauri-fullstack ..\meu-app
Set-Location ..\meu-app
pnpm install
pnpm validate
```

## Identidade visual (temas)

O design system nasce com 5 temas prontos (`default`, `ocean`, `forest`,
`sunset`, `mono`). Trocar a marca inteira (web + Android) sem tocar em codigo:

```bash
node ../../shared/design-system/sync-tokens.mjs --theme forest   # na raiz do projeto
```

Catalogo e como criar um tema de marca: [`shared/design-system/THEMES.md`](./shared/design-system/THEMES.md).

## Para agentes de IA

Qualquer IA (GLM, MiniMax, Claude, GPT...) deve comecar por
[`shared/AI-ONBOARDING.md`](./shared/AI-ONBOARDING.md): regras absolutas,
sequencia de boot, loops de validacao e formato de entrega.

## Estrutura

```
Projeto base/
├── README.md
├── shared/
└── projects/
    ├── 01-firebase-android/
    └── 02-tauri-fullstack/
```

## Filosofia em uma frase

> O core da o caminho; quem desvia vira plugin; quem ignora vira bug.