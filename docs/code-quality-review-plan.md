# Code Quality Review Plan

**Date:** 2026-07-25
**Scope:** Full repository review for potential bugs, quality risks, and documentation drift.

## What I checked
- Core DB/migration/bootstrap flow
- Notification scheduling and snooze handling
- Reminder and preference stores
- Home, reminder edit, history, settings, and onboarding flows
- Test coverage and Storybook/a11y results
- Markdown docs vs current implementation

## Validation results
- Static TypeScript / lint sweep: no errors reported
- Test run: failed
  - `npm test -- --run`
  - 4 failing Storybook test files, 9 failing tests
- Most failures were accessibility checks in shared UI stories

## Checklist

- [ ] Fix shared UI accessibility regressions
  - [ ] Raise BottomNav contrast to WCAG AA
  - [ ] Fix HeatmapCalendar active-cell contrast
  - [ ] Fix StatsCard contrast
  - [ ] Remove nested interactive controls from clickable Card
- [ ] Fix snooze notification id handling
  - [ ] Pass the active notification id instead of `0`
  - [ ] Add a regression test for snooze behavior
- [ ] Harden web DB bootstrap
  - [ ] Make `jeep-sqlite` initialization deterministic
  - [ ] Add a test for the missing-element path
- [ ] Tighten preference parsing
  - [ ] Parse values by key/type instead of guessing from strings
  - [ ] Add parsing edge-case tests
- [ ] Guard reminder hydration against schema drift
  - [ ] Add compatibility checks for older/partial DBs
  - [ ] Add migration compatibility coverage
- [ ] Clarify streak semantics
  - [ ] Decide whether same-day completions should count multiple times
  - [ ] Add a regression test for the chosen behavior
- [ ] Remove repo hygiene noise
  - [ ] Consolidate duplicate test files
  - [ ] Remove or update stale animation registry TODOs
- [ ] Refresh stale docs after code changes
  - [ ] Update README claims that no longer match reality
  - [ ] Rewrite or retire the stale PRD sections
  - [ ] Re-check design and deployment docs for drift

## Priority findings

### P0 — Fix shared UI accessibility regressions
**Files:**
- `src/shared/components/BottomNav/BottomNav.tsx`
- `src/shared/components/BottomNav/BottomNav.module.css`
- `src/shared/components/Card/Card.tsx`
- `src/features/history/components/HeatmapCalendar.tsx`
- `src/features/history/components/HeatmapCalendar.module.css`
- `src/features/history/components/StatsCard.tsx`
- `src/features/history/components/StatsCard.module.css`

**Observed issues:**
- Bottom nav contrast fails in Storybook a11y checks
- Heatmap active cells fail contrast checks
- Stats cards fail contrast checks
- `Card` story reports nested interactive controls

**Why this matters:**
These are shared components. The same styling/structure is used in the app, so this is likely a production accessibility regression, not just a story-only issue.

**Suggested fix:**
- Raise low-contrast text colors to meet WCAG AA
- Remove/avoid nested interactive descendants inside clickable cards
- Re-run Storybook a11y after adjustments

---

### P1 — Snooze action uses an invalid notification id
**File:** `src/features/home/HomeScreen.tsx`

**Observed issue:**
- The snooze button calls `snoozeReminder(0, rem)`

**Why this matters:**
Passing `0` can break notification replacement semantics and may produce duplicate/orphan notifications depending on platform behavior.

**Suggested fix:**
- Use the actual active notification id from the tapped notification/action payload
- Thread that id through the action sheet state or derive it from the notification object
- Add a regression test for the snooze path

---

### P1 — Database bootstrap is fragile on web
**File:** `src/core/db/database.ts`

**Observed issue:**
- `initWebStore()` only runs if `<jeep-sqlite>` is present in the DOM

**Why this matters:**
This is a brittle startup dependency for the web DB path. If the element is missing or timing changes, initialization may partially succeed but behave incorrectly later.

**Suggested fix:**
- Make web-store initialization explicit and deterministic
- Fail loudly when the web SQLite element is missing instead of silently skipping setup
- Add a test for the missing-element case

