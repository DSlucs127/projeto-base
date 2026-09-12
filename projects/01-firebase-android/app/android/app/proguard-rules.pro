# Mantem Firebase Auth e Firestore
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Hilt
-keep class dagger.hilt.** { *; }

# Mantem metadados de modelos de plugins (Kotlin reflect)
-keepattributes Signature
-keepattributes *Annotation*