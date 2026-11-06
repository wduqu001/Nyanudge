# Design system: NyaNudge

Tokens live in `src/shared/styles/theme.css`; use them instead of literal colours. Accessibility rules are checked by the Storybook stories (`npx vitest run --project=storybook`, axe).

## 1. Atmosphere
Calm and playful: a warm neutral base, one tangerine accent, generously rounded shapes, and the cats as the personality. Never clinical, never loud.

## 2. Colour
| Role | Token | Light | Dark |
|---|---|---|---|
| Background | `--surface-bg` | #FAFAF9 | #141412 |
| Card | `--surface-card` | #FFFFFF | #242320 |
| Primary text | `--text-primary` | #141412 | #FAFAF9 |
| Secondary text | `--text-secondary` | #74726C | #A09E98 |
| Muted text, disabled items, switch track | `--text-muted` | #74726C | #A09E98 |
| Borders, dividers | `--border-subtle` | #E8E6E1 | #3A3935 |
| Accent fill (buttons, active states, focus rings) | `--accent` | #E97B22 | #F5A155 |
| Accent text on light surfaces | `--accent-text` | #A9530C | #F5A155 |
| Selected background | `--surface-selected` | #FDEBD8 | accent at 20% |

**Category colours** (`--color-water`, `--color-food`, `--color-exercise`, `--color-bathroom`, `--color-medicine`) mark cards, icons and history bars:
- water #3B8BD4
- food #5DAA62
- exercise #E97B22
- bathroom #8A72C8
- medicine #D65B5B

Contrast rules:
- **Text:** at least 4.5:1 (WCAG AA).
- **Controls and their boundaries:** at least 3:1.
- **Text on accent or category fills** uses `--color-neutral-900`. White fails on these colours.
- **No pure black;** the darkest colour is #141412.

Theming: the in-app Light/Dark choice sets `data-theme` on `<html>`. Every token overridden under `prefers-color-scheme: dark` must also be overridden under both `[data-theme='dark']` and `[data-theme='light']`.

## 3. Typography
- **Font:** Nunito Variable, bundled through `@fontsource-variable/nunito`, so there are no network font requests. The crash-log viewer alone uses a monospace font.
- **Sizes:** `--font-size-xs` to `--font-size-2xl` (12–28px).
- **Weights:** `--font-weight-regular` to `--font-weight-bold` (400–700). Express hierarchy with weight rather than size jumps.

## 4. Components
- **Buttons:** flat accent fill for primary actions, outline or ghost for secondary ones. No glow.
- **Cards:** `--radius-md` to `--radius-xl`, with a soft shadow (`--shadow-sm`/`--shadow-md`). A card is a container; put its actions in real buttons beside each other, never a switch inside a clickable card.
- **Touch targets:** at least 44×44px. A smaller visual, like the 34×20 switch, gets an invisible hit area.
- **Inputs:** label above, focus ring in `--accent`.
- **Dialogs and sheets:** `role="dialog"` with an accessible name, and the Android back button closes them (`useBackHandler`).
- **Empty states:** a cat illustration plus a line saying how to get started, not bare "No data".

## 5. Layout
Mobile-first, centred content with a maximum width (800px; long-form text 65ch). Use `100dvh` for full-height screens and respect `env(safe-area-inset-*)` at the screen edges.

## 6. Motion
- **Animate only `transform` and `opacity`.**
- **Reduced motion:** the system "remove animations" setting is honoured twice over. CSS animations collapse through the global rule in `src/index.css`, and JavaScript-driven loops check `usePrefersReducedMotion()`.

## 7. Copy and content
- **Every user-facing string goes through i18next,** in all four locales.
- **Voice:** reminder copy is witty and cat-themed. UI labels are plain and short.
- **Emojis:** they appear in reminder messages and a few UI accents, including the ✓ and ⏱ on the notification sheet buttons. Don't add new ones to buttons or labels.
- **No marketing clichés** ("Elevate", "Seamless", "Unleash"), and no invented statistics.
