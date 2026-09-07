# Great India App Builder — Updated v2

Changes:
- App preview/header shows logo + app name at the very top.
- Publish payload explicitly sends `apk_header: {show_logo:true, show_name:true, position:"top"}` plus logo data.
- My Apps section saves each build record per user.
- Upgrade Limit page lets a user request extra APK builds and specify the amount.
- Admin panel lists users, usage, APK records and upgrade requests.
- Admin can edit name, block/unblock, delete Firestore user data, approve/reject upgrade requests.
- Blocked users are signed out on login/builder.
- Firestore rules include admin access.

IMPORTANT:
The actual APK's final native header is produced by the `publish-v13` backend. This frontend sends the logo/name/header settings to that backend. If `publish-v13` does not consume `apk_header`, the backend must be updated to render the native Android top row.

Firebase:
1. Enable Email/Password Authentication.
2. Add `indiaeducat482-collab.github.io` to Authorized Domains.
3. Publish `firebase/firestore.rules`.

Security:
- Do not expose a Firebase service-account key in GitHub Pages.
- The Admin email in frontend/rules is only a gate; production-grade admin authorization should use Firebase custom claims.
- Firestore deletion does not delete the Firebase Authentication account. Full Auth account deletion requires a trusted server/Cloud Function using Firebase Admin SDK.


## Admin Login
Use `admin-login.html` or the **🛡️ Admin Login** button on the main site. Admin access is restricted to `admin@greatindia.technology` in the frontend check; the Firebase account must also exist.
