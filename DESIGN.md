# Design System: Nyanudge

## 1. Visual Theme & Atmosphere
A restrained, playfully-balanced daily habit tracking interface with fluid spring-physics motion. The atmosphere is warm and encouraging—like a well-lit architecture studio—avoiding clinical rigidity while maintaining crisp organization through soft, generously rounded geometry and a bright, tangerine-driven primary accent. (Density: 5, Variance: 4, Motion: 6)

## 2. Color Palette & Roles
- **Canvas White** (#FAFAF9) — Primary background surface
- **Pure Surface** (#FFFFFF) — Card and container fill
- **Charcoal Ink** (#141412) — Primary text, Zinc-950 depth
- **Muted Steel** (#A09E98) — Secondary text, descriptions, metadata
- **Whisper Border** (#E8E6E1) — Subtle dividers, structural lines, card borders
- **Tangerine Accent** (#E97B22) — Single accent for CTAs, active states, focus rings
*(Max 1 accent. Saturation < 80%. No purple/neon.)*

*(Note: Semantic app states use muted backdrops for categories: Water #3B8BD4, Food #5DAA62, Exercise #E97B22, Medicine #D65B5B)*

## 3. Typography Rules
- **Display:** `Nunito Variable` — Friendly, rounded terminals, track-tight, controlled scale, weight-driven hierarchy. Not screaming.
- **Body:** `Nunito Variable` — Relaxed leading, 65ch max-width, neutral secondary color.
- **Mono:** `JetBrains Mono` or `Geist Mono` — For code, metadata, timestamps, high-density numbers.
- **Banned:** `Inter`, generic system fonts for premium contexts. Serif fonts (`Times New Roman`, `Georgia`, `Garamond`, `Palatino`) are strictly BANNED in dashboards or software UIs.

## 4. Component Stylings
* **Buttons:** Flat, no outer glow. Tactile -1px translate on active state (push feedback). Accent fill for primary, ghost/outline for secondary. No custom mouse cursors.
* **Cards:** Generously rounded corners (1.5rem to pill shapes). Diffused whisper shadow (`rgba(0,0,0,0.05)`). Used only when elevation serves hierarchy. High-density: replace with border-top dividers.
* **Inputs:** Label above, error below. Focus ring in Tangerine accent color. No floating labels. Standard gap spacing.
* **Loaders:** Skeletal shimmer matching exact layout dimensions. No generic circular spinners.
* **Empty States:** Composed, illustrated compositions (e.g., mochi cat resting) indicating how to populate data — not just "No data" text.

## 5. Layout Principles
- Mobile-first, Capacitor-ready architecture. Max-width containment (e.g., 800px centered).
- No overlapping elements — every element occupies its own clear spatial zone. No absolute-positioned content stacking.
- Centered Hero sections are BANNED when variance exceeds 4 — force Split Screen, Left-Aligned, or Asymmetric Whitespace.
- The generic "3 equal cards horizontally" feature row is BANNED — use 2-column Zig-Zag, asymmetric grid, or horizontal scroll.
- CSS Grid over Flexbox math — never use `calc()` percentage hacks.
- Full-height sections must use `min-h-[100dvh]` — never `h-screen`.

## 6. Motion & Interaction
- **Spring Physics default:** `stiffness: 100, damping: 20` — premium, weighty feel. No linear easing.
- **Perpetual Micro-Interactions:** Every active component should have an infinite loop state (Pulse, Typewriter, Float, Shimmer).
- **Staggered Orchestration:** Never mount lists instantly — use cascade delays for waterfall reveals.
- **Performance:** Animate exclusively via `transform` and `opacity`. Never animate `top`, `left`, `width`, `height`.

## 7. Anti-Patterns (Banned)
- No emojis anywhere
- No `Inter` font
- No generic serif fonts (`Times New Roman`, `Georgia`, `Garamond`) — distinctive modern serifs only if needed (not in dashboards)
- No pure black (`#000000`) — use Charcoal Ink (`#141412`)
- No neon/outer glow shadows
- No oversaturated accents
- No excessive gradient text on large headers
- No custom mouse cursors
- No overlapping elements — clean spatial separation always
- No 3-column equal card layouts
- No generic names ("John Doe", "Acme", "Nexus")
- No fake round numbers (`99.99%`, `50%`)
- No fabricated data or statistics — never generate metrics, performance numbers, uptime percentages, response times.
- No fake system/metric sections ("SYSTEM PERFORMANCE METRICS", "KEY STATISTICS", "BY THE NUMBERS")
- No `LABEL // YEAR` formatting ("SYSTEM // 2024")
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen")
- No filler UI text: "Scroll to explore", "Swipe down", scroll arrows, bouncing chevrons
- No broken Unsplash links — use `picsum.photos` or SVG avatars
- No centered Hero sections (for high-variance projects)
