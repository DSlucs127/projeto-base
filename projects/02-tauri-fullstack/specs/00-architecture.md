# 00 - Arquitetura

## Camadas

```text
React/Vite (web) ────────────────┐
Tauri v2 (desktop/mobile) ───────┼──> Caddy TLS -> NestJS API -> PostgreSQL
                                 │                       │
design-system/ <─────────────────┘                  plugins registry
                                                            │
                                                     plugins/<id>/
```

`app/` nunca acessa PostgreSQL. `core/api/` nunca renderiza UI. `plugins/`
nunca altera tabelas, guards ou contratos centrais sem passar pelos pontos de
extensao declarados.

## Core invariavel

| Modulo | Responsabilidade |
| --- | --- |
| Auth | Registro, login, refresh, JWT, papeis e permissoes |
| Security | Helmet, CORS fechado, rate limit, CSRF/origin, auditoria |
| Database | Prisma, migrations, `pgcrypto`, AES-256-GCM em campos sensiveis |
| i18n | pt-BR/en no frontend e mensagens de API por `Accept-Language` |
| Plugins registry | Descobre, valida e publica manifests autorizados |
| Design system | Tokens e componentes compartilhados pelo app |

Uma nova regra de dominio nao pode ser adicionada ao core: crie um plugin.

## Fluxo de boot

1. O container API valida todas as variaveis obrigatorias e gera o Prisma
   Client antes de iniciar.
2. A API conecta ao PostgreSQL e carrega manifests validos de `plugins/`.
3. Caddy expoe somente HTTPS para app/API; banco e API permanecem na rede
   Docker interna.
4. App web usa o endpoint same-origin `/api/v1`; builds Tauri podem apontar
   `VITE_API_BASE_URL` para a URL publica da VPS.
