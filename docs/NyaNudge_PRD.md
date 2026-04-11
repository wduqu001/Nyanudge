# NyaNudge — Product Requirements Document
**Version:** 1.0.0 | **Status:** Draft | **Author:** Senior Product Engineer

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
Android (primary), iOS (secondary — same codebase)

---

## 2. Concept & Value Proposition

NyaNudge is a wellness reminder app that sends scheduled notifications for five daily health habits: **hydration, meals, exercise, bathroom breaks, and medication**. Every alert is accompanied by a looping cat animation (GIF/Lottie) and a witty, category-specific message — transforming potentially ignored notifications into genuinely enjoyable micro-moments.

### Core differentiators
- **Cat-driven delight**: Animated cat characters react differently per reminder category — a shivering cat for hydration, a stretching cat for exercise.
- **Minimal friction**: A single home screen shows all active reminders at a glance, with zero mandatory account creation.
- **Respectful notifications**: Users choose between sound + vibration, vibration-only, or silent.
- **Privacy-first**: All data stays on-device in a versioned local SQLite database. No telemetry.

---

## 3. Tech Stack

### Philosophy
The codebase uses the closest available technologies to standard web development, maximizing code reuse and lowering the barrier for web developers joining the project.

| Layer | Technology | Rationale |
|---|---|---|
| **Runtime** | [Capacitor.js](https://capacitorjs.com/) v6 | Native shell around a standard web app; literally runs React in a WebView |
| **UI Framework** | React 18 + TypeScript | Industry-standard; identical to web projects |
| **Build Tool** | Vite 5 | Fast HMR, familiar to web devs |
| **Styling** | CSS Modules + CSS custom properties | Zero runtime overhead; native dark mode via `prefers-color-scheme` |
| **State Management** | Zustand | Minimal boilerplate; serializable state for DB sync |
| **Local Database** | SQLite via `@capacitor-community/sqlite` | True relational storage on-device |
| **ORM / Migrations** | Drizzle ORM + `drizzle-kit` | Schema-as-TypeScript; built-in migration versioning |
| **Notifications** | `@capacitor/local-notifications` | Scheduled local push; no backend required |
| **Animations** | Lottie via `lottie-web` | Vector animations; replaces GIF assets for performance |
| **i18n** | `i18next` + `react-i18next` | De-facto standard; JSON-based translation files |
| **Testing** | Vitest + React Testing Library | Vite-native; web-compatible test runner |

### Why Capacitor over React Native?
Capacitor compiles a standard Vite/React web app into a native Android/iOS project. CSS, HTML, and browser APIs work exactly as on the web — the developer experience is 1:1 with frontend web development. There is no bridging layer between JavaScript and UI rendering.

---

## 4. Architecture Overview

```
src/
├── core/
│   ├── db/              # Drizzle ORM schema, migrations, seed
│   ├── notifications/   # Scheduling logic, sound/vibration handlers
│   ├── i18n/            # i18next setup, locale JSON files
│   └── store/           # Zustand stores (reminders, preferences, stats)
├── features/
│   ├── home/            # Home screen — active reminders overview
│   ├── reminders/       # Add/edit reminder flow
│   ├── settings/        # User preferences
│   ├── history/         # Log of completed reminders
│   └── onboarding/      # First-run walkthrough (3 screens)
├── shared/
│   ├── components/      # Button, Card, Toggle, Modal, etc.
│   ├── animations/      # Lottie player wrapper + asset registry
│   ├── hooks/           # useReminders, usePreferences, useDarkMode
│   └── utils/           # Time formatting, repeat logic, etc.
├── assets/
│   ├── lottie/          # Cat animation JSON files (6 animations)
│   └── sounds/          # Notification audio files (3 tracks)
└── capacitor.config.ts
```

---

## 5. Color System & Design Tokens

### Design Philosophy
Minimal, warm-neutral base with a single accent color per theme. The palette intentionally avoids saturated blues/purples (common in health apps) to feel more approachable and cat-like.

### Tokens (`src/shared/styles/tokens.css`)

```css
:root {
  /* --- Neutral ramp --- */
  --color-neutral-50:  #FAFAF9;
  --color-neutral-100: #F4F3F1;
  --color-neutral-200: #E8E6E1;
  --color-neutral-300: #CCCAC4;
  --color-neutral-400: #A09E98;
  --color-neutral-500: #74726C;
  --color-neutral-600: #55544F;
  --color-neutral-700: #3A3935;
  --color-neutral-800: #242320;
  --color-neutral-900: #141412;

  /* --- Accent: Tangerine (warm, playful) --- */
  --color-accent-100: #FDEBD8;
  --color-accent-200: #FAC896;
  --color-accent-300: #F5A155;
  --color-accent-400: #E97B22;  /* Primary accent */
  --color-accent-500: #C45E0E;

  /* --- Semantic --- */
  --color-water:    #3B8BD4;  /* Hydration */
  --color-food:     #5DAA62;  /* Meal */
  --color-exercise: #E97B22;  /* Exercise */
  --color-bathroom: #8A72C8;  /* Bathroom */
  --color-medicine: #D65B5B;  /* Medication */

  /* --- Surface (Light Mode) --- */
  --surface-bg:        var(--color-neutral-50);
  --surface-card:      #FFFFFF;
  --surface-overlay:   rgba(0,0,0,0.04);
  --text-primary:      var(--color-neutral-900);
  --text-secondary:    var(--color-neutral-500);
  --text-muted:        var(--color-neutral-300);
  --border-subtle:     var(--color-neutral-200);
  --accent:            var(--color-accent-400);
}

@media (prefers-color-scheme: dark) {
  :root {
    --surface-bg:      var(--color-neutral-900);
    --surface-card:    var(--color-neutral-800);
    --surface-overlay: rgba(255,255,255,0.05);
    --text-primary:    var(--color-neutral-50);
    --text-secondary:  var(--color-neutral-400);
    --text-muted:      var(--color-neutral-600);
    --border-subtle:   var(--color-neutral-700);
    --accent:          var(--color-accent-300);
  }
}
```

### Category Color Usage
Each reminder type has a reserved semantic color used consistently for: card left-border accent, icon fill, and notification dot.

---

## 6. Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Display / Hero | [Nunito](https://fonts.google.com/specimen/Nunito) | 28–36px | 700 |
| Heading | Nunito | 20–22px | 600 |
| Body | Nunito | 16px | 400 |
| Label / Caption | Nunito | 13px | 500 |
| Mono (debug) | JetBrains Mono | 13px | 400 |

**Rationale:** Nunito's rounded letterforms complement the cat theme without being childish. It is available as a variable font (single file), reducing load time. No system font fallbacks visible in final builds.

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
- **Snooze duration**: 5 min, 10 min, 15 min, 30 min, off
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
    ○ Compact (no animation preview)
  
  Do Not Disturb
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
  
  Reset all to defaults  [Button]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DATA
  Export history as CSV  [Button]
  Clear all history      [Button — destructive]
  App version            1.0.0 (build 1)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Settings Data Model
All settings are persisted in the `preferences` table (see DB schema). They are loaded into a Zustand store on app startup and written back on every change.

---

## 10. Notification System

### 10.1 Notification Scheduling Flow
```
User enables reminder
    ↓
calculateNextFireTime(rule: ReminderRule) → Date[]
    ↓
@capacitor/local-notifications.schedule({
  notifications: [{
    id: notification_id,
    title: categoryTitle(locale),
    body: pickMessage(category, seed),
    schedule: { at: fireTime, repeats: true },
    sound: soundFile | undefined,
    channelId: 'nyanudge_default',
    extra: { reminderId, category, animationKey }
  }]
})
    ↓
Notification fires → user taps → app opens
    ↓
NotificationActionHandler.handle(action)
  → 'open':  navigate to reminder card + play animation
  → 'snooze': reschedule +N minutes
  → 'done':  log completion + update streak
```

### 10.2 Sound Files
| File | Usage | Duration |
|---|---|---|
| `chime_soft.mp3` | Water, Bathroom | 1.2 s |
| `bell_gentle.mp3` | Meal, Exercise | 1.5 s |
| `chime_persistent.mp3` | Medication | 2.0 s (loops ×2) |

All audio files are mono, 44.1 kHz, < 60 KB. Encoded as MP3 for broadest Android compatibility.

### 10.3 Android Notification Channels
```typescript
// capacitor.config.ts
{
  plugins: {
    LocalNotifications: {
      channels: [
        {
          id: 'nyanudge_default',
          name: 'NyaNudge Reminders',
          importance: 4,       // HIGH
          visibility: 1,       // PUBLIC
          sound: 'chime_soft', // default
          vibration: true,
          lights: true,
          lightColor: '#E97B22'
        },
        {
          id: 'nyanudge_medication',
          name: 'Medication Reminders',
          importance: 5,       // MAX (heads-up)
          visibility: 1,
          sound: 'chime_persistent',
          vibration: true,
          lights: true,
          lightColor: '#D65B5B'
        },
        {
          id: 'nyanudge_silent',
          name: 'NyaNudge Silent',
          importance: 2,       // LOW — no sound, no pop
          vibration: false
        }
      ]
    }
  }
}
```

---

## 11. Local Database Schema & Migrations

### 11.1 Technology Choice
- **Engine:** SQLite (via `@capacitor-community/sqlite`)
- **ORM:** Drizzle ORM (schema-as-TypeScript, zero query builders at runtime)
- **Migration runner:** `drizzle-kit generate:sqlite` + custom `MigrationRunner` service that tracks applied migrations in `__drizzle_migrations` table.

### 11.2 Schema (`src/core/db/schema.ts`)

```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// User preferences
export const preferences = sqliteTable('preferences', {
  key:       text('key').primaryKey(),
  value:     text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Reminder definitions
export const reminders = sqliteTable('reminders', {
  id:          text('id').primaryKey(),          // UUID
  category:    text('category').notNull(),        // water|meal|exercise|bathroom|medicine
  label:       text('label').notNull(),
  enabled:     integer('enabled', { mode: 'boolean' }).default(true),
  soundMode:   text('sound_mode').default('sound_vibration'),
  snoozeMins:  integer('snooze_mins').default(10),
  character:   text('character').default('mochi'),
  createdAt:   integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt:   integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Scheduled times (one row per scheduled fire per reminder)
export const schedules = sqliteTable('schedules', {
  id:         text('id').primaryKey(),
  reminderId: text('reminder_id').notNull().references(() => reminders.id, { onDelete: 'cascade' }),
  type:       text('type').notNull(),  // 'fixed' | 'interval'
  timeValue:  text('time_value'),      // "08:00" for fixed; "120" (mins) for interval
  daysOfWeek: text('days_of_week'),    // JSON: [0,1,2,3,4,5,6]
  startTime:  text('start_time'),      // "07:00" — interval window start
  endTime:    text('end_time'),        // "21:00" — interval window end
  notifId:    integer('notif_id'),     // Capacitor notification ID
});

// Completion log
export const completionLog = sqliteTable('completion_log', {
  id:         text('id').primaryKey(),
  reminderId: text('reminder_id').notNull().references(() => reminders.id),
  category:   text('category').notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
  wasSkipped:  integer('was_skipped', { mode: 'boolean' }).default(false),
});

// Streak tracking
export const streaks = sqliteTable('streaks', {
  category:       text('category').primaryKey(),
  currentStreak:  integer('current_streak').default(0),
  longestStreak:  integer('longest_streak').default(0),
  lastCompletedDate: text('last_completed_date'), // ISO date 'YYYY-MM-DD'
});
```

### 11.3 Migration Versioning Pattern

```typescript
// src/core/db/migrations/index.ts
export const migrations: Migration[] = [
  {
    version: 1,
    description: 'Initial schema',
    up: `
      CREATE TABLE IF NOT EXISTS preferences ( ... );
      CREATE TABLE IF NOT EXISTS reminders ( ... );
      CREATE TABLE IF NOT EXISTS schedules ( ... );
      CREATE TABLE IF NOT EXISTS completion_log ( ... );
      CREATE TABLE IF NOT EXISTS streaks ( ... );
    `,
    down: `DROP TABLE IF EXISTS ...`
  },
  {
    version: 2,
    description: 'Add custom_message to reminders',
    up: `ALTER TABLE reminders ADD COLUMN custom_message TEXT;`,
    down: `-- SQLite does not support DROP COLUMN; handled by table recreation`
  }
  // Future migrations appended here
];

// MigrationRunner applies unapplied migrations in order
// and stores the current version in preferences table under key '__db_version'
```

### 11.4 Seed Data (first install)

```typescript
// src/core/db/seed.ts
// Inserted on first launch when DB version = 0
export const defaultReminders = [
  { id: uuid(), category: 'water',    label: 'Drink Water',   enabled: true,  ... },
  { id: uuid(), category: 'meal',     label: 'Eat Something', enabled: true,  ... },
  { id: uuid(), category: 'exercise', label: 'Move Your Body',enabled: false, ... },
  { id: uuid(), category: 'bathroom', label: 'Bathroom Break',enabled: false, ... },
  { id: uuid(), category: 'medicine', label: 'Medication',    enabled: false, ... },
];
```

---

## 12. Internationalization (i18n)

### 12.1 Setup (`src/core/i18n/index.ts`)
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';
import ja from './locales/ja.json';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, 'pt-BR': { translation: ptBR }, ja: { translation: ja } },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});
```

### 12.2 Supported Locales (v1.0)
| Code | Language | Status |
|---|---|---|
| `en` | English | Complete |
| `pt-BR` | Brazilian Portuguese | Complete |
| `ja` | Japanese | Partial (cat messages only) |
| `es` | Spanish | Planned v1.1 |
| `de` | German | Planned v1.1 |

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
All animations are shipped as **Lottie JSON files** (`.lottie`), played via `lottie-web`. This approach:
- Eliminates GIF file size bloat (a 3-second GIF ≈ 600 KB; equivalent Lottie ≈ 15 KB)
- Supports color theming at runtime (swap fill colors to match dark/light mode)
- Allows playback speed control and frame-precise pausing

### 13.2 Animation Manifest

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

### 15.1 Test Runner Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov'] }
  }
});
```

