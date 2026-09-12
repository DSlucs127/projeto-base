# Core i18n

Backend: `core/api/src/i18n/`; frontend: `app/public/locales/`.

`pt-BR` e `en` sao obrigatorios. APIs derivam o idioma de `Accept-Language`;
o frontend usa `useI18n()`. Execute `pnpm validate:i18n` sempre que uma chave
for criada ou renomeada.
