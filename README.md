# Web → Android APK Builder

## 1. GitHub Pages
For GitHub Pages, upload **index.html** from this package to the repository root, or upload the contents of the `pages/` folder to the repository root.

Then set:
- Settings → Pages
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

## 2. Use the Builder
Enter:
- App Name
- Website URL starting with `https://`
- PNG/JPG/WebP logo

Click **Generate Android Project ZIP**.

## 3. Build APK
The generated ZIP contains an Android project and `.github/workflows/build-apk.yml`.
Upload/push the generated project files to a GitHub repository on `main`.
Then open GitHub → Actions → Build APK.
The APK will appear under the workflow's **Artifacts** as `android-apk`.

The Android app has a top header containing the uploaded logo and app name, with the website below in a WebView.
