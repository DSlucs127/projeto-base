package app.core.database

import com.google.firebase.firestore.CollectionReference
import com.google.firebase.firestore.DocumentReference
import com.google.firebase.firestore.DocumentSnapshot
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.tasks.await

/**
 * Repository generico tipado sobre Firestore.
 * Plugins nao devem acessar Firestore direto: extendem este repository e
 * declaram sua colecao em plugin.json.
 */
abstract class FirestoreRepository<T : Any>(
    protected val collectionPath: String,
) {
    protected val db: FirebaseFirestore = FirebaseFirestore.getInstance()
    protected val collection: CollectionReference = db.collection(collectionPath)

    /** Implementacoes devem converter DocumentSnapshot -> T. */
    protected abstract fun fromDoc(doc: DocumentSnapshot): T?

    protected abstract fun toMap(value: T): Map<String, Any?>

    suspend fun findById(id: String): T? {
        val snap = collection.document(id).get().await()
        return snap.data?.let { fromDoc(snap) }
    }

    suspend fun listAll(limit: Long? = null): List<T> {
        var query: Query = collection
        if (limit != null) query = query.limit(limit)
        val snap = query.get().await()
        return snap.documents.mapNotNull { fromDoc(it) }
    }

    suspend fun upsert(id: String, value: T): String {
        collection.document(id).set(toMap(value)).await()
        return id
    }

    suspend fun delete(id: String) {
        collection.document(id).delete().await()
    }

    /** Subscricao em tempo real a uma colecao. */
    fun observeAll(
        onChange: (List<T>) -> Unit,
        onError: (Throwable) -> Unit = { },
    ): AutoCloseable {
        val reg = collection.addSnapshotListener { snap, err ->
            if (err != null) onError(err) else {
                onChange(snap?.documents?.mapNotNull { fromDoc(it) } ?: emptyList())
            }
        }
        return AutoCloseable { reg.remove() }
    }
}