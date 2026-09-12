# 04 - Seguranca

O sistema falha fechado:

1. Sem secrets validos ou `DATABASE_URL`, a API nao inicia.
2. Toda rota e autenticada por padrao; somente `@Public()` a libera.
3. Permissoes sao conferidas no backend; frontend apenas adapta a UI.
4. Dados sensiveis usam AES-256-GCM com IV aleatorio e auth tag.
5. Refresh/logout com cookie validam origem. CORS nao aceita `*`.
6. Logs de auditoria nao recebem senha, tokens, ciphertext, email ou IP bruto.
7. Banco nao possui porta exposta no compose; Caddy e a unica borda publica.

Rotacione `DATA_ENCRYPTION_KEY` com uma migration/rotacao planejada e
recriptografe registros; nunca troque a chave sem plano de leitura dos dados
existentes.
