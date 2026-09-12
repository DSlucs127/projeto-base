package app.template.firebase

import android.app.Application
import app.core.security.AppCheckInitializer
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        AppCheckInitializer.init(this, appCheckProviderFactory())
    }
}