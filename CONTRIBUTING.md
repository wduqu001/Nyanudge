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
   - Node.js 22+ (required by Capacitor 8)
   - JDK 21 and the Android SDK, or Android Studio
   - Homebrew (macOS)

2. **Installation**:
   ```bash
   npm install
   ```

3. **Running the Dev Server**:
   ```bash
   npm run dev
   ```

4. **Android**: follow [docs/android_deployment_guidelines.md](docs/android_deployment_guidelines.md).

---

## 💅 Code Standards & Quality

We enforce strict code quality rules to keep the project maintainable.

### Linting
We use **ESLint**. A **Husky** pre-commit hook runs **lint-staged**, which applies `eslint --fix` to staged files and blocks the commit on errors. There is no formatter configured.

### Testing
- **Unit/Component Tests**: We use Vitest and React Testing Library. 
  - CI fails below **80%** line, branch, function or statement coverage.
  - Run tests: `npx vitest run --project=unit` (`npm test` starts watch mode).
  - Storybook stories run as accessibility checks: `npx vitest run --project=storybook`.
- **Native E2E**: the Maestro flows in `.maestro/` predate the current UI and need updating before use.

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
