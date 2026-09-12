package app.core.security

import android.app.Application
import com.google.firebase.FirebaseApp
import com.google.firebase.appcheck.AppCheckProviderFactory
import com.google.firebase.appcheck.FirebaseAppCheck
import kotlinx.coroutines.tasks.await

/**
 * Inicializa App Check no startup do app.
 *
 * O app fornece o provider da variante atual: Debug App Check somente em
 * debug e Play Integrity em release. O core nao depende do provider de debug,
 * portanto esse artefato nao entra no classpath de release.
 */
object AppCheckInitializer {
    fun init(app: Application, providerFactory: AppCheckProviderFactory) {
        FirebaseApp.initializeApp(app)
        FirebaseAppCheck.getInstance().installAppCheckProviderFactory(providerFactory)
    }

    /** Obtém e atualiza o token de App Check para cadastro no ambiente local. */
    suspend fun getDebugToken(): String =
        FirebaseAppCheck.getInstance()
            .getAppCheckToken(true)
            .await()
            .token
}