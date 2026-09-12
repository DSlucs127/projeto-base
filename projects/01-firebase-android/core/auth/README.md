# core/auth

Wrapper de Firebase Auth usado pelo app Android.

## O que faz

- Login/cadastro email+senha e anonimo.
- Refresh de ID token.
- Leitura de custom claims (`role`, `permissions[]`).
- Observacao de sessao via `Auth.userState`.

## O que NAO faz

- NAO concede permissao. Custom claims sao definidos exclusivamente por Cloud Functions
  com Admin SDK (ver [`../../core/security/README.md`](../security/README.md)).
- NAO expoe senha em log.
- NAO chama o Firestore direto (vai por Cloud Functions).

## Como usar

```kotlin
import app.core.auth.Auth

if (!Auth.isSignedIn) {
    Auth.signInWithEmail("user@example.com", "secret")
}

if (Auth.hasPermission("write:finance_entries")) {
    // ...
}
```

## Testes

Nao ha testes especificos de Auth neste scaffold. Adicione testes unitarios ou
com o Firebase Emulator junto com a implementacao que consumir este contrato
(a meta de cobertura do core esta em `shared/CONVENTIONS.md`).

## Notas de seguranca

- `hasPermission` considera `role == "admin"` como bypass de qualquer
  permissao. E intencional: admin tem acesso total; documente se mudar.
- Custom claims sao atribuidos apenas por `setUserClaims` (valida role contra
  a allowlist `admin|member|guest` e o padrao `recurso:acao` das permissoes).