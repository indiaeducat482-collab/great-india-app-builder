WEB TO ANDROID APK BUILDER
1) Put your logo at: app/src/main/res/drawable/app_logo.png
2) Open app/src/main/res/values/strings.xml and set app_name.
3) Run the build workflow on GitHub Actions (recommended), or use Android Studio.
IMPORTANT: Android APK compilation needs the Android Gradle toolchain; a normal ZIP alone cannot compile an APK without a build environment.
The generated app has a fixed top bar with logo + app name and the website below it.
