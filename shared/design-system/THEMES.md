# THEMES - Presets de tema

Temas prontos que trocam **apenas as cores** de todo o design system (web CSS
custom properties + Android `colors.xml` light/dark), sem tocar em codigo.

## Presets disponiveis

| Tema | Vibe | Uso tipico |
|---|---|---|
| `default` | Azul neutro | padrao do repositorio |
| `ocean` | Ciano/petroleo, frio | produtividade, dashboards |
| `forest` | Verde calmo | saude, financas, sustentabilidade |
| `sunset` | Laranja quente | lifestyle, comida, social |
| `mono` | Preto/branco | B2B, documentos, minimalismo |

## Como aplicar (a partir da raiz do projeto)

```bash
# Web + Android de uma vez (auto-detecta o tipo do projeto):
node ../../shared/design-system/sync-tokens.mjs --theme ocean

# Ou via script do projeto:
pnpm tokens:sync -- --theme ocean    # 02-tauri-fullstack
npm run tokens:sync -- --theme ocean # 01-firebase-android
```

## Como criar um tema novo (ex.: `brand-x`)

1. Copie `themes/default.json` para `themes/brand-x.json`.
2. Troque apenas os valores hex de `color.light` e `color.dark`. Mantenha as
   9 chaves em cada modo: `primary`, `primaryHover`, `onPrimary`, `surface`,
   `background`, `ink`, `muted`, `border`, `danger`.
3. Garanta contraste: `onPrimary` sobre `primary` >= 4.5:1 (WCAG AA) nos dois
   modos; `ink` sobre `background` e `surface` idem.
4. Aplique com `--theme brand-x` e rode os validadores do projeto
   (`pnpm validate` / `npm run validate`).
5. Adicione o preset na tabela acima.

`tokens.json` continua sendo a fonte da verdade para **tipografia,
espacamento, raios, sombras, motion e z-index**; temas substituem somente
`color.light` e `color.dark`.
