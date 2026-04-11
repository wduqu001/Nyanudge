![NyaNudge Hero Banner - Calm, playful, and minimal. A soft UI experience inspired by Mochi aesthetics.](./src/assets/hero.png)

# NyaNudge 🐾
> **Your cat-powered wellness companion.**

NyaNudge is a delightful mobile health companion that transforms daily habits into moments of joy. Using a crew of animated cat characters, NyaNudge sends gentle, witty reminders for hydration, meals, exercise, and more.

## ✨ Features

- **Animated Cat Characters**: Meet the crew! **Mochi** (the surprised one), **Kuro** (the mischievous one), and **Sora** (the calm one). Mochi and Kuro featuring interactive React-based SVGs with mouse-tracking and random behaviors.
- **Robust Notification Engine**:
  - **Native Android Tray Actions**: "Mark as Done" and "Snooze" directly from notifications.
  - **Auto-Rescheduling**: Intelligent interval rescheduling (infinite chains) using background listeners.
  - **Native-Bridge Persistence**: Uses Zustand stores exposed to the global `window` for reliable action handling outside the React lifecycle.
- **SQLite Persistence**: Full CRUD operations using `@capacitor-community/sqlite`. Supports mobile (native) and web (WASM/sql.js) environments.
- **Smart Reminders**: 5 default health categories with intelligently calculated fixed and interval schedules.
- **Seamless Interaction**: Tapping a notification opens a beautiful habit-confirmation modal (Haptic-driven) right on the home screen.
- **Localization Infrastructure**: Built-in support for multiple languages (English & Portuguese BR fully implemented).
- **Streak & History Tracking**: Maintain consistency with habit streaks and a full completion log stored locally.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Native Bridge**: [Capacitor 8](https://capacitorjs.com/)
- **State**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) + persistence
- **Database**: [SQLite](https://sqlite.org/) via `@capacitor-community/sqlite`.
- **Animations**: [Lottie-web](https://github.com/airbnb/lottie-web) & Interactive React SVGs
- **i18n**: [i18next](https://www.i18next.com/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- Java JDK 17+
- Android SDK (v34+)

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Testing & Quality
NyaNudge enforces an 80% test coverage minimum using Vitest and React Testing Library. To ensure our SQLite persistence and hybrid background lifecycles work smoothly, run:

```bash
# Run unit and component coverage
npm run test -- --coverage
```

**Native End-to-End Testing (Maestro)**
We test true Android behaviors (status bar clipping, background restorations, and Native Notifications limits) using [Maestro](https://maestro.mobile.dev/).
1. Install Maestro: `curl -Ls "https://get.maestro.mobile.dev" | bash`
2. Run automated flows against your built emulator/device:
   ```bash
   maestro test .maestro/home_flow.yaml
   ```


### Testing & Quality
NyaNudge enforces an 80% test coverage minimum using Vitest and React Testing Library. To ensure our SQLite persistence and hybrid background lifecycles work smoothly, run:

```bash
# Run unit and component coverage
npm run test -- --coverage
```

**Native End-to-End Testing (Maestro)**
We test true Android behaviors (status bar clipping, background restorations, and Native Notifications limits) using [Maestro](https://maestro.mobile.dev/).
1. Install Maestro: `curl -Ls "https://get.maestro.mobile.dev" | bash`
2. Run automated flows against your built emulator/device:
   ```bash
   maestro test .maestro/home_flow.yaml
   ```


### Component Documentation (Storybook)
```bash
npm run storybook
```

### Build (Android)
1. **Configure Android SDK**: Edit `android/local.properties` (sdk.dir path).
2. **Build Web App**: `npm run build`
3. **Sync Capacitor**: `npx cap sync android`
4. **Gradle Build**: `cd android && ./gradlew assembleDebug`
   *Output: `android/app/build/outputs/apk/debug/app-debug.apk`*

---
Built with ❤️ and many 🐾 by the NyaNudge team.
