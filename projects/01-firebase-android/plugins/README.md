# plugins/

Cada feature nova mora aqui. Cada plugin e isolado e se conecta ao core via manifesto.

## Estrutura de um plugin

```
plugins/<id-do-plugin>/
├── plugin.json            # manifesto obrigatorio
├── functions/             # Cloud Functions (Node 20, TS)
│   ├── src/
│   │   └── index.ts       # exporta registerPlugin
├── app/src/android/...    # (opcional) Activities/Fragments Android
├── locales/
│   ├── pt-BR.json
│   └── en.json
└── README.md
```

## Manifesto

Veja [`_template/plugin.json`](./_template/plugin.json) e o schema em
[`_template/plugin.schema.json`](./_template/plugin.schema.json).

## Como criar um plugin novo

1. Copie `_template/` para `plugins/<seu-id>/` (kebab-case).
2. Renomeie o id em `plugin.json`.
3. Implemente `registerPlugin` em `functions/src/index.ts`.
4. Adicione rotas/Activities se houver UI.
5. Adicione permissoes em `firebase.permissions` (declare-as tambem no `firestore.rules`).
6. Rode `npm run validate:plugins` e `npm run build`.
7. Faca `firebase deploy --only functions` para ativar as callables.

O template tem **um unico** codebase Functions (`core/functions`, `default`).
Durante `npm run build`, `core/functions/scripts/bundle-plugins.mjs` le cada
manifesto ativo, gera imports estaticos e compila seus fontes no mesmo bundle
que exporta `api`. Portanto, nao crie `plugins/package.json` nem tente
deployar um codebase separado: ele nao compartilharia o registry em memoria.

`functions.module` deve apontar para um arquivo TypeScript sob
`./functions/src/`, e `functions.register` deve ser o export nomeado desse
arquivo. Dependencias backend adicionais pertencem a
`core/functions/package.json`, pois todo plugin e compilado pelo bundle unico.

## Sem plugins ativos

Este template entrega somente `_template/`, que e ignorado pelo bundler.
Enquanto nao houver um plugin real, `api` retorna `failed-precondition`
explicando que nenhum callable foi empacotado. Nao existe API
`/plugins/active` neste scaffold.

## Nao faca

- Nao crie Cloud Functions ou Activities soltas fora de `plugins/<id>/`.
- Nao registre o mesmo `callable` duas vezes.
- Nao adicione chaves i18n que nao estejam em `locales/pt-BR.json` e `locales/en.json`.