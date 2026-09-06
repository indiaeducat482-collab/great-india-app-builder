# Website to Android APK — GitHub Build Template

## Only 3 things to change

1. **App name:** `app/src/main/res/values/strings.xml` → `app_name`
2. **Website URL:** same file → `website_url`
3. **Logo:** replace `app/src/main/res/drawable/app_logo.xml` with your logo (PNG/JPG can also be used after updating the manifest/layout drawable name).

## GitHub

Upload the whole folder to a GitHub repository. The included GitHub Actions workflow builds the APK automatically on push to `main`/`master`, and also supports **Run workflow** manually.

After the workflow finishes: GitHub → Actions → Build Android APK → Artifacts → download `website-app-debug-apk`.

## Notes

- Internet permission is included.
- JavaScript and DOM storage are enabled.
- Android Back navigates WebView history.
- Default orientation is portrait.
- This is a debug APK template. For Play Store release, add a signing configuration.
