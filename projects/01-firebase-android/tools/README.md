# Tools

Utilitarios do projeto:

- `scripts/` — validadores e sincronizador, rodam localmente e em CI:

  | Comando | Garante |
  | --- | --- |
  | `npm run validate:i18n` | `strings.xml` (pt-BR + en) batem com `shared/I18N-KEYS.json` |
  | `npm run validate:plugins` | Manifestos de plugin contra o JSON Schema |
  | `npm run validate:security` | Rules default-deny + App Check em todas as callables |
  | `npm run agent:sync` | Bloco de estado gerado do `AGENT.md` sincronizado |
  | `npm run smoke` | Sobe emuladores, aguarda startup; chamada de callable e manual |

- `docker-compose.emulator.yml` — emuladores Firebase para desenvolvimento.

```bash
npm install   # na raiz (workspaces tools + core/functions)
npm run validate
```

Os scripts usam resolucao ESM por `import.meta.url` e podem ser chamados pelo
npm sem depender do diretorio corrente. Validadores falham com codigo
diferente de zero; nao suprima erros.
