# Android build and deployment

The single reference for building NyaNudge for Android. `.agents/tools/deploy-android.sh` automates the debug steps.

## Prerequisites
- Node.js 22+ and JDK 21 (`android/app/capacitor.build.gradle` compiles for Java 21).
- Android SDK with platform 36; set `sdk.dir` in `android/local.properties` if it isn't detected.
- `adb` on your `PATH` and a device or emulator authorised for USB debugging.

## Debug build on a device
```bash
npm run build                      # type-check and bundle the web app into dist/
npx cap sync android               # copy dist/ and plugin changes into android/
cd android && ./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk   # -r keeps app data
adb shell am start -n com.quoryn.nyanudge.app/.MainActivity
```

## Release build
Signing secrets never live in the repo. Put them in `~/.gradle/gradle.properties`, or export them as environment variables:

```properties
NYANUDGE_UPLOAD_STORE_FILE=/absolute/path/to/nyanudge-upload.jks
NYANUDGE_UPLOAD_STORE_PASSWORD=...
NYANUDGE_UPLOAD_KEY_ALIAS=nyanudge-upload
NYANUDGE_UPLOAD_KEY_PASSWORD=...
```

```bash
npm run build && npx cap sync android
cd android && ./gradlew assembleRelease   # app/build/outputs/apk/release/app-release.apk
```

Without those properties, Gradle produces `app-release-unsigned.apk`. Keep the upload key backed up: every update must be signed with the same key.

**Galaxy Store:** upload a signed APK to keep your own key. If you upload an AAB (`./gradlew bundleRelease`), Samsung manages the signing key.

## Icons and splash screens
After changing `assets/icon.png`, `assets/splash.png` or `assets/splash-dark.png`, run `npx @capacitor/assets generate --android`. Details are in `.agents/skills/capacitor-asset-management/SKILL.md`.

## Troubleshooting
- **Gradle "invalid source release 21"**: the active JDK is older than 21.
- **`adb` not found**: add the SDK's `platform-tools` to your `PATH`.
- **Activity not found**: the package is `com.quoryn.nyanudge.app`; check `applicationId` in `android/app/build.gradle`.
