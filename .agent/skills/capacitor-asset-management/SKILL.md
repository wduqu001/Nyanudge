---
name: capacitor-asset-management
description: Handle icon and splash screen generation for Capacitor apps using `@capacitor/assets`.
---

# Capacitor Asset Management Skill

This skill provides instructions for managing and regenerating native assets (icons and splash screens) for a Capacitor-based application.

## 📁 Source Asset Requirements
Place high-resolution source images in the `assets/` directory at the root of the project:
- **`icon.png`**: (Min 1024x1024px) The main app icon. Should be a square, preferably with transparency or a solid background that works across themes.
- **`splash.png`**: (Min 2732x2732px) The light mode splash screen.
- **`splash-dark.png`**: (Min 2732x2732px) The dark mode splash screen. The `-dark` suffix is mandatory for the tool to recognize and generate night-mode variants.

> [!IMPORTANT]
> Source images should be "raw" designs. Avoid including mobile phone frames, bezels, or device mockups in the source files, as the generation tool will slice them directly into native resources.

## 🛠 Prerequisites
Ensure the Android SDK tools are in your `PATH`:
```bash
export PATH=$PATH:/usr/local/bin:/opt/homebrew/share/android-commandlinetools/platform-tools
```

## 🏗 Generation Workflow

### 1. Update Source Files
If you have new designs, replace the files in the `assets/` folder, ensuring they retain the correct filenames listed above.

### 2. Generate Native Resources
Run the following command to slice the assets and inject them into the `android/app/src/main/res` directories:
```bash
npx @capacitor/assets generate --android
```

### 3. Verify Generation
Check the `android/app/src/main/res/` directory. You should see updated `.png` files in:
- `mipmap-*`: Icons
- `drawable-port-*`: Splash screens (Portrait)
- `drawable-land-*`: Splash screens (Landscape)
- `drawable-*-night-*`: Dark mode variants (if `splash-dark.png` was provided)

## 🚀 Native Integration
Capacitor automatically uses these resources. After generating, the next time you build the APK/AAB or run the app on a device, the new assets will be visible.

## 🔍 Troubleshooting
- **EACCES Errors**: If `npm install` or generation fails due to permissions, avoid global installs. Use `npx` as shown in the commands above.
- **Missing Dark Mode**: Ensure the dark splash is named exactly `splash-dark.png`.
- **Blurry Assets**: Ensure the source images meet the minimum resolution requirements (e.g., 2732px for splashes).
