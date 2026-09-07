# Great India App Builder

HTML5 + CSS3 + Vanilla JavaScript + Firebase Web SDK. No React, Vite or Node required.

## GitHub
Upload the contents of this project to the repository root. GitHub Pages should use branch `main` and folder `/`.

All paths are relative (`./css/...`, `./js/...`, `./assets/...`).

## Firebase
Configuration is in `js/firebase-config.js`. This file includes Firebase SDK imports plus exports for `app`, `auth`, `db`, `storage` and `firebaseConfig`.

Enable:
1. Authentication → Sign-in method → Email/Password
2. Firestore Database
3. Storage

Publish `firebase/firestore.rules` and `firebase/storage.rules`.

Add the GitHub Pages domain to Firebase Authentication Authorized domains if required.

## Test
Register → Dashboard → Create New App → Save → My Apps → Open/Edit.

Login uses Firebase Email/Password. Forgot Password sends Firebase reset email.

## Android builds
GitHub Pages cannot securely compile Android APKs. The builder therefore does not fake APK generation. Until a real secure backend is connected, Build clearly reports:
`Android build service is not connected yet.`

`js/app-builder.js` exposes:
- `buildApp(appId)`
- `getBuildStatus(buildId)`
- `downloadApk(buildId)`

## Firestore
Collections:
- `users/{uid}`
- `apps/{appId}`
- `builds/{buildId}`

Apps store userId, appName, websiteUrl, packageName, version, logoUrl, iconUrl, theme, status, createdAt and updatedAt.

## Storage
- `logos/{uid}/...`
- `icons/{uid}/...`
- `apks/{uid}/...` reserved for future secure build backend.
