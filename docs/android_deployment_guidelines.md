# Android Deployment Guidelines

Follow these guidelines to ensure a consistent and successful build and deployment process for the Nyanudge Android application.

## 📋 Prerequisites
- **Android SDK**: Ensure `adb` and `gradle` are available in your path.
- **Source Assets**: High-resolution `icon.png`, `splash.png`, and `splash-dark.png` must be present in the root `assets/` directory.
- **Device Connection**: A physical device or emulator must be connected and authorized via ADB.

## 🛠 Build & Deploy Procedure

### 1. Update Native Assets
Whenever source images in the `assets/` folder are modified, regenerate the native resources to ensure the app UI remains up to date.
```bash
npx @capacitor/assets generate --android
```

### 2. Prepare Web Assets
Compress and bundle the frontend code for production. This ensures optimal performance on mobile hardware.
```bash
npm run build
```

### 3. Synchronize Capacitor
Sync the web bundle and any new plugin configurations with the native Android layer.
```bash
npx cap sync android
```

### 4. Assemble the APK
Compile the native project. Use the `debug` assembly for development testing.
```bash
cd android && ./gradlew assembleDebug
```
*The resulting APK is located at: `android/app/build/outputs/apk/debug/app-debug.apk`*

### 5. Install and Launch
Deploy the APK to your device. Use the `-r` flag to reinstall while keeping existing app data.
```bash
# Replace with your actual APK path if different
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Launch the Main Activity
adb shell am start -n com.quoryn.nyanudge.app/.MainActivity
```

## 🔍 Troubleshooting
- **Path Issues**: If `adb` is not found, verify your environment variables.
- **Gradle Errors**: Ensure you have the compatible JDK version (JDK 17 recommended) and the Android SDK path is correctly configured in `android/local.properties`.
- **App Not Starting**: Verify the package name in `android/app/build.gradle` matches the `am start` command.
