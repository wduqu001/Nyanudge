![NyaNudge Hero Banner - Calm, playful, and minimal. A soft UI experience inspired by Mochi aesthetics.](./src/assets/hero.png)

# NyaNudge 🐾
> **Your cat-powered wellness companion.**

NyaNudge is a delightful mobile health companion that transforms daily habits into moments of joy. Using a crew of animated cat characters, NyaNudge sends gentle, witty reminders for hydration, meals, exercise, and more.

## ✨ Features

- **Cat-Powered Delights**: 8+ core vector animations (Lottie) featuring Mochi the cat.
- **Smart Reminders**: 5 default health categories (Water, Meal, Exercise, Bathroom, Meds) with intelligently calculated schedules.
- **Privacy First**: Local SQLite database with versioned migrations (Drizzle ORM). No data ever leaves your device.
- **Tailored Experience**: Choose your cat character, set custom notification sounds, and toggle themes (Light/Dark mode).
- **Streak Tracking**: Maintain your consistency and impress your cat crew with multi-day streaks.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Native Bridge**: [Capacitor 8](https://capacitorjs.com/)
- **State**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Database**: [SQLite](https://sqlite.org/) via `@capacitor-community/sqlite` + [Drizzle ORM](https://orm.drizzle.team/)
- **Animations**: [Lottie-web](https://github.com/airbnb/lottie-web)
- **Styling**: Vanilla CSS with CSS Modules & Design Tokens
- **Testing**: [Vitest](https://vitest.dev/) & [Storybook](https://storybook.js.org/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+)
- npm or pnpm

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Component Documentation (Storybook)
We use Storybook to develop and document our shared component library and animation registry.
```bash
# Start Storybook
npm run storybook
```

## 📂 Project Structure

```text
src/
├── core/           # Database, Notification scheduling, i18n
├── features/       # Feature-specific components (Home, Settings, etc.)
├── shared/         # Common UI library & Animation registry
└── assets/         # Lottie JSONs, sound files, and static images
```

## 🐱 Animation Registry
The app uses a custom registry in `src/shared/animations` to manage Mochi's moods and movements. Every notification trigger corresponds to a unique motion-spec animation.

---
Built with ❤️ and many 🐾 by the NyaNudge team.
