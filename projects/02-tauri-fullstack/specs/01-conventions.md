# 01 - Convencoes

- TypeScript estrito; sem `any`, sem retorno de falha disfarçado de sucesso.
- API REST e versionada em `/v1`.
- JSON usa `camelCase`; banco Prisma usa `camelCase` com `@map` quando preciso.
- IDs sao UUID; datas sao ISO 8601/UTC.
- Comandos sao `pnpm`; Node LTS e pnpm declarados no `package.json`.
- Commits seguem Conventional Commits; plugins seguem SemVer.
- Toda feature atualiza a spec afetada e adiciona linha append-only em
  `specs/CHANGELOG.md`.
