# CONVENTIONS

Convencoes que valem para **todos** os projetos desta raiz.

## 1. Linguagens e formatacao

- **TypeScript estrito** em qualquer codigo Node/browser (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Prettier** com config na raiz do repositorio (`.prettierrc`: `printWidth: 100`, `singleQuote: true`, `semi: true`).
- **ESLint**: ambos os templates empacotam um `eslint.config.mjs` na raiz com `typescript-eslint`, `eslint-plugin-import` e `eslint-plugin-security`. Rode `pnpm lint` (02) ou `npm run lint` (01) antes de todo commit; inclua `lint` no pipeline quando ele existir.

## 2. Naming

- Pastas: `kebab-case`.
- Arquivos TS: `kebab-case.ts` (exceto classes de framework que exigem `PascalCase.ts`, ex: `AppModule.ts`).
- Classes: `PascalCase`.
- Variaveis/funcoes: `camelCase`.
- Constantes: `UPPER_SNAKE_CASE`.
- Tabelas Postgres: `snake_case` no plural (`users`, `plugin_manifests`).
- Colecoes Firestore: `snake_case` no plural.

## 3. Branches

- `main` - producao.
- `develop` - integracao.
- `feat/<plugin-id>-<slug>` - nova feature.
- `fix/<slug>` - bugfix.
- `chore/<slug>` - tarefas sem mudanca de comportamento.

## 4. Commits (Conventional Commits)

```
feat(plugins): add finance.ledger plugin
fix(auth): handle refresh token race
chore(deps): bump prisma to 5.x
docs(specs): update 04-security with key rotation flow
```

## 5. PR

- Titulo: `<scope>: <resumo>`.
- Body: link da issue + checklist dos 5 loops.
- 1+ reviewer.
- Sem commits `wip` no historico (use `git rebase -i` antes).

## 6. Versionamento de plugins

`plugin.json.version` segue **SemVer**:

- `MAJOR`: quebra contrato do core.
- `MINOR`: nova capacidade retrocompativel.
- `PATCH`: fix retrocompativel.

`coreMinVersion` (camelCase em ambos os projetos) impede carregar plugins
incompativeis. O runtime do projeto Tauri falha o boot se violar; no projeto
Firebase a compatibilidade e verificada pelos validadores antes do build.

## 7. Testes

- Unitarios no core: meta de >= 80% coverage em `auth`, `database`, `i18n`,
  `security`. O template entrega o modulo `security` do projeto Tauri testado;
  amplie a suite conforme cada modulo evoluir - PRs novos nao podem reduzir
  a cobertura existente.
- E2E: pelo menos 1 happy path por projeto (`pnpm smoke` / `npm run smoke`).
- Testes de contrato: cada plugin declara contrato de entrada/saida e o core valida no boot.

## 8. Documentacao

- Toda nova capacidade publica atualiza `specs/02-core-features.md` ou `specs/03-plugin-contract.md`.
- Mudanca de regra de seguranca atualiza `specs/04-security.md` + `AGENT.md`.
- Toda chave i18n nova entra em `shared/I18N-KEYS.json` e nos arquivos do projeto.