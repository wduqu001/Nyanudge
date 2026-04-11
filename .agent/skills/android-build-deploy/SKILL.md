---
name: android-build-deploy
description: "Handles the end-to-end process of building a web-based mobile app (Capacitor) and deploying it to an Android device. Use this skill whenever the user asks to 'build the apk', 'run on android', 'deploy to device', or 'sync native changes'. It covers environment setup, web bundling, Capacitor synchronization, Gradle assembly, and ADB installation/launch."
---

# Android Build & Deployment Skill

This skill guides you through the process of building a Capacitor-based Android application and deploying it to a physical device or emulator.

## 🛠 Prerequisites & Environment
Ensure the following tools are in your `PATH`. On this system, they are often located in specific directories:
- **Node/NPM/NPX**: `/usr/local/bin`
- **Java (JDK 17+)**: `/usr/bin/java`
- **Android SDK**: `/opt/homebrew/share/android-commandlinetools`
- **ADB**: `/opt/homebrew/share/android-commandlinetools/platform-tools/adb`

Always prepend these paths to your session's `PATH` if they are missing:
```bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/share/android-commandlinetools/platform-tools
```

## 🏗 Build Workflow

### 1. Web Production Build
Generate the production-ready web assets from your frontend code.
```bash
npm run build
```

### 2. Capacitor Sync
Sync the `dist` (or `www`) folder and any plugin changes to the `android` native project.
```bash
npx cap sync android
```

### 3. Gradle Assembly
Compile the native Android project into an APK.
```bash
cd android && ./gradlew assembleDebug
```
*The resulting APK is usually at: `android/app/build/outputs/apk/debug/app-debug.apk`*

## 🚀 Deployment Workflow

### 1. Verify Device Connection
Check for connected devices or active emulators.
```bash
adb devices
```
*Ensure at least one device is listed as `device`. If it's `unauthorized`, the user needs to accept the prompt on the phone.*

### 2. Install APK
Push the generated APK to the device.
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Launch Application
Start the main activity of the app.
- **Find Application ID**: Check `android/app/build.gradle` (`applicationId`) or `capacitor.config.ts` (`appId`).
- **Standard Command**:
```bash
adb shell am start -n <APPLICATION_ID>/.MainActivity
```
*Note: Some projects use different namespaces for the MainActivity. If it fails, check `AndroidManifest.xml`.*

## 🔍 Troubleshooting
- **TypeScript Errors**: If `npm run build` fails during `tsc`, resolve type errors (e.g., unused imports) before retrying.
- **SDK Path**: If Gradle fails with "SDK not found", verify `android/local.properties` contains `sdk.dir=/opt/homebrew/share/android-commandlinetools`.
- **Activity Not Found**: If `adb shell am start` fails, verify the full component name (e.g., `com.quoryn.nyanudge.app/.MainActivity`).
