#!/bin/bash

# Nyanudge Android Build & Deploy Script
# Automatically builds web assets, syncs Capacitor, and deploys to ADB device

# 1. Environment Setup
export PATH="/opt/homebrew/bin:/usr/local/bin:/opt/homebrew/share/android-commandlinetools/platform-tools:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}>>> Starting Nyanudge Build & Deploy Process...${NC}"

# 2. Web Production Build
echo -e "${BLUE}>>> Building web assets...${NC}"
if npm run build; then
    echo -e "${GREEN}✓ Web build successful.${NC}"
else
    echo -e "${RED}✗ Web build failed.${NC}"
    exit 1
fi

# 3. Capacitor Sync
echo -e "${BLUE}>>> Syncing with Capacitor...${NC}"
if npx cap sync android; then
    echo -e "${GREEN}✓ Capacitor sync successful.${NC}"
else
    echo -e "${RED}✗ Capacitor sync failed.${NC}"
    exit 1
fi

# 4. Gradle Assembly (Native Build)
echo -e "${BLUE}>>> Compiling Android APK (assembleDebug)...${NC}"
cd android
if ./gradlew assembleDebug; then
    echo -e "${GREEN}✓ APK assembly successful.${NC}"
else
    echo -e "${RED}✗ Gradle build failed.${NC}"
    cd ..
    exit 1
fi
cd ..

# 5. Deployment
echo -e "${BLUE}>>> Checking for connected devices...${NC}"
DEVICE=$(adb devices | grep -w "device" | head -n 1 | awk '{print $1}')

if [ -z "$DEVICE" ]; then
    echo -e "${RED}⚠ No connected Android devices found. Skipping installation.${NC}"
    echo -e "${BLUE}APK is located at: android/app/build/outputs/apk/debug/app-debug.apk${NC}"
    exit 0
fi

echo -e "${GREEN}✓ Found device: $DEVICE${NC}"

echo -e "${BLUE}>>> Installing APK...${NC}"
if adb -s "$DEVICE" install -r android/app/build/outputs/apk/debug/app-debug.apk; then
    echo -e "${GREEN}✓ APK installed successfully.${NC}"
else
    echo -e "${RED}✗ APK installation failed.${NC}"
    exit 1
fi

echo -e "${BLUE}>>> Launching application...${NC}"
PACKAGE_NAME="com.quoryn.nyanudge.app"
if adb -s "$DEVICE" shell am start -n "$PACKAGE_NAME/.MainActivity"; then
    echo -e "${GREEN}✓ Application launched successfully!${NC}"
else
    echo -e "${RED}✗ Failed to launch application.${NC}"
    exit 1
fi

echo -e "${GREEN}>>> Success! NyaNudge is up and running on $DEVICE.${NC}"
