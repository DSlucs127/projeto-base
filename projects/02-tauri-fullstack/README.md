# 02-tauri-fullstack

Template para um produto responsivo com **web, desktop e mobile**, preservando
um unico frontend React/Vite e distribuindo-o por **Tauri v2**. O backend
nativo e **NestJS + Prisma + PostgreSQL**, pronto para VPS via Docker Compose
e Caddy com TLS automatico.

## Arquitetura

```text
app/ (React/Vite/Tauri) ──HTTPS──> Caddy ──> core/api (NestJS) ──> PostgreSQL
       │                                      │
       └── design-system/                      └── core: auth/security/db/i18n/plugins
                                                           │
                                                        plugins/<id>/
```

O **core e fechado**: somente auth, security, database, i18n, design system e
registry de plugins pertencem a ele. Qualquer regra de negocio e uma aplicacao
interna em `plugins/<id>/`, registrada por manifesto.

## Inicio local

```bash
corepack enable
pnpm install
cp .env.example .env
# Preencha DATABASE_URL e todas as chaves obrigatorias.
pnpm --filter @template/api prisma:generate
pnpm --filter @template/api prisma:migrate
pnpm dev
```

- Web: `http://localhost:1420`
- API health: `http://localhost:3000/v1/health`
- Desktop: `pnpm tauri dev`

## Deploy em VPS

1. Aponte `APP_DOMAIN` para o IP da VPS.
2. Copie `.env.example` para `.env`, gere os segredos e preencha valores reais.
3. Rode `pnpm docker:up`; Caddy obtem e renova TLS automaticamente.
4. Verifique `https://<APP_DOMAIN>/api/v1/health` com `pnpm smoke`.

Nunca exponha PostgreSQL ou a porta interna da API para a internet. Apenas
Caddy publica `80/443`.

## Estrutura

| Pasta | Responsabilidade |
| --- | --- |
| `specs/` | Contratos vivos e changelog append-only |
| `core/api/` | API NestJS, Prisma e os modulos obrigatorios |
| `core/auth`, `core/security`, `core/database`, `core/i18n` | Documentacao dos contratos do core |
| `plugins/` | Aplicacoes internas isoladas por manifesto |
| `app/` | React, Vite e adaptador Tauri v2 |
| `design-system/` | Tokens e componentes reutilizaveis |
| `tools/` | Validadores, sincronizador do AGENT e smoke test |
| `api/`, `database/` | Pontos de entrada documentais para a API e schema canonicos |

Leia [`AGENT.md`](./AGENT.md) antes de implementar qualquer feature.
