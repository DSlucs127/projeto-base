# Plugins

Cada subpasta (exceto `_template`) representa uma aplicacao interna. Comece
copiando `_template`, atualize o manifesto e valide:

```bash
pnpm validate:plugins
pnpm validate:i18n
```

O core descobre manifests validos, carrega o entrypoint backend declarado
(`backend/*.js`, CommonJS puro) no boot e filtra plugins e rotas pelas
permissoes do usuario autenticado. O plugin deve declarar cada permissao que
exige; permissao ausente significa que o plugin nao aparece para o usuario.
