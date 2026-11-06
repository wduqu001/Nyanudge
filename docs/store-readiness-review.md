# Galaxy Store readiness review

**Updated:** 2026-11-06 · **Replaces:** `docs/code-quality-review-plan.md` (2026-07-25)

**Status:** code blockers are fixed on `main`. Before you submit, you still have to:
- run the device test pass in section 3 (no device was available during the review);
- do the owner tasks in section 2.

## 1. What changed during the review

How each fix was verified:
- unit tests (355 pass; coverage 80.02% branches, 81.84% functions);
- Storybook accessibility checks (58/58 pass);
- the merged release manifest;
- the plugin source code, where noted.

**Scheduling and notifications**
- **Daily reminders repeated at the wrong interval.** The plugin's `at` + `repeats` repeats every *(at − now)*, not every day. Reminders are now one-shot exact alarms planned 30 days ahead.
- **Weekday reminders fired 10 times at once.** Fixed.
- **First run scheduled nothing.** Reminders were planned before notification permission was granted. Now they're planned once it is granted.
- **Sound modes didn't work on Android 8+.** "Vibration only" and "Silent" still chimed. There is now one channel per sound mode.
- **Exact alarms:** both permissions are kept, for reliability across devices. When exact alarms aren't allowed, reminders fall back to inexact alarms and the app never opens system settings by itself.
- **Do Not Disturb** now applies, with medicine exempt.
- **Snoozes** have their own ID and survive re-planning.
- **Tray actions** are translated, and **mark-done-on-open** works.

**Android, release and privacy**
- **AdMob removed.** The release manifest has no ad permissions. Ad provider research: [ad-network-research.md](ad-network-research.md).
- **Signing:**
  - Secrets now come from `NYANUDGE_UPLOAD_*` properties instead of being committed.
  - The repo is public, so the old `"password"` remains visible in git history.
- **Launcher name and permissions:** the launcher name is "NyaNudge". The unused biometric permissions are removed.
- **Privacy policy:** in-app, in four languages, with a hosted copy at [privacy-policy.md](privacy-policy.md).
- **Debug UI** is hidden in release builds.
- **Hardware back** closes sheets, dialogs and onboarding steps first.

**Screens and data**
- **Edit screen:** styled again, with its missing translation keys fixed.
- **Translations:** pt-BR, es-ES and ja were missing keys (onboarding, the error page and more). Fixed.
- **Language:** the app now starts in the device language.
- **Streaks** are computed from the completion log. Before, they reset on every launch, counted twice on the same day and used UTC dates.
- **Reset:** asks for confirmation and keeps the language and onboarding state.
- **Empty labels** fall back to the category name.
- **Defaults:** the default sound, snooze and cat from Settings apply to new reminders.
- **Compact style** now shows only the category title.
- **Export CSV** is hidden until a real export exists.

**Accessibility and visual**
- **Contrast:** meets WCAG AA. Muted text, accent text and white-on-colour text were all below it.
- **Reminder cards** no longer nest the switch inside a clickable card.
- **Touch targets** are at least 44px.
- **Reduced motion** stops the cats' JavaScript animation loops.
- **Dark mode:** the gaps in the in-app theme override are fixed, and the History bar colours too.

**Tooling and docs**
- **Node 26:** the unit tests now run on it.
- **CI:**
  - It never type-checked: `tsc --noEmit` ran against a reference-only tsconfig. It now uses `tsc -b`.
  - The Android job was on Node 20 / JDK 17 and now uses Node 24 / JDK 21.
- **Docs:** README, CONTRIBUTING, DESIGN, the PRD and the build guide now match the code. Junk files are removed.

## 2. Owner tasks before submission

1. **Upload key:** create a permanent one, store its secrets in `~/.gradle/gradle.properties`, and back the key up in two places. Uploading an APK keeps your key; with an AAB, Samsung manages it.
2. **Privacy policy:** done. It's hosted at https://wduqu001.github.io/Nyanudge/privacy-policy/ and republished from `docs/privacy-policy.md` by `.github/workflows/privacy-pages.yml`. Enter the URL in Seller Portal.
3. **Seller Portal:**
   - commercial seller status;
   - Android developer verification, which is needed for Brazilian users;
   - an English default listing with pt-BR and es listings;
   - age rating;
   - a Data Safety declaration of "no data collected";
   - screenshots and the 512×512 icon.
