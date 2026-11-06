# NyaNudge — Product Requirements Document
**Version:** 1.1.0 | **Status:** Living product spec | **Updated:** 2026-11-06

> Features and copy are the product intent. Where implementation is described, the code is the source of truth; this document points to it rather than copying it.

---

## Table of Contents
1. [App Identity](#1-app-identity)
2. [Concept & Value Proposition](#2-concept--value-proposition)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Overview](#4-architecture-overview)
5. [Color System & Design Tokens](#5-color-system--design-tokens)
6. [Typography](#6-typography)
7. [Feature Specification](#7-feature-specification)
8. [UX Copy — Reminder Phrases](#8-ux-copy--reminder-phrases)
9. [Settings Menu Specification](#9-settings-menu-specification)
10. [Notification System](#10-notification-system)
11. [Local Database Schema & Migrations](#11-local-database-schema--migrations)
12. [Internationalization (i18n)](#12-internationalization-i18n)
13. [Animation & Asset Strategy](#13-animation--asset-strategy)
14. [Home Screen UI Specification](#14-home-screen-ui-specification)
15. [Unit Test Plan](#15-unit-test-plan)
16. [Accessibility](#16-accessibility)
17. [Project Structure](#17-project-structure)

---

## 1. App Identity

### Name
**NyaNudge**

> *"Nya"* — the onomatopoeic cat sound in Japanese/internet culture (ニャー), widely known across global audiences.  
> *"Nudge"* — a gentle, non-intrusive push toward healthy habits.

The name is playful, internationally recognizable, and — as of research date — not registered on the Google Play Store.

### Tagline
> *"Your cat-powered wellness companion."*

### App Icon Concept
A round icon featuring a minimalist cat face with two eyes, with one eye replaced by a small clock/timer shape — conveying both the cat mascot and the reminder purpose. Works on both light and dark launcher backgrounds.

### Package Name
`com.quoryn.nyanudge.app`

### Target Platform
Android, distributed on Samsung Galaxy Store first. iOS is not set up (no `ios/` project).

---

## 2. Concept & Value Proposition

NyaNudge is a wellness reminder app that sends scheduled notifications for five daily health habits: **hydration, meals, exercise, bathroom breaks, and medication**. Every alert carries a witty, category-specific message, and the app itself is full of animated cats — transforming potentially ignored notifications into genuinely enjoyable micro-moments.

### Core differentiators
- **Cat-driven delight**: Animated cat characters react differently per reminder category — a shivering cat for hydration, a stretching cat for exercise.
- **Minimal friction**: A single home screen shows all active reminders at a glance, with zero mandatory account creation.
- **Respectful notifications**: Users choose between sound + vibration, vibration-only, or silent.
- **Privacy-first**: All data stays on-device in a versioned local SQLite database. No telemetry.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Capacitor 8 (Android) |
| UI | React 19 + TypeScript, Vite 8 |
| Styling | CSS Modules and global CSS with custom properties (`src/shared/styles/theme.css`) |
| State | Zustand stores in `src/core/store/` |
| Database | SQLite via `@capacitor-community/sqlite` (SQLCipher on device, sql.js in the browser) |
| Schema and migrations | Drizzle table definitions for types; hand-written SQL migrations applied by `MigrationRunner` |
| Notifications | `@capacitor/local-notifications` |
| Animations | lottie-web for idle/celebrate, hand-built SVG components for everything else |
| i18n | i18next + react-i18next |
| Testing | Vitest, Testing Library, Storybook with axe accessibility checks |

**Why Capacitor over React Native?** Capacitor runs a standard Vite/React web app inside a native shell, so CSS, HTML and browser APIs work exactly as on the web.

---

## 4. Architecture Overview

`src/core/` holds the database, notifications, i18n and stores; `src/features/` holds one folder per screen; `src/shared/` holds components, animations, hooks and utilities.

---

## 5. Color System & Design Tokens

Tokens and their light/dark values are documented in [DESIGN.md](../DESIGN.md) and defined in `src/shared/styles/theme.css`.

**Category colours** are used for card accents, icons and history bars:
- water #3B8BD4
- meal #5DAA62
- exercise #E97B22
- bathroom #8A72C8
- medicine #D65B5B

---

## 6. Typography

Nunito Variable for everything (bundled, no network font loading). Sizes and weights are tokens; see [DESIGN.md](../DESIGN.md).

---

## 7. Feature Specification

### 7.1 Reminder Types

| ID | Name | Default Schedule | Default Sound |
|---|---|---|---|
| `water` | Drink Water | Every 2 hours, 7 AM–9 PM | Soft chime |
| `meal` | Eat Something | 8 AM, 12:30 PM, 7 PM | Gentle bell |
| `exercise` | Move Your Body | 6:30 PM daily | Upbeat chime |
| `bathroom` | Bathroom Break | Every 3 hours, 9 AM–6 PM | Soft ping |
| `medicine` | Take Medication | Custom (user-defined) | Persistent chime |

### 7.2 User Configuration per Reminder
- **Enable/disable toggle** (without deleting schedule)
- **Time(s)**: single time or interval
- **Repeat pattern**: daily, weekdays, weekends, custom days
- **Sound mode**: Sound + Vibration | Vibration only | Silent
- **Snooze duration**: 5, 10, 15 or 30 min
- **Custom message** override (optional)
- **Assigned cat character** per reminder (3 cat characters available)

### 7.3 Home Screen
- Card list of all 5 reminder types
- "Next up" countdown for the nearest upcoming reminder
- Quick-toggle switches on each card
- Daily completion streak counter (top bar)
- Mini cat animation plays on app open (idle loop)

### 7.4 History / Stats Screen
- Daily completion log (calendar heatmap view)
- Per-category completion rate (last 7 days)
- Current streak and longest streak

### 7.5 Onboarding (first-run only)
3 swipeable screens:
1. **"Meet your crew"** — introduce the 3 cat characters
2. **"Your reminders"** — set up which reminders to activate
3. **"How you like it"** — choose sound/vibration preference

---

## 8. UX Copy — Reminder Phrases

All strings are stored in `src/core/i18n/locales/en.json` and translated. Each category has a pool of 8 messages; the app cycles through them to avoid repetition.

### 8.1 Hydration (Drink Water)
```
1. "Pspspsps... your water bowl is empty again. 🐱"
2. "Mrow! Cats need hydration too, but today it's YOUR turn."
3. "This is your water check-in. No, your tea doesn't count."
4. "A very serious cat has determined you need water. Right now."
5. "Nya~ Your body called. It's thirsty. Please hydrate."
6. "Zero water since last check. The cat is judging you. 🐾"
7. "Water o'clock! Your kidneys will thank you. The cat already does."
8. "Even fish swim in water. You should drink some."
```

### 8.2 Meals (Eat Something)
```
1. "Meow! Breakfast is the most important purr of the day."
2. "The cat has inspected your fridge. It demands you eat."
3. "Hunger makes humans grumpy. Cats know. The cat is watching."
4. "Your stomach just sent a strongly worded note. Signed, Lunch."
5. "Nya~ Food time! Even kibble sounds good right now, doesn't it?"
6. "Low energy detected. Cat recommends immediate snack deployment."
7. "This message was written by a well-fed cat who hopes you are too."
8. "Hey. HEY. Eat. The cat insists."
```

### 8.3 Exercise (Move Your Body)
```
1. "Stretch like a cat! Your spine will love you for it."
2. "Even cats do zoomies. It's your turn. 🏃"
3. "The world record for sitting still goes to... not you. Move!"
4. "Your daily stretch goal is waiting. The cat already warmed up."
5. "Nya! 10 minutes of movement = 10 happy purrs from your crew."
6. "A cat has rolled off the couch to motivate you. Don't let it be for nothing."
7. "Bodies in motion stay in motion. Bodies on the couch get nudged by cats."
8. "Five minutes of movement now > an hour of regret later. Go!"
```

### 8.4 Bathroom Break
```
1. "The cat has claimed the bathroom throne. But do go after."
2. "Gentle reminder: your bladder has rights too."
3. "A quick break is self-care. The cat approves. 🚽🐾"
4. "Step away from the screen. Yes, now. The cat is holding the door open."
5. "Your body sent a memo. It says: bathroom, please."
6. "Nya~ A tiny cat just knocked something off your desk to get your attention. Bathroom time!"
7. "Hydration check passed ✓  |  Bathroom break overdue ✗  |  You know what to do."
8. "The cat has given you the slow blink. That means bathroom break. Trust the cat."
```

### 8.5 Medication
```
1. "Time for your medicine. The cat is already waiting with water. 💊"
2. "Mrow! Medication o'clock. Don't make the cat come find you."
3. "Your daily dose. The cat checked the clock twice to be sure."
4. "Medicine reminder — because your future self asked us to remind you."
5. "Nya~ Small pill, big difference. You've got this. 🐾"
6. "The cat is sitting on your medication. That's the reminder."
7. "This message was approved by a very responsible cat. Take your meds."
8. "Today's health achievement unlocked: remembering your medication. 💊✓"
```

### 8.6 Snooze Confirmation Messages
```
Snoozed 5 min:  "Fine. 5 minutes. The cat is watching the clock."
Snoozed 10 min: "10 minutes. The cat is setting a timer. 👀"
Snoozed 15 min: "15 minutes. The cat notes this. It will be judged."
Snoozed 30 min: "30 minutes?! The cat is disappointed. See you soon."
```

### 8.7 Streak Messages
```
1 day:   "Day 1! The journey begins. 🐾"
3 days:  "3 days in a row. The cat is impressed."
7 days:  "One full week! You've unlocked the Proud Cat emoji. 🐱✨"
14 days: "Two weeks of consistency. The cat bows respectfully."
30 days: "30-day streak! You are the human the cat always believed in."
```

---

## 9. Settings Menu Specification

### Screen: Settings (`/settings`)

```
Settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTIFICATIONS
  Default sound mode
    ◉ Sound + Vibration
    ○ Vibration only
    ○ Silent
  
  Notification style
    ◉ Standard
    ○ Compact (title only, no cat message)
  
  Do Not Disturb (medication is exempt)
    Start time    [10:00 PM ▾]
    End time      [07:00 AM ▾]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APPEARANCE
  Theme
    ◉ Follow system
    ○ Light
    ○ Dark
  
  Cat character
    [Mochi ▾]  (options: Mochi / Sora / Kuro)
  
  Language
    [English ▾]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REMINDERS
  Default snooze duration
    [10 minutes ▾]
  
  Mark as done on open  [Toggle: OFF]
    When on, opening a notification marks
    the reminder as complete automatically.
  
  Reset all to defaults  [Button — asks to confirm; keeps language and onboarding]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATA
  Privacy policy         [Button]
  Clear all history      [Button — destructive]
  (Export history as CSV: planned, hidden in v1)
  App version            1.0.0 (build 1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Settings Data Model
All settings are persisted in the `preferences` table (see DB schema). They are loaded into a Zustand store on app startup and written back on every change.

---

## 10. Notification System

### 10.1 Scheduling
- **One-shot alarms only.** Every enabled reminder is planned as one-shot `allowWhileIdle` alarms for up to 30 days, built from local wall-clock times so DST changes don't shift them.
- **Shared budget.** All reminders share 400 alarms, below Android's 500-per-app cap.
- **Re-planning** happens on every change, at launch, after notification permission is granted, and when the app resumes and the plan is over 6 hours old.
- **Exact alarms** are used when allowed. Otherwise alarms are inexact, and the app never opens system settings by itself.
- **Do Not Disturb hours** skip every category except medicine.
- **Snoozes** have their own per-reminder ID and survive re-planning.
- **Reboots:** the plugin restores alarms after a reboot.

Code: `src/core/notifications/scheduler.ts`.

### 10.2 Sounds
| File | Usage |
|---|---|
| `chime_soft.mp3` | Water, Bathroom |
| `bell_gentle.mp3` | Meal, Exercise |
| `chime_persistent.mp3` | Medication |
| `silence.wav` | Vibration-only channel |

### 10.3 Android notification channels
On Android 8+, sound and vibration come from the channel, so each mode has one. The channels are created at runtime by `ensureNotificationChannels()`:
- `nyanudge_chime_soft` and `nyanudge_bell_gentle`: high importance.
- `nyanudge_medication`: max importance, uses `chime_persistent`.
- `nyanudge_vibrate`: high importance, silent sound, vibration on.
- `nyanudge_silent`: low importance, no sound, no vibration.

---

## 11. Local Database Schema & Migrations

- **Engine:** SQLite via `@capacitor-community/sqlite`.
- **Tables:** `preferences`, `reminders`, `schedules`, `completion_log` and `streaks`.
- **Schema:** `src/core/db/schema.ts`, with the SQL in `src/core/db/migrations/index.ts`.
- **Migrations:** `MigrationRunner` applies pending migrations in order and stores the version under the `__db_version` key in `preferences`.
- **Streaks:** computed from the distinct local days in `completion_log`; the `streaks` table is not read.
- **First launch:** `seed.ts` inserts the default reminders.

---

## 12. Internationalization (i18n)

### 12.1 Setup
`src/core/i18n/index.ts` registers the four locales below, starts in the device language (`detectDeviceLanguage`) and falls back to English.

### 12.2 Supported Locales (v1.0)
| Code | Language | Status |
|---|---|---|
| `en` | English | Complete (default and fallback) |
| `pt-BR` | Brazilian Portuguese | Complete |
| `es-ES` | Spanish | Complete |
| `ja` | Japanese | Complete |

The first launch follows the device language (pt-PT → pt-BR, any Spanish → es-ES); after that the saved setting wins.

### 12.3 Translation Key Structure (`en.json`)
```json
{
  "app": {
    "name": "NyaNudge",
    "tagline": "Your cat-powered wellness companion."
  },
  "categories": {
    "water":    { "name": "Drink Water",    "icon": "water" },
    "meal":     { "name": "Eat Something",  "icon": "meal" },
    "exercise": { "name": "Move Your Body", "icon": "exercise" },
    "bathroom": { "name": "Bathroom Break", "icon": "bathroom" },
    "medicine": { "name": "Medication",     "icon": "medicine" }
  },
  "messages": {
    "water":    ["Pspspsps... your water bowl is empty again.", "..."],
    "meal":     ["..."],
    "exercise": ["..."],
    "bathroom": ["..."],
    "medicine": ["..."]
  },
  "snooze": {
    "5":  "Fine. 5 minutes. The cat is watching the clock.",
    "10": "10 minutes. The cat is setting a timer.",
    "15": "15 minutes. The cat notes this. It will be judged.",
    "30": "30 minutes?! The cat is disappointed. See you soon."
  },
  "streaks": { ... },
  "settings": { ... },
  "onboarding": { ... },
  "actions": {
    "done": "Done",
    "snooze": "Snooze",
    "skip": "Skip for today",
    "enable": "Enable",
    "disable": "Disable",
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

---

## 13. Animation & Asset Strategy

### 13.1 Animation Engine
`cat_idle` and `cat_celebrate` play from Lottie JSON via `lottie-web`. The category and sleep animations are hand-built SVG React components; see `src/assets/lottie/README.md`.

### 13.2 Animation Manifest

> The Trigger column is the product intent. Today no screen plays these keys (`LottiePlayer` is used only in Storybook); the home screen shows the Mochi/Kuro/Sora SVG cats.

| Key | Trigger | Loop | Duration |
|---|---|---|---|
| `cat_idle` | App open, home screen | Yes | 2.5 s |
| `cat_water` | Water notification open | Once | 1.8 s |
| `cat_meal` | Meal notification open | Once | 2.0 s |
| `cat_exercise` | Exercise notification open | Once | 2.2 s |
| `cat_bathroom` | Bathroom notification open | Once | 1.6 s |
| `cat_medicine` | Medicine notification open | Once | 2.0 s |
| `cat_celebrate` | Streak milestone reached | Once | 3.0 s |
| `cat_sleep` | Do Not Disturb active | Yes | 4.0 s |

### 13.3 Character System
Three cat characters with distinct visual identities:
- **Mochi** — round, white, perpetually surprised. Embodies the "clueless but charming" personality.
- **Sora** — sleek, grey tabby, calm and reassuring. For users who want a less chaotic experience.
- **Kuro** — black cat with yellow eyes, mischievous. Maximum sass energy.

All three share the same Lottie animation rigs; color layers are swapped per character.

### 13.4 Asset Development Roadmap
```
Phase 1 (MVP): Mochi character only — 6 core animations
Phase 2:        Sora + Kuro characters, cat_celebrate + cat_sleep
Phase 3:        Seasonal variants (holiday hats, etc.)
```

---

## 14. Home Screen UI Specification

### 14.1 Layout Hierarchy

```
┌─────────────────────────────────┐
│  STATUS BAR (system)            │
├─────────────────────────────────┤
│  APP BAR                        │
│  [☰ menu]   NyaNudge   [⚙ gear]│
├─────────────────────────────────┤
│  HERO SECTION                   │
│  [Mochi idle animation]         │
│  "Next up: Drink Water — 14 min"│
├─────────────────────────────────┤
│  STREAK BANNER                  │
│  🔥 3-day streak                │
├─────────────────────────────────┤
│  REMINDER CARDS (scroll)        │
│  ┌──────────────────────────┐   │
│  │ 💧 Drink Water     [ON]  │   │
│  │  Next: 3:30 PM           │   │
│  └──────────────────────────┘   │
│  ┌──────────────────────────┐   │
│  │ 🍽 Eat Something   [ON]  │   │
│  │  Next: 7:00 PM           │   │
│  └──────────────────────────┘   │
│  (... 3 more cards ...)         │
├─────────────────────────────────┤
│  BOTTOM NAV                     │
│  [Home] [History] [Settings]    │
└─────────────────────────────────┘
```

### 14.2 Reminder Card Component

Each card has:
- **Left border** (4 px) in category color
- **Category icon** (24×24 SVG)
- **Title** in `--text-primary`
- **Next fire time** in `--text-secondary`
- **Toggle switch** (right-aligned)
- **Tap action**: expand card to show quick-edit options

### 14.3 Color Usage

| Element | Light | Dark |
|---|---|---|
| Screen background | `--color-neutral-50` | `--color-neutral-900` |
| Card surface | `#FFFFFF` | `--color-neutral-800` |
| Card border | `--color-neutral-200` | `--color-neutral-700` |
| Primary text | `--color-neutral-900` | `--color-neutral-50` |
| Secondary text | `--color-neutral-500` | `--color-neutral-400` |
| Accent | `#E97B22` | `#F5A155` |
| Toggle ON | `#E97B22` | `#F5A155` |

---

## 15. Unit Test Plan

Commands, coverage thresholds and CI are in [CONTRIBUTING.md](../CONTRIBUTING.md). CI fails below 80% line, branch, function or statement coverage.

---

## 16. Accessibility

- **Contrast:** text meets WCAG AA (4.5:1); controls meet 3:1. Checked by the Storybook axe stories.
- **Touch targets:** at least 44×44px.
- **Controls:** never nested; every control has an accessible name. Dialogs use `role="dialog"`, and the Android back button closes them.
- **Colour:** never the only carrier of information; icons and text accompany it.
- **Reduced motion:** the system "remove animations" setting stops CSS animations and the cats' JavaScript loops.
- **Font scaling:** font sizes are px tokens, so how OS font scaling behaves in the WebView is unverified.

---

## 17. Project Structure (Full)

See section 4 and the repository tree.

---

## Appendix A — Glossary

| Term | Definition |
|---|---|
| Category | One of 5 reminder types: water, meal, exercise, bathroom, medicine |
| Character | A cat persona assigned to a reminder (Mochi, Sora, Kuro) |
| Streak | Consecutive days with at least one completed reminder in a category |
| Schedule | A set of rules defining when a reminder fires |
| Seed data | Default reminder definitions inserted on first app launch |
| DB version | Integer tracking applied migration level; stored in `preferences` table |

---

## Appendix B — Changelog

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-03-22 | Initial PRD — complete feature spec for MVP |
| 1.1.0 | 2026-11-06 | Aligned with the shipped app: stack, scheduling, channels, settings, locales, accessibility; implementation detail replaced by pointers to code |

---

*End of Document — NyaNudge PRD v1.1.0*