### 15.2 Minimum Required Test Cases

#### `src/core/notifications/__tests__/scheduler.test.ts`
```typescript
describe('calculateNextFireTime', () => {
  it('returns next fixed time today if not yet passed')
  it('returns next fixed time tomorrow if already passed today')
  it('respects interval boundaries (start/end window)')
  it('skips days not in daysOfWeek array')
  it('handles midnight crossing correctly')
})
```

#### `src/core/db/__tests__/migrations.test.ts`
```typescript
describe('MigrationRunner', () => {
  it('applies all migrations on a fresh database')
  it('skips already-applied migrations')
  it('applies migrations in ascending version order')
  it('rolls back on error without corrupting the DB')
  it('stores current version in preferences table')
})
```

#### `src/core/i18n/__tests__/messages.test.ts`
```typescript
describe('pickMessage', () => {
  it('returns a string for every valid category')
  it('cycles through all messages before repeating')
  it('never returns undefined for unknown category (falls back)')
  it('respects locale — pt-BR returns Portuguese string')
})
```

#### `src/features/home/__tests__/ReminderCard.test.tsx`
```typescript
describe('ReminderCard', () => {
  it('renders title and next fire time')
  it('toggle changes enabled state in store')
  it('applies category color to left border')
  it('shows correct time format based on locale (12h vs 24h)')
})
```

