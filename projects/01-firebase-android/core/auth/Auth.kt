package app.core.auth

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.UserProfileChangeRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.tasks.await

/**
 * Wrapper de Firebase Auth para o core do projeto.
 *
 * Capacidades garantidas:
 *  - signIn / signUp (email + senha) e Anonymous
 *  - signOut
 *  - observacao de estado via [userState]
 *  - refresh de ID token
 *  - atribuicao de custom claims (role, permissions[]) so no backend
 *
 * O Android NAO concede permissao a si mesmo. Permissoes vem de custom claims
 * definidos por Cloud Functions com Admin SDK. Client apenas le.
 */
object Auth {
    private val firebase: FirebaseAuth = FirebaseAuth.getInstance()

    private val _userState = MutableStateFlow<FirebaseUser?>(firebase.currentUser)
    val userState: StateFlow<FirebaseUser?> = _userState.asStateFlow()

    init {
        firebase.addAuthStateListener { auth ->
            _userState.value = auth.currentUser
        }
    }

    val currentUser: FirebaseUser? get() = firebase.currentUser
    val isSignedIn: Boolean get() = firebase.currentUser != null

    suspend fun signInWithEmail(email: String, password: String): FirebaseUser {
        val result = firebase.signInWithEmailAndPassword(email.trim(), password).await()
        return result.user ?: error("Auth returned no user")
    }

    suspend fun signUpWithEmail(email: String, password: String, displayName: String?): FirebaseUser {
        val result = firebase.createUserWithEmailAndPassword(email.trim(), password).await()
        val user = result.user ?: error("Auth returned no user")
        if (!displayName.isNullOrBlank()) {
            user.updateProfile(
                UserProfileChangeRequest.Builder().setDisplayName(displayName).build()
            ).await()
        }
        return user
    }

    suspend fun signInAnonymously(): FirebaseUser {
        val result = firebase.signInAnonymously().await()
        return result.user ?: error("Auth returned no user")
    }

    suspend fun signOut() {
        firebase.signOut()
    }

    /**
     * Forca refresh do ID token. Util antes de chamar Cloud Functions sensiveis
     * para garantir custom claims atualizados.
     */
    suspend fun refreshToken(force: Boolean = true): String? {
        val user = firebase.currentUser ?: return null
        return user.getIdToken(force).await().token
    }

    /** Le role do custom claim (definido no backend). */
    val role: String?
        get() = firebase.currentUser
            ?.getIdToken(false)
            ?.result
            ?.claims
            ?.get("role") as? String

    /** Le permissions[] do custom claim. */
    val permissions: Set<String>
        get() {
            val raw = firebase.currentUser
                ?.getIdToken(false)
                ?.result
                ?.claims
                ?.get("permissions") as? List<*> ?: return emptySet()
            return raw.filterIsInstance<String>().toSet()
        }

    fun hasPermission(permission: String): Boolean =
        permissions.contains(permission) || role == "admin"
}