# Great India App Builder — Fast APK + Login/Register + 2 APK Limit

This package uses the existing `great-india-app-builder` Firebase project for Login/Register, user quota and admin approval, and the existing Supabase/GitHub APK worker endpoint for actual Android APK builds.

## Flow
1. User registers or logs in with Firebase.
2. Each user gets 2 APK builds by default.
3. When the 2-build limit is reached, an admin approval request is created.
4. Admin logs in with the configured admin email and approves +2 builds.
5. Publish calls the existing APK queue (`publish-v13`) and polls `build-status-v3` every 1.2 seconds.
6. When the worker finishes, the user receives the APK download link.

## Firebase
Project: `great-india-app-builder`

Enable:
- Authentication → Sign-in method → Email/Password
- Firestore Database

Upload `firebase/firestore.rules` into Firestore Rules.

## Admin
Default admin email in this ZIP:
`admin@greatindia.technology`

Register this email once in the app, then open `admin.html`.
Change `ADMIN_EMAIL` in `js/app.js` and `js/admin.js` if you want a different admin email.

## APK speed
The frontend does not fake APK generation. It uses the existing queue/worker API from the supplied App Creator system. Fast generation depends on the GitHub Actions/worker capacity and queue. The UI polls quickly (1.2 seconds) so a completed APK is shown immediately after the backend reports READY.

## Important
The current backend endpoint is:
- publish-v13
- build-status-v3

If those endpoints are changed later, update the API constants in `js/app.js`.

Do not put GitHub tokens, Firebase service-account keys, or Supabase service-role keys in this ZIP or browser JavaScript.
