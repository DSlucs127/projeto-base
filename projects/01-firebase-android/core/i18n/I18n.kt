package app.core.i18n

import android.content.Context
import androidx.annotation.StringRes
import java.util.Locale

/**
 * Resolve string canonica a partir do locale do sistema, com fallback
 * para pt-BR caso uma chave esteja ausente em en.
 *
 * O catalogo canonico vive em shared/I18N-KEYS.json (chaves com pontos viram
 * underscore nos resource names). O validator
 * `tools/scripts/check-i18n.ts` bloqueia PR com chave faltando em
 * alguma das duas pastas (`values/` ou `values-en/`).
 */
object I18n {
    fun isPortuguese(): Boolean =
        Locale.getDefault().language.startsWith("pt", ignoreCase = true)

    fun t(context: Context, @StringRes id: Int): String =
        context.getString(id)
}

/** Helper Compose para usar em Composables. */
@androidx.compose.runtime.Composable
fun t(@StringRes id: Int): String {
    val ctx = androidx.compose.ui.platform.LocalContext.current
    return I18n.t(ctx, id)
}