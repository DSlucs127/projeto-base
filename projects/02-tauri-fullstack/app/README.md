# app/

Frontend React/Vite/Tailwind responsivo e wrapper Tauri v2.

- `src/` contem apenas UI, i18n e cliente HTTP.
- `public/locales/` contem todos os textos obrigatorios pt-BR/en.
- `src-tauri/` encapsula o mesmo build para desktop e mobile.
- `design-system/` fornece tokens e componentes: o app nao declara cores ou
  componentes de base paralelos.

```bash
pnpm dev:app
pnpm tauri dev
pnpm --filter @template/app build
```
