# Web → Android APK Builder

## GitHub Pages
Upload the contents of `pages/` to the root of your GitHub Pages repository. The page contains the Builder UI.

## Important
The browser cannot securely create/commit an APK into GitHub without GitHub authentication. Therefore the Builder generates a complete Android project ZIP in the browser. Upload/push the generated project files to GitHub; the included GitHub Actions workflow builds the APK automatically.

## APK
After push to `main`, open GitHub → Actions → Build APK. The APK is in the `android-apk` artifact.

The generated Android app has:
- top bar with app logo + app name
- website in WebView
- JavaScript and DOM storage
- Android back navigation
- Internet permission
