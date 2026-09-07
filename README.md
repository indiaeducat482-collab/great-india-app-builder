# Great India App Builder

A starter working web app builder using Firebase Authentication + Firestore and GitHub Actions.

## Included
- Email/password signup and login
- Google sign-in
- Dashboard
- Create/edit app records
- Firestore security rules
- GitHub Pages deployment workflow
- Android WebView APK build workflow

## Important
Firebase configuration must be entered in `src/firebase-config.js`.
The browser app stores app metadata in Firestore. APK generation is performed by GitHub Actions.

## Setup
1. Create a Firebase project.
2. Register a Web App and copy its config.
3. Enable Email/Password and Google in Authentication.
4. Create Firestore.
5. Put the config in `src/firebase-config.js`.
6. Deploy the site with GitHub Pages or locally.
7. Push the repository to GitHub.
8. The APK workflow can be run manually from Actions with a website URL, app name and package name.

## GitHub Pages
Set Pages source to GitHub Actions. The included workflow deploys `src/`.
