# Tools

Para desenvolvimento nativo Windows:

```powershell
.\scripts\dev.ps1
```

O script instala dependencias, gera o Prisma Client, aplica migrations locais e
inicia API + Vite. Use `-SkipMigrate` apenas se a migration ja foi aplicada
deliberadamente.

Para VPS, use os comandos `pnpm docker:*` descritos na raiz.

## Validadores (`scripts/`)

| Comando | Garante |
| --- | --- |
| `pnpm validate:i18n` | Chaves/tipos identicos em pt-BR e en, inclusive plugins |
| `pnpm validate:plugins` | Manifestos reais contra o JSON Schema, entrypoint existente |
| `pnpm validate:security` | Baseline de headers, crypto, auth, origem e rede interna |
| `pnpm validate:agent` | Estado gerado do `AGENT.md` sincronizado |
| `pnpm smoke` | API publicada responde `status=ok` |

Os validadores falham com codigo diferente de zero; nao suprima erros.
