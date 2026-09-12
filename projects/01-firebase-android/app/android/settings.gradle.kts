pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "01-firebase-android"
include(":app")
include(":design-system")

// The Android build lives under app/android while the shared library is at
// the template root. Keep that boundary explicit instead of relying on a
// sibling checkout layout.
project(":design-system").projectDir = file("../../design-system")