#### `src/core/db/__tests__/streaks.test.ts`
```typescript
describe('StreakCalculator', () => {
  it('increments streak on consecutive day completion')
  it('resets streak on missed day')
  it('does not increment for duplicate completion same day')
  it('updates longest streak when current exceeds it')
})
```

### 15.3 Coverage Target
- Minimum 70% line coverage on `src/core/**`
- Minimum 50% line coverage on `src/features/**`

### 15.4 CI Integration
Tests run via `vitest run --coverage` in GitHub Actions on every pull request. Failing tests block merge.

---

## 16. Accessibility

- All interactive elements have `aria-label` attributes
- Touch targets minimum 44×44 dp
- Color is never the sole carrier of information (icons + text always accompany color)
- Notification text is limited to 80 characters for readability on lock screens
- `prefers-reduced-motion` media query suppresses Lottie animations when set
- Font sizes respect user's OS accessibility font scaling (`em` units throughout)

---

## 17. Project Structure (Full)

```
nyanudge/
├── android/                  # Capacitor Android project (generated)
├── ios/                      # Capacitor iOS project (generated)
├── src/
│   ├── core/
│   │   ├── db/
│   │   │   ├── schema.ts
│   │   │   ├── migrations/
│   │   │   │   ├── index.ts
│   │   │   │   └── 001_initial.sql
│   │   │   ├── MigrationRunner.ts
│   │   │   └── seed.ts
│   │   ├── notifications/
│   │   │   ├── scheduler.ts
│   │   │   ├── handler.ts
│   │   │   └── sounds.ts
│   │   ├── i18n/
│   │   │   ├── index.ts
│   │   │   └── locales/
│   │   │       ├── en.json
│   │   │       ├── pt-BR.json
│   │   │       └── ja.json
│   │   └── store/
│   │       ├── remindersStore.ts
│   │       ├── preferencesStore.ts
│   │       └── statsStore.ts
│   ├── features/
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── ReminderCard.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── StreakBanner.tsx
│   │   │   └── __tests__/
│   │   ├── reminders/
│   │   │   ├── ReminderEdit.tsx
│   │   │   └── ScheduleBuilder.tsx
│   │   ├── settings/
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── sections/
│   │   ├── history/
│   │   │   ├── HistoryScreen.tsx
│   │   │   └── HeatmapCalendar.tsx
│   │   └── onboarding/
│   │       ├── OnboardingFlow.tsx
│   │       └── steps/
│   ├── shared/
│   │   ├── components/
│   │   │   ├── Button.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── animations/
│   │   │   ├── LottiePlayer.tsx
│   │   │   └── registry.ts
│   │   └── hooks/
│   │       ├── useReminders.ts
│   │       ├── usePreferences.ts
│   │       └── useDarkMode.ts
│   ├── assets/
│   │   ├── lottie/
│   │   │   ├── cat_idle.json
│   │   │   ├── cat_water.json
│   │   │   └── ... (6 files total)
│   │   └── sounds/
│   │       ├── chime_soft.mp3
│   │       ├── bell_gentle.mp3
│   │       └── chime_persistent.mp3
│   ├── App.tsx
│   └── main.tsx
├── capacitor.config.ts
├── vite.config.ts
├── vitest.config.ts
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

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

---

*End of Document — NyaNudge PRD v1.0.0*
