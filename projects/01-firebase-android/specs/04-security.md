# 04-security

Aplicacao de [`shared/SECURITY-BASELINE.md`](../../../shared/SECURITY-BASELINE.md) neste projeto.

## 1. Identidade

- Firebase Auth e a fonte da verdade. Custom claims (`role`, `permissions[]`) sao definidos via Admin SDK em Cloud Functions (unica via confiavel).
- Tokens de ID sao verificados em cada callable.

## 2. App Check (obrigatorio)

- **Android**: Play Integrity provider. Inicializa em `MainApplication.onCreate()`.
- **Emulador**: App Check pode ser desabilitado apenas localmente; producao exige token valido.
- **Debug Android**: use o Debug App Check provider e cadastre o token no
  projeto Firebase. O artefato debug nao entra no build release.

Verificacao em **toda** callable:

```ts
import { assertAppCheck } from './assertAppCheck';

export const api = onCall({ enforceAppCheck: true }, async (req) => {
  await assertAppCheck(req);
  // ...
});
```

## 3. Firestore Rules (defaults deny)

- Bloqueio geral por default (`match /{document=**} { allow read, write: if false; }`).
- Apenas `/users/{uid}`, `/plugin_manifests`, `/audit_logs` (admin) e paths de plugins explicitamente liberados.
- Mudanca de regra precisa passar pelo `npm run validate:security`.

## 4. Storage Rules

- Path `users/{uid}/...`: dono grava, demais leem.
- Path `plugins/{id}/...`: admin grava, demais leem.
- Bloqueio por MIME e tamanho (imagens: ate 5 MB; documentos: ate 10 MB).

## 5. Android Network Security

- `network_security_config.xml` forca TLS 1.2+, desativa cleartext para todos os dominios (exceto `10.0.2.2` em debug).
- Certificate pinning opcional para dominios criticos (documentado por feature).

## 6. Auditoria

Toda acao sensivel grava em `/audit_logs` via `audit(context, action, metadata)`. Colecao tem regras de leitura **apenas admin**.

## 7. Segredos

- `firebase functions:secrets:set MY_SECRET` para cada variavel sensivel.
- Nenhum secret em `.env` do cliente.
- App usa `google-services.json` (publico por design) e Firebase Remote Config para parametros nao-sensiveis.

## 8. Checklist pre-deploy

- [ ] `npm run validate:security` verde (Rules OK, App Check ativo em production)
- [ ] `firebase functions:config:get` nao expoe segredos
- [ ] Logs nao contem PII
- [ ] Plugin manifestos conferem `permissions` com `firestore.rules`