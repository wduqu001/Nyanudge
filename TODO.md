# NyaNudge — Development TODO List

This document contains all the tasks and issues required to implement the NyaNudge app as specified in the [PRD](docs/NyaNudge_PRD.md). These items will be used to create GitHub issues for the project.

---

## 1. Project Setup & Infrastructure

### [INFRA] Initialize React + TypeScript + Capacitor Project
- [x] Initialize a new Vite project using React and TypeScript.
- [x] Configure `capacitor.config.ts` with package name `com.nyanudge.app`.
- [x] Set up the directory structure as specified in Section 4 and 17 of the PRD.
- [x] Install base dependencies: `zustand`, `lucide-react`, `i18next`, `react-i18next`, `lottie-web`.
- [x] Set up `vitest` and `react-testing-library`.
- [x] Review and update project `.gitignore`.
- [x] Harden TypeScript configuration (Strict mode, `noUncheckedIndexedAccess`, etc.).

---

## 2. Core Systems

### [CORE] Database: SQLite & Drizzle ORM Setup
- [x] Install `@capacitor-community/sqlite` and `drizzle-orm`.
- [x] Create `src/core/db/schema.ts` with tables: `preferences`, `reminders`, `schedules`, `completion_log`, `streaks` (Section 11.2).
- [x] Implement `MigrationRunner.ts` to handle versioning (Section 11.3).
- [x] Implement `seed.ts` to populate default reminders on first launch (Section 11.4).

### [CORE] State Management: Zustand Stores
- [x] Create `remindersStore.ts` to manage reminder states and CRUD operations.
- [x] Create `preferencesStore.ts` for app settings (Section 9).
- [x] Create `statsStore.ts` for tracking streaks and history.

### [CORE] Notifications: Scheduling & Handlers (#4)
- [x] Implement `scheduler.ts` logic using `@capacitor/local-notifications` (Section 10.1).
- [x] Implement logic to calculate `nextFireTime` for interval and fixed schedules.
- [x] Configure Android Notification Channels in `capacitor.config.ts` (Section 10.3).
- [ ] Implement Sound/Vibration handlers and integrate `.mp3` assets (Section 10.2).

### [CORE] Internationalization: i18next Setup
- [x] Configure `i18next` in `src/core/i18n/index.ts`.
- [x] Create initial locale JSON files for `en`, `pt-BR`, `ja`, and `es-ES`.
- [x] Include all reminder phrases from Section 8 (English, pt-BR, ja, es-ES).
- [x] Implement `pickMessage` utility for category-specific random messages.

---

## 3. UI/UX Design Tokens & Shared Components

### [UI] Design Tokens: CSS Variables
- [x] Create `src/shared/styles/tokens.css` with the color system and neutral ramp (Section 5).
- [x] Implement Light/Dark mode variants using `prefers-color-scheme`.
- [x] Configure Nunito font and global typography styles (Section 6).

### [UI] Shared Components Library
- [x] **Button**: Primary, secondary, and ghost variants.
- [x] **Card**: Surface for reminder cards and history items.
- [x] **Toggle/Switch**: Custom styled switch for reminder enabling.
- [x] **Modal**: Base modal for reminder editing and onboarding steps.
- [x] **Iconography**: Integrate `lucide-react` icons (Section 12.3).
- [x] **Nya Standard**: Renamed core components (`NyaButton`, `NyaHeader`, `NyaSelect`) to avoid native tag conflicts.
- [x] **Error System**: Implemented global `ErrorBoundary` and branded `ErrorPage`.

### [UI] Storybook Integration
- [x] Initialize and configure Storybook for shared component development.
- [x] Create stories for shared components (Button, Card, Toggle, Modal).
- [x] Configure Storybook to use Design Tokens (CSS variables).

---

## 4. Feature Development

- [x] Integrate React Router and scaffold basic placeholders for all feature screens.

### [FEATURE] Onboarding Flow
- [x] Implement `OnboardingFlow.tsx` with 3 swipeable screens (Section 7.5).
- [x] Screen 1: "Meet your crew" (Character intro).
- [x] Screen 2: "Your reminders" (Quick setup).
- [x] Screen 3: "How you like it" (Sound/vibration prefs).

### [FEATURE] Home Screen (#9) [DONE]
- [x] **Hero Section**: Display active cat idle animation and "Next Up" countdown (Section 14.1).
- [x] **Streak Banner**: Show consecutive days counter.
- [x] **Reminder Card List**: Render list of 5 categories with quick-toggles (Section 14.2).
- [x] Implement card expansion for quick-edit options.

### [FEATURE] Reminder Edit Screen (#10) [DONE]
- [x] Create `ReminderEdit.tsx` for deep configuration of a reminder (Section 7.2).
- [x] Implement Time/Interval selection.
- [x] Implement Repeat Pattern selection (Daily, Weekdays, Custom).
- [x] Implement Sound/Snooze/Character overrides.

### [FEATURE] Settings Screen
- [x] Implement `SettingsScreen.tsx` with all sections from Section 9.
- [x] Notification style & DND window.
- [x] Appearance (Theme, Character, Language).
- [x] Data Management (Export CSV, Clear History).

### [FEATURE] History & Stats (#12)
- [ ] Implement `HistoryScreen.tsx` (Section 7.4).
- [ ] **HeatmapCalendar**: Visual log of daily completions.
- [ ] **Stats View**: Per-category completion rate and streak records.

---

## 5. Assets & Animations

### [ASSETS] Lottie Animation Integration
- [x] Implement `LottiePlayer.tsx` wrapper for `lottie-web`.
- [x] Set up `registry.ts` for all 8 core animation keys (Section 13.2).
- [x] Integrate Mochi character Lottie JSON files (Phase 1).

### [ASSETS] Audio Integration
- [x] Add `chime_soft.mp3`, `bell_gentle.mp3`, and `chime_persistent.mp3` to `src/assets/sounds/`.

---

## 6. Testing & QA (#15, #16, #17)

### [TEST] Core System Unit Tests (#15)
- [ ] Implement `scheduler.test.ts` for fire time calculations (Section 15.2).
- [ ] Implement `migrations.test.ts` for DB versioning logic.
- [ ] Implement `messages.test.ts` for i18n message picking.

### [TEST] Component & Feature Tests (#16)
- [ ] Implement `ReminderCard.test.tsx` (Section 15.2).
- [ ] Implement `StreakCalculator.test.ts` for streak logic accuracy.

### [QA] Accessibility & Polish (#17)
- [ ] Verify `aria-label` on all interactive elements (Section 16).
- [ ] Ensure touch targets meet 44x44 dp minimum.
- [ ] Verify `prefers-reduced-motion` support.