---

### P2 — Preference parsing is overly permissive
**File:** `src/core/db/PreferenceService.ts`

**Observed issue:**
- Any numeric-looking string is coerced to a number on read
- Boolean string coercion is handled, but keys are not validated

**Why this matters:**
A value intended as a string can silently change type when loaded.

**Suggested fix:**
- Parse by known preference key/type instead of guessing from the value shape
- Add tests for string-like numeric values and boolean values

---

### P2 — Reminder hydration assumes schema shape without guardrails
**File:** `src/core/db/ReminderService.ts`

**Observed issue:**
- Queries assume `archived` and all schedule columns exist and are valid
- Hydration will be fragile if the DB is partially migrated or older than expected

**Why this matters:**
Users upgrading from older app versions can hit hard-to-diagnose startup failures.

**Suggested fix:**
- Add schema/version guardrails around hydration
- Consider safer fallbacks when optional columns are missing
- Add migration compatibility tests

---

### P2 — Streak logic allows multiple increments in one day
**File:** `src/core/store/statsStore.ts`

**Observed issue:**
- `incrementStreak()` increments even if called multiple times on the same calendar day

**Why this matters:**
If streaks are meant to represent daily consistency, repeated completions can inflate counts.

**Suggested fix:**
- Decide whether same-day repeats should count
- If not, gate increments by `lastCompletedDate`
- Add a regression test for duplicate same-day completions

---

### P3 — Duplicate test files add maintenance noise
**Files:**
- `src/features/home/HomeScreen.test.tsx`
- `src/features/home/__tests__/HomeScreen.test.tsx`
- `src/features/reminders/ReminderEdit.test.tsx`
- `src/features/reminders/__tests__/ReminderEdit.test.tsx`

**Why this matters:**
Duplicate suites can diverge and make it harder to know which expectation is authoritative.

**Suggested fix:**
- Consolidate to one test location per component
- Remove duplicates after confirming coverage is preserved

---

### P3 — Animation registry still has migration TODOs
**File:** `src/shared/animations/registry.ts`

**Observed issue:**
- The registry still contains a TODO about migrating `cat_exercise` and `cat_bathroom`

**Why this matters:**
This is a stale implementation note in a central asset registry.

**Suggested fix:**
- Either complete the migration and remove the TODO or update the comment to match the current asset strategy

## Documentation drift

### `README.md`
Potentially outdated or aspirational:
- Claims an 80% coverage minimum, but the current test run still has Storybook/a11y failures
- Mentions Maestro/native testing flow without repo-level verification in this pass
- Feature descriptions are a bit more polished than what the current codebase enforces

### `docs/NyaNudge_PRD.md`
Clearly stale relative to code:
- Mentions React 18 / Vite 5 / Capacitor v6, but repo uses React 19 / Vite 8 / Capacitor 8
- Migration/versioning docs do not match current `__db_version` tracking in `preferences`
- References files/structure that no longer exist
- Coverage/test assumptions do not match current config and results

### `DESIGN.md`
Mostly aligned, but partially stale:
- Visual direction still matches
- Accessibility/contrast guidance is not consistently reflected by current story output

### `src/assets/lottie/README.md`
Mostly accurate, but not fully current:
- Says everything is Lottie-based, while the registry comments describe partial migration to SVG components

### `docs/android_deployment_guidelines.md`
Needs re-checking:
- Manual build/install steps may not fully match the current Android project and plugin setup

### `CONTRIBUTING.md`
Mostly fine, but not fully authoritative:
- Mentions tooling/automation expectations that were not verified in this review

## Recommended execution order
1. Fix shared UI accessibility issues
2. Fix the snooze notification id bug
3. Harden DB bootstrap and preference parsing
4. Clarify streak semantics and add tests
5. Remove duplicate tests / stale TODOs
6. Update stale docs after the code changes land

## Notes
- The static compiler/lint pass is clean.
- The failing test run is useful signal, not noise: the Storybook a11y failures likely point to production issues.
- This plan file should be treated as a working checklist, not a final architecture document.
