# design-system

Modulo Gradle `:design-system` com tokens Compose sincronizados com `shared/DESIGN-TOKENS.md`.

- `theme/Theme.kt` - `AppTheme` (light/dark automatico).
- `components/DSButton.kt` - botao padrao 48dp.
- `components/DSCard.kt` - card elevado 2dp.
- `components/DSTextField.kt` - input outlined.
- `theme/Theme.kt` concentra os tokens Compose; as cores de recursos do app
  ficam em `app/android/app/src/main/res/values/colors.xml`.

Para adicionar um componente:

1. Crie em `src/main/kotlin/app/designsystem/components/`.
2. Documente uso em `DESIGN-TOKENS.md` se introduzir novo token.
3. Nunca referenciar cor direta (`Color(0xFF...)`) fora deste modulo.