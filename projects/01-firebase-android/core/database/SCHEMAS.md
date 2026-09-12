# core/database - SCHEMAS

Colecoes canonicas do Firestore. **Nao criar outras sem mover para plugin**.

## `/users/{uid}`

Documento do usuario. So o dono le/escreve (admin pode deletar).

| Campo | Tipo | Descricao |
|---|---|---|
| `display_name` | string | Nome exibido |
| `email` | string | E-mail (mirror de Auth) |
| `locale` | string | `pt-BR` ou `en` |
| `created_at` | timestamp | serverTimestamp |
| `updated_at` | timestamp | serverTimestamp |

## `/plugin_manifests/{pluginId}`

Manifesto espelhado de cada plugin (registrado pelo `pluginsRegistry`).

| Campo | Tipo | Descricao |
|---|---|---|
| `id` | string | igual ao doc id |
| `name` | string | nome humano |
| `version` | string | semver |
| `coreMinVersion` | string | semver |
| `permissions` | array<string> | permissoes exigidas |
| `status` | string | `active` / `disabled` |
| `created_at` | timestamp | serverTimestamp |

## `/audit_logs/{logId}`

Append-only. Escrito por Cloud Functions. Leitura so admin.

| Campo | Tipo | Descricao |
|---|---|---|
| `actor_id` | string | uid ou `system` |
| `actor_type` | string | `user` / `system` / `plugin` |
| `plugin_id` | string? | id do plugin (se aplicavel) |
| `action` | string | ex: `user.login`, `plugin.finance.entry.create` |
| `target_type` | string? | ex: `finance_entry` |
| `target_id` | string? | id do recurso |
| `metadata` | map<string, any>? | payload livre (sem PII) |
| `ip` | string? | IP do caller (extraido do request) |
| `user_agent` | string? | UA |
| `created_at` | timestamp | serverTimestamp |

## `/finance/...` (exemplo de plugin)

Path de plugin. Colecoes sao declaradas no manifesto. Plugin eh responsavel
por documentar seus schemas em `plugins/<id>/SCHEMAS.md`.