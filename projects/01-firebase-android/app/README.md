# app/

Scaffold do cliente Android Kotlin/Compose.

## Estrutura

- `android/` - projeto Gradle KTS.
  - `app/src/main/kotlin/...` - codigo Kotlin (Compose).
  - `app/src/main/res/values/strings.xml` - strings pt-BR.
  - `app/src/main/res/values-en/strings.xml` - strings en.
- `android/app/google-services.json.example` - modelo do arquivo Firebase.

## Configuracao Firebase e build local

Registre no Firebase as aplicacoes `app.template.firebase` e
`app.template.firebase.debug`. Baixe o JSON que contenha as duas entradas e
salve-o como `android/app/google-services.json`; nunca substitua o exemplo nem
commite o arquivo real.

O checkout inclui o Gradle Wrapper 8.5 completo (`gradlew`, `gradlew.bat` e
`gradle/wrapper/gradle-wrapper.jar`). Para executar os comandos, continuam
obrigatórios JDK 17, Android SDK configurado e o
`android/app/google-services.json` local descrito acima, com clientes release
e debug. Depois:

```bash
cd android
# macOS/Linux
./gradlew :app:assembleDebug    # gera APK debug
./gradlew :app:assembleRelease  # gera APK release assinado (configurar keystore)
# Windows
gradlew.bat :app:assembleDebug
gradlew.bat :app:assembleRelease
```

## Convencao

- Toda UI depende de `design-system/`; o modulo e incluido explicitamente pelo
  `settings.gradle.kts`.
- Os fontes Kotlin de `core/` sao mapeados como fonte compartilhada do app.
- Toda string vai em `strings.xml` (pt-BR) + `values-en/strings.xml` (en).
- Nenhuma regra de negocio aqui: delegue para Cloud Functions via `core/functions/pluginsRegistry`.