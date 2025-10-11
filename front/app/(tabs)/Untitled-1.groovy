// filepath: android/settings.gradle
pluginManagement {
    includeBuild(new File(["node", "--print", "require.resolve('expo-modules-autolinking/package.json')"].execute(null, rootDir).text.trim(), "../android"))
}
plugins {
    id 'com.android.application'
    id 'expo.modules.autolinking'
}

// filepath: android/app/build.gradle
android {
    compileSdkVersion = 36
    // ...existing code...
}