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

---

## 2. Core Systems

### [CORE] Database: SQLite & Drizzle ORM Setup
- [x] Install `@capacitor-community/sqlite` and `drizzle-orm`.
- [x] Create `src/core/db/schema.ts` with tables: `preferences`, `reminders`, `schedules`, `completion_log`, `streaks` (Section 11.2).
- [x] Implement `MigrationRunner.ts` to handle versioning (Section 11.3).
- [x] Implement `seed.ts` to populate default reminders on first launch (Section 11.4).

### [CORE] State Management: Zustand Stores
- [ ] Create `remindersStore.ts` to manage reminder states and CRUD operations.
- [ ] Create `preferencesStore.ts` for app settings (Section 9).
- [ ] Create `statsStore.ts` for tracking streaks and history.

### [CORE] Notifications: Scheduling & Handlers
- [ ] Implement `scheduler.ts` logic using `@capacitor/local-notifications` (Section 10.1).
- [ ] Implement logic to calculate `nextFireTime` for interval and fixed schedules.
- [ ] Configure Android Notification Channels in `capacitor.config.ts` (Section 10.3).
- [ ] Implement Sound/Vibration handlers and integrate `.mp3` assets (Section 10.2).

### [CORE] Internationalization: i18next Setup
- [x] Configure `i18next` in `src/core/i18n/index.ts`.
- [/] Create initial locale JSON files for `en`, `pt-BR`, and `ja`. (Pending: pt-BR and ja content)
- [x] Include all reminder phrases from Section 8 (English).
- [x] Implement `pickMessage` utility for category-specific random messages.

---

## 3. UI/UX Design Tokens & Shared Components

### [UI] Design Tokens: CSS Variables
- [ ] Create `src/shared/styles/tokens.css` with the color system and neutral ramp (Section 5).
- [ ] Implement Light/Dark mode variants using `prefers-color-scheme`.
- [ ] Configure Nunito font and global typography styles (Section 6).

### [UI] Shared Components Library
- [ ] **Button**: Primary, secondary, and ghost variants.
- [ ] **Card**: Surface for reminder cards and history items.
- [ ] **Toggle/Switch**: Custom styled switch for reminder enabling.
- [ ] **Modal**: Base modal for reminder editing and onboarding steps.
- [ ] **Iconography**: Integrate `lucide-react` icons (Section 12.3).

### [UI] Storybook Integration
- [ ] Initialize and configure Storybook for shared component development.
- [ ] Create stories for shared components (Button, Card, Toggle, Modal).
- [ ] Configure Storybook to use Design Tokens (CSS variables).

---

## 4. Feature Development

### [FEATURE] Onboarding Flow
- [ ] Implement `OnboardingFlow.tsx` with 3 swipeable screens (Section 7.5).
- [ ] Screen 1: "Meet your crew" (Character intro).
- [ ] Screen 2: "Your reminders" (Quick setup).
- [ ] Screen 3: "How you like it" (Sound/vibration prefs).

### [FEATURE] Home Screen
- [ ] **Hero Section**: Display active cat idle animation and "Next Up" countdown (Section 14.1).
- [ ] **Streak Banner**: Show consecutive days counter.
- [ ] **Reminder Card List**: Render list of 5 categories with quick-toggles (Section 14.2).
- [ ] Implement card expansion for quick-edit options.

### [FEATURE] Reminder Edit Screen
- [ ] Create `ReminderEdit.tsx` for deep configuration of a reminder (Section 7.2).
- [ ] Implement Time/Interval selection.
- [ ] Implement Repeat Pattern selection (Daily, Weekdays, Custom).
- [ ] Implement Sound/Snooze/Character overrides.

### [FEATURE] Settings Screen
- [ ] Implement `SettingsScreen.tsx` with all sections from Section 9.
- [ ] Notification style & DND window.
- [ ] Appearance (Theme, Character, Language).
- [ ] Data Management (Export CSV, Clear History).

### [FEATURE] History & Stats
- [ ] Implement `HistoryScreen.tsx` (Section 7.4).
- [ ] **HeatmapCalendar**: Visual log of daily completions.
- [ ] **Stats View**: Per-category completion rate and streak records.

---

## 5. Assets & Animations

### [ASSETS] Lottie Animation Integration
- [ ] Implement `LottiePlayer.tsx` wrapper for `lottie-web`.
- [ ] Set up `registry.ts` for all 8 core animation keys (Section 13.2).
- [ ] Integrate Mochi character Lottie JSON files (Phase 1).

### [ASSETS] Audio Integration
- [ ] Add `chime_soft.mp3`, `bell_gentle.mp3`, and `chime_persistent.mp3` to `src/assets/sounds/`.

---

## 6. Testing & QA

### [TEST] Core System Unit Tests
- [ ] Implement `scheduler.test.ts` for fire time calculations (Section 15.2).
- [ ] Implement `migrations.test.ts` for DB versioning logic.
- [ ] Implement `messages.test.ts` for i18n message picking.

### [TEST] Component & Feature Tests
- [ ] Implement `ReminderCard.test.tsx` (Section 15.2).
- [ ] Implement `StreakCalculator.test.ts` for streak logic accuracy.

### [QA] Accessibility & Polish
- [ ] Verify `aria-label` on all interactive elements (Section 16).
- [ ] Ensure touch targets meet 44x44 dp minimum.
- [ ] Verify `prefers-reduced-motion` support.
