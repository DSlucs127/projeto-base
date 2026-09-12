# DESIGN-TOKENS

Tokens visuais canonicos. Todo projeto (web, mobile, Android) **deve** consumir estes tokens via `tailwind.config.ts`, `:root` CSS, ou tokens Android. Nada de valor hardcoded espalhado pelo codigo.

## 1. Cores

### Marca

| Token | Light | Dark | Uso |
|---|---|---|---|
| `color.primary` | `#0B5FFF` | `#7BB0FF` | acoes primarias |
| `color.primary-hover` | `#004BCC` | `#A8CBFF` | hover do primario |
| `color.on-primary` | `#FFFFFF` | `#001A41` | texto/ic over o primario |

### Superficie e texto

| Token | Light | Dark | Uso |
|---|---|---|---|
| `color.background` | `#F6F7FB` | `#0A0B0E` | fundo principal |
| `color.surface` | `#FFFFFF` | `#101114` | cartoes, paineis |
| `color.ink` | `#101114` | `#E8EAF0` | texto principal |
| `color.muted` | `#5F6573` | `#B3B8C7` | texto secundario |
| `color.border` | `#D9DCE5` | `#353946` | bordas |

### Semantica

| Token | Light | Dark | Uso |
|---|---|---|---|
| `color.danger` | `#D7263D` | `#FF6B7A` | erro (Android: `ds_color_error`) |

> Sucesso/alerta/info serao adicionados ao catalogo quando a primeira tela
> precisar deles; enquanto isso, nao use valores ad-hoc.

## 2. Tipografia

| Token | Valor |
|---|---|
| `font.family.sans` | `Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| `font.family.mono` | `JetBrains Mono, ui-monospace, SFMono-Regular, monospace` |
| `font.size.xs` | `12px` |
| `font.size.sm` | `14px` |
| `font.size.base` | `16px` |
| `font.size.lg` | `18px` |
| `font.size.xl` | `20px` |
| `font.size.2xl` | `24px` |
| `font.size.3xl` | `30px` |
| `font.size.4xl` | `36px` |
| `font.weight.regular` | `400` |
| `font.weight.medium` | `500` |
| `font.weight.semibold` | `600` |
| `font.weight.bold` | `700` |
| `font.lineHeight.tight` | `1.25` |
| `font.lineHeight.normal` | `1.5` |
| `font.lineHeight.relaxed` | `1.75` |

## 3. Espacamento (escala 4px)

| Token | Valor |
|---|---|
| `space.0` | `0` |
| `space.1` | `4px` |
| `space.2` | `8px` |
| `space.3` | `12px` |
| `space.4` | `16px` |
| `space.5` | `20px` |
| `space.6` | `24px` |
| `space.8` | `32px` |
| `space.10` | `40px` |
| `space.12` | `48px` |
| `space.16` | `64px` |

## 4. Raio

| Token | Valor |
|---|---|
| `radius.sm` | `4px` |
| `radius.md` | `8px` |
| `radius.lg` | `12px` |
| `radius.xl` | `16px` |
| `radius.full` | `9999px` |

## 5. Sombra

| Token | Valor |
|---|---|
| `shadow.sm` | `0 1px 2px 0 rgba(0,0,0,0.05)` |
| `shadow.md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)` |
| `shadow.lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)` |
| `shadow.card` | `0 1px 3px rgba(16,17,20,0.12)` |

## 6. Movimento

| Token | Valor |
|---|---|
| `motion.fast` | `120ms ease-out` |
| `motion.base` | `180ms ease-out` |
| `motion.slow` | `240ms ease-out` |

## 7. Z-index

| Token | Valor |
|---|---|
| `z.dropdown` | `1000` |
| `z.sticky` | `1100` |
| `z.modal` | `1300` |
| `z.toast` | `1400` |

## 8. Fonte da verdade e sincronizacao

`shared/design-system/tokens.json` e a **fonte da verdade**. Os arquivos
nativos sao **gerados** a partir dele e nunca editados a mao:

| Projeto | Arquivo gerado | Comando (na raiz do projeto) |
|---|---|---|
| Tauri fullstack | `design-system/src/tokens.css` | `pnpm tokens:sync` |
| Firebase Android | `app/android/app/src/main/res/values*/colors.xml` | `npm run tokens:sync` |

Os scripts chamam `node ../../shared/design-system/sync-tokens.mjs`. Se voce
precisa de um token novo, adicione-o em `tokens.json`, rode os dois comandos
e commita tudo junto.

### Temas (cores por projeto)

Temas prontos trocam apenas as cores, sem tocar em codigo: veja
[`design-system/THEMES.md`](./design-system/THEMES.md) — presets `default`,
`ocean`, `forest`, `sunset` e `mono`.

```bash
# a partir da raiz de um projeto (auto-detecta web e/ou Android):
node ../../shared/design-system/sync-tokens.mjs --theme ocean
# ou: pnpm theme -- --theme ocean   /   npm run theme -- --theme ocean
# tema local ao projeto: --theme-file ./meu-tema.json
```

### Nomes gerados

- Web: `--ds-color-<token>` (kebab-case), `--ds-radius-*`, `--ds-shadow-card`.
- Android: `ds_color_<token>` em `values/` (light) e `values-night/` (dark);
  `color.danger` vira `ds_color_error` e `color.ink` vira `ds_color_on_surface`.

### Tailwind (projeto Tauri web)

`tailwind.config.ts` mapeia as custom properties nas chaves `colors`.