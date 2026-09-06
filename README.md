# Great India App Builder

GitHub-upload-ready starter for a website-to-app builder.

## Supabase
The frontend uses the Supabase project URL and publishable key in:
`assets/js/supabase-config.js`

Never place a Supabase `service_role` or secret key in frontend files.

## Database
Run the previously supplied Great India App Builder SQL in the Supabase SQL Editor before using login/app creation.

## GitHub Actions
`.github/workflows/build-apk.yml` contains the initial workflow hook. A production APK build requires an Android project/build service and secure server-side credentials.

## GitHub Pages
Repository Settings → Pages → Deploy from branch → `main` → `/ (root)`.
