# Contributing to NyaNudge 🐾

Welcome to the NyaNudge project! We're thrilled that you're interested in contributing to our cat-powered wellness companion.

This document provides guidelines for contributing to NyaNudge. Following these rules helps us maintain a high-quality codebase and ensures a smooth collaboration process.

---

## 🏗 Architecture & Tech Stack

Before you start coding, it's important to understand why we chose our stack:

- **Capacitor.js + React**: We prioritize web-standard technologies. This allows us to share 100% of our logic across platforms and use CSS modules for styling without a heavy "bridge" layer.
- **SQLite + Drizzle ORM**: For a privacy-first app, data stays on-device. Drizzle provides TypeScript-safe schema management and lightweight migrations.
- **Zustand**: We use a minimal, decentralized state management approach. Each global "slice" (reminders, preferences) lives in its own store.
- **i18next**: Every user-facing string MUST be localized. Do not use hardcoded strings in components.

---

## 🚀 Local Development Setup

1. **Prerequisites**:
   - Node.js (v20+)
   - Android Studio (for native testing)
   - Homebrew (macOS)

2. **Installation**:
   ```bash
   npm install
   ```

3. **Running the Dev Server**:
   ```bash
   npm run dev
   ```

4. **Android Execution**:
   ```bash
   npm run build
   npx cap sync android
   npx cap open android # Opens in Android Studio
   ```

---

## 💅 Code Standards & Quality

We enforce strict code quality rules to keep the project maintainable.

### Linting & Formatting
We use **ESLint** and **Prettier**. You don't need to run these manually; we have **Husky** and **lint-staged** configured. When you commit your changes, these tools will automatically:
1. Fix common linting errors.
2. Format your code to match our style guide.
3. Prevent the commit if there are fatal errors.

### Testing
- **Unit/Component Tests**: We use Vitest and React Testing Library. 
  - Aim for **80% coverage** minimum on new features.
  - Run tests: `npm test`
- **Native E2E**: We use **Maestro** for native flow testing on Android.
  - See `.maestro/` for existing flows.

---

## 📥 Development Workflow

1. **Pick a Task**: Check our GitHub Issues for tasks tagged with "help wanted" or "bug".
2. **Branching**: Create a feature branch from `main`:
   ```bash
   git checkout -b feature/cool-new-feature
   ```
3. **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
   - `feat: ...` for new features
   - `fix: ...` for bug fixes
   - `chore: ...` for maintenance
4. **Pull Requests**:
   - Keep PRs focused. One feature/fix per PR.
   - Ensure all tests pass.
   - Update documentation if you change an API or a major piece of logic.

---

## 🗺 Directory Map

- `src/core`: Low-level logic (DB, i18n, logic stores).
- `src/features`: User-facing screens and their specific logic.
- `src/shared`: Reusable components and hooks.
- `android/`: Native Android project files.

---

## ❓ Questions?

If you're unsure about anything, feel free to open an issue or start a discussion. We're here to help!

🐾 *Happy coding!*