4. **Version:** `versionName 1.0` / `versionCode 1` in `android/app/build.gradle` are fine for a first release. Settings hard-codes "1.0.0 (build 1)", so update both together.

## 3. Device test pass (not yet done)

Test on a Galaxy phone on Android 14 or newer, ideally plus one on Android 12:
- [ ] **First launch:** allow notifications, and a reminder set two minutes ahead fires on time. Also deny once, to see what happens.
- [ ] **Sound modes:** sound + vibration, vibration only, and silent each behave as named. Medication uses its own sound.
- [ ] **Weekday reminder** fires only on the chosen days.
- [ ] **Doze:** a reminder fires on time with the screen off for 30+ minutes.
- [ ] **Reboot:** reminders still fire. Missed ones show once, about 15 s after boot.
- [ ] **Tray actions:** Done and Snooze work with the app closed. Snooze fires after the chosen minutes.
- [ ] **Back button:** closes the sheet, the dropdowns and onboarding steps, then minimizes the app from Home.
- [ ] **Rotation and display:** rotate on every screen; dark mode, and Light/Dark chosen in the app; system font size at its largest.
- [ ] **Reduced motion:** with "Remove animations" on, the cats are still.
- [ ] **Languages:** pt-BR, es and ja on the device. Nothing is cut off, and the notification channel names are translated.

## 4. Open engineering items

Not blocking submission. Listed so they aren't lost:

**Features and assets**
- **Animations on notification open** (PRD §13) aren't implemented: `LottiePlayer` is only used in Storybook. `registry.ts` still imports Lottie JSON that never plays.
- **Maestro flows** in `.maestro/` look for UI text that no longer exists.

**Tests and code health**
- **Duplicate test files:** HomeScreen, ReminderEdit, SettingsScreen and ReminderService each have two suites.
- **Coverage margin** is thin: 80.02% against an 80% threshold.

**Data and database** (carried over from the July plan; still open)
- **The web DB bootstrap** skips setup silently when `<jeep-sqlite>` is missing.
- **Preference parsing** turns any numeric-looking string into a number.
- **Hydration** has no guard against a partially migrated schema.
- **The SQLCipher passphrase** is hard-coded (`database.ts`), so the encryption adds little. The privacy policy doesn't claim encryption.

**UI**
- **Hard-coded English:** the time units "h", "m" and "d" in the Home countdown.
- **Native dialogs:** clear-history and reset use `window.confirm`/`alert`; in-app dialogs would look better.
- **Font sizes** are px tokens, so OS font scaling in the WebView is unverified (see the device pass).

**Platform and stores**
- **APK size:** the release APK is 28.5 MB, mostly SQLCipher for four ABIs.
- **Google Play later:** switch to `SCHEDULE_EXACT_ALARM` plus an in-app grant flow, because Play limits `USE_EXACT_ALARM`. With AdMob, `app-ads.txt` will eventually be required.

## 5. Galaxy Store requirements found (sources read 2026-11-06)

| Requirement | Status | Source |
|---|---|---|
| Target API ≥ 34 | ✓ 35 | seller.samsungapps.com notice 0000008212 |
| 16 KB page size, mandatory (date postponed, not yet announced) | ✓ ELF p_align 16384 on all 4 ABIs | notice 0000011451 |
| 64-bit binary | ✓ arm64-v8a | notice 0000007772 |
| Signed with a real key; the same key for every update | Owner task 1 | developer.samsung.com/galaxy-store/launch.html |
| Privacy policy in the app and as a URL | ✓ both | Distribution Guide 3.1.2–3.1.3 |
| Launcher name and icon match the listing | ✓ "NyaNudge" | Self-Check List |
| Back key, rotation and no crashes | Device pass | Distribution Guide 1.1, 1.4.6; Self-Check List |
| Request only the permissions you need | ✓ biometric and ad permissions removed | Distribution Guide 3.1.6 |
| English default listing when selling in more than one country | Owner task 3 | Distribution Guide 1.3.2 |

The Distribution Guide is at developer.samsung.com/galaxy-store/distribution-guide.html. Unverified: current screenshot and icon specs (the only source is a 2021 PDF: icon 512×512 PNG), title and description length limits, and whether the age rating uses IARC.
