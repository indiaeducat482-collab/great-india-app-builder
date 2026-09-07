# Great India App Builder

Frontend-first SaaS app builder for **Great India Technology**.

## GitHub Pages

Repository: `indiaeducat482-collab/great-india-app-builder`

Pages URL:

`https://indiaeducat482-collab.github.io/great-india-app-builder/`

This project uses only HTML, CSS, Vanilla JavaScript and Firebase Web SDK CDN imports. It does **not** require Node.js, React or Vite.

## 1. Upload

Upload/extract the **contents** of this ZIP into the repository root. Do not upload the ZIP itself as the website.

The root must contain:

- `index.html`
- `login.html`
- `register.html`
- `dashboard.html`
- `create-app.html`
- `my-apps.html`
- `app-details.html`
- `css/`
- `js/`
- `assets/`
- `firebase/`

## 2. Firebase Web App config

Open:

`js/firebase-config.js`

Replace only these placeholder values with the Firebase **Web App** configuration from Firebase Console:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

Do not put Firebase Admin SDK or service-account private keys in this file.

## 3. Enable Authentication

Firebase Console → Authentication → Sign-in method → Email/Password → Enable.

## 4. Firestore

Create a Firestore database, then use the rules in:

`firebase/firestore.rules`

The application creates:

- `users/{uid}`
- `apps/{appId}`
- `builds/{buildId}`

Each app contains:

`userId`, `appName`, `websiteUrl`, `packageName`, `version`, `logoUrl`, `iconUrl`, `theme`, `status`, `createdAt`, `updatedAt`.

## 5. Storage

Enable Firebase Storage and use:

`firebase/storage.rules`

Uploads are stored under:

- `logos/{uid}/...`
- `icons/{uid}/...`

The `apks/{uid}/...` path is reserved for a future secure Android build backend.

## 6. Test Register

Open:

`https://indiaeducat482-collab.github.io/great-india-app-builder/register.html`

Create an account. The app creates the Firebase Authentication user and the matching Firestore `users/{uid}` document, then opens Dashboard.

## 7. Test Login

Open Login, enter the registered email/password, and verify that Dashboard opens.

Forgot Password uses Firebase's password-reset email.

## 8. Create an app

Dashboard → Create New App.

Enter:

- App Name
- Website URL
- Package Name
- Version
- Theme
- Optional logo/icon

Save. The project is stored in Firestore and images go to Storage.

## 9. My Apps

My Apps queries only documents where `userId` equals the currently authenticated Firebase UID.

## 10. Android build phase

GitHub Pages is a static frontend host. It does not securely compile Android APKs.

`js/app-builder.js` contains:

- `buildApp(appId)`
- `getBuildStatus(buildId)`
- `downloadApk(buildId)`

Until a real secure backend/build server is connected, Build uses clearly labelled **Demo Build Mode** and does not claim an APK was generated.

## 11. GitHub Pages

Use:

- Branch: `main`
- Folder: repository root `/`

All project links and asset references are relative (`./...`) so the repository sub-path works on GitHub Pages.

## Troubleshooting

If the site loads but Firebase actions do not work:

1. Check `js/firebase-config.js`.
2. Confirm Email/Password is enabled.
3. Confirm Firestore exists.
4. Confirm Storage exists.
5. Publish the supplied Firestore and Storage rules.
6. Add the GitHub Pages domain to Firebase Authentication → Settings → Authorized domains if Firebase asks for it.
7. Open browser DevTools Console for any Firebase error.

No private Firebase service-account credential belongs in this frontend.
