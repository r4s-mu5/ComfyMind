# ComfyMind Design Direction: "Liminal Sanctuary"

**Status:** v1.0, 2026-11-24. Agreed with the project owner in the design interview (`05_INTERVIEW.md`).
**Audience:** everyone who builds ComfyMind screens, including the redesign workers and the students
whose final-degree projects (TFG) add parts of the app. If you are adding a feature, read
§1–3 once, then use §4–8 as the reference.

> **One sentence:** ComfyMind feels like an empty, timeless museum atrium at dusk:
> a quiet, slightly dreamlike sanctuary where a person with MS can make something,
> see it treated with respect, and talk about it. Nothing there is in a hurry.

---

## 1. Why this direction

| Decision | Choice | Why |
|---|---|---|
| Metaphor | **Sanctuary** | Owner's choice. In art therapy the room is a "safe container" that holds the session. |
| Feelings, in order | **Safe and unhurried** → capable and absorbed → respected and proud → gently curious | All four are kept. Safety leads. Capability comes from clear tools, pride from how artworks are framed, curiosity from small moments of discovery. |
| Aesthetic | **Liminal soft vaporwave**: an atrium, a colonnade, a pastel dusk sky, classical statue fragments | Owner's taste. Liminal spaces are empty, timeless and between places, which suits a session that is "time apart". Classical fragments tie the app to art history. We take the *dreamlike* part and drop the *distressing* part: no neon glare, glitch, VHS or scan lines. |
| Light and dark | **Dusk outside, dawn inside** | The dark sky is for *thresholds* (landing, login, waiting, session end). A light "dawn" version of the same palette is for *working screens*. Dark UIs glare on tablets and tire eyes with low contrast sensitivity, which is common in MS. |
| Typography | **Tenor Sans** (display, tracked capitals) + **Readex Pro** (everything people read) | Owner picked "Signage": a quiet transit hall or an arcade at closing time. It avoids the fonts and looks AI tools reach for by default. Readex Pro has a large x-height and an open rhythm and comes from the Lexend family. See `06_TYPOGRAPHY.md`. |
| Artwork | **Mounted, with a museum label** | Gives every piece dignity ("respected and proud"). The patient's artwork is the strongest colour on any screen. |
| Atmosphere | Mist on dusk screens. Optional mist everywhere, motion and 3D, all as **user toggles** | Owner's choice, set in the Comfort panel (§5.4). |
| Language | Spanish default, with Catalan and English one tap away. Informal *tú/tu*. | Owner's choice. Spanish is the code default. |
| Vocabulary | **obra · obra · artwork** | Owner's choice. |

### What we deliberately avoid
- The generic SaaS look: stock shadcn cards, a teal hero slab, stock photos.
- "AI design" clichés: Fraunces, Inter, DM Sans, Space Grotesk, purple-to-blue gradients, cream with a terracotta serif, emoji as icons.
- Vaporwave clichés that hurt people with MS: saturated neon, glitch, chromatic aberration, scan lines, flashing, fast zooming grids, katakana as decoration, chrome text.
- Clinical cues: hospital blue, red crosses, sterile white, "patient ID" language on patient screens.
- Childish cues: cartoon mascots, confetti, gamified streaks and points.

---

## 2. Principles

1. **One obvious next step.** Each patient screen has exactly one primary action. Everything else is visibly secondary.
2. **Process over product.** There are no grades, no "best result" and no slot-machine "regenerate". We say "another version", never "try again".
3. **The person keeps ownership.** Their obra, their choice to keep, set aside or share. The therapist sees what is shared, and the screen says so ("Marta can see this").
4. **Reflection follows creation, and it is optional.** After keeping a piece we offer one open question and an obvious "Not now".
5. **Nothing chases you.** No timers, no auto-dismissing messages, no session-expiry surprises, no motion you didn't ask for.
6. **Big, forgiving targets.** These help with tremor and fatigue: 56 px primary targets, 12 px gaps, no drag-only interactions, and undo where possible.
7. **Legible first, beautiful second, and both always.** Atmosphere never sits behind running text without a scrim.
8. **Thresholds are dusk, work is dawn.** If a screen is about *arriving, waiting or leaving*, it is dusk. If it is about *doing*, it is dawn.
9. **It must not look vibecoded.** Criticise the first idea against the LLM red flags in `VIBECHECK.md` and move away from them. Every screen gets a fresh-eyes vibecheck before it ships.

---

## 3. Users and context (summary)

- **Patient:** an adult with MS during a guided session, usually on a laptop or tablet. Possible tremor, fatigue (sessions get harder over time), blurred or double vision, low contrast sensitivity, heat sensitivity and cognitive fatigue. Often not an "artist".
- **Therapist:** runs the session, watches the patient's work as it appears, chats, takes private notes, ends the session. Needs moderate density, not a cockpit.
- **Context:** a clinic room, or remote over video. Spanish and Catalan speakers, sometimes English.

Research and sources are in `04_DESIGN_RESEARCH.md`.

---

## 4. Foundations (design tokens)

Tokens live in `frontend/src/style.css` as CSS custom properties, exposed to Tailwind 4 with `@theme`.
**Never hard-code a hex value in a component. Always use a token.**

### 4.1 Colour: Dusk (thresholds)

Unchanged in v6 (the owner likes the login). Contrast on `--dusk-sky`.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--dusk-sky` | `#14202F` | page background | — |
| `--dusk-sky-deep` | `#0F1826` | top of sky gradient | — |
| `--dusk-surface` | `#1F3140` | panels, cards (97% opaque) | — |
| `--dusk-text` | `#F4F3F7` | primary text | 14.9 : 1 |
| `--dusk-text-soft` | `#C9CEDA` | secondary text | 10.4 : 1 (8.5 on surface) |
| `--dusk-light` | `#F0D5BF` | **primary action fill** (warm distant light) | its text `#14202F` 11.7 : 1 |
| `--dusk-teal` | `#7FC4C4` | links, selection | 8.3 : 1 |
| `--dusk-lilac` | `#B9AFD6` | highlights, tags | 8.0 : 1 |
| `--dusk-border` | `#8FA0B8` | input borders, outlines | 6.2 : 1 |
| `--dusk-focus` | `#FFE3A3` | focus ring | 13.1 : 1 |
| Sky gradient | `#0F1826 → #14202F → #2A3148 → #413F59`, with a peach horizon glow `rgba(240,213,191,.35)` | landing and waiting backgrounds | — |

> **Open point (v6):** `--dusk-sky` and `--dusk-surface` are navy (`#14202F`, `#1F3140`). Over the mauve 3D scene they still read as a dark panel, but now that the interior's night is scene stone, the login panel is the one navy surface left: going from the login into a dark app changes hue. Not changed here (the owner likes the login); the presets in §4.7 show the alternative (each preset's dusk panel is its own night stone).

### 4.2 Colour: the interior by day (Atrio light)

v6 "Atrio" (owner, after the D16 meeting: *more influence from the login scene*). The page is the **lit marble of the columns** (sampled `#C0ADAB`) lifted into the **horizon haze** (`#D4BFB9`); the top light of the page is the haze itself; ink is the **column shadow** (`#5D4E62`) at its deepest. Rose-grey stone: calmer than the dusk login, not white, not cream-and-terracotta. The fluted courses and the grain stay (grain off with Comfort → Atmosphere → Plain). Contrast on `--dawn-bg` unless stated.

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--dawn-bg` | `#E9E2E3` | page: lit marble in morning haze | — |
| `--dawn-bg-warm` | `#F3E9E5` | top light of the page (the horizon haze) | — |
| `--dawn-surface` | `#F7F3F2` | honed marble: mats for forms, inputs, dialogs, popovers, toasts | — |
| `--dawn-mat` | `#FFFFFF` | the **artwork mat** only: the brightest surface on the page | — |
| `--dawn-surface-2` | `#DFD5D8` | selected and soft fills, disabled buttons | ink 11.2 : 1 |
| `--dawn-ink` | `#261F2B` | primary text, **primary button fill** | 12.5 : 1 (14.5 on surface) |
| `--dawn-ink-soft` | `#54485B` | secondary text, primary button hover | 6.7 : 1 (7.8 on surface, 6.0 on surface-2) |
| `--dawn-teal` | `#245A5C` | links, progress (verdigris: the cool note the dusk mist carries) | 6.1 : 1 (5.4 on surface-2) |
| `--dawn-violet` | `#5E4868` | wordmark, focus ring, accents (the shadow side of the columns) | 6.3 : 1 |
| `--dawn-border` | `#76697B` | input, chip and control borders | 4.0 : 1 (4.7 on surface, 3.6 on surface-2) |
| `--dawn-hairline` | `rgba(38,31,43,.22)` | rules between rooms; decorative only (never the only boundary of a control) | — |
| `--dawn-sun` | `#F0D5BF` | the sun-disc motif, the "now" date leaf (decorative only) | ink 11.4 : 1 |
| `--flute-dark` / `--flute-lit` / `--flute-mid` | `#CFC3C7` / `#F6F0EF` / `#DED4D7` | the flute shading in `.flute-rule` | — |
| `--dawn-grain` | SVG noise | the stone grain behind AppShell (`.shell > .atmo-layer`) | — |

Shadows (`--shadow-hung`, `--shadow-float`) are tinted with the ink, not navy.

### 4.2b Night (app dark mode): "scene stone"

Comfort → **Pantalla / Pantalla / Screen**: Clara (default) / Oscura / Como el dispositivo (follows `prefers-color-scheme` live). It sets `html.theme-dark` (`useComfort`). v6 (owner): *the indigo-navy night was a vibecoded tell.* Night is now **the same atrium at night**, sampled from the **shadow side of the columns** (`#5D4E62`) and the dusk sky's mauve-grey, deepened: a warm ash-mauve. No navy or blue-black, no neon accent, no saturated violet. Text is lit marble, the primary is the sun. Tokens are `--night-*` in `style.css` §1; the mapping is §7. It changes the working screens (AppShell, dialogs, popovers, menus, toasts, FullCalendar); threshold screens stay dusk.

| Role | Token, value | Contrast |
|---|---|---|
| Page (`--background`, `--dawn-bg`) | `--night-bg` `#261F27` | — |
| Top light | `--night-bg-warm` `#2F262C`; `.dawn-glow` uses `--night-glow` (horizon haze at 10 %) | — |
| Cards, dialogs, popovers (`--card`) | `--night-surface` `#31292F` | — |
| Selected and soft fills (`--secondary`) | `--night-fill` `#3E343C` | text 9.9 : 1 |
| Text / secondary text | `--night-text` `#F0E8E5` (lit marble) / `--night-text-soft` `#D0C3C3` | 13.3 / 9.4 : 1 on page (11.7 / 8.2 on card, 9.9 / 7.0 on fill) |
| Primary button | `--night-primary` `#F0D5BF` (the sun), page-colour text | 11.5 : 1; fill vs page 11.5 : 1 |
| Control borders (`--input`) | `--night-border` `#9F8E98` (the plinth in shade) | 5.2 : 1 on page, 4.6 on card, 3.9 on fill |
| Links (`--link`) | `--night-link` `#D2BEDD`: the sky above the columns, lifted. Teal was the one cool, saturated note on warm stone and read as the "dark page + one neon accent" flag. Links keep their underline, so the hue is not the only cue | 9.3 : 1 on page, 6.9 on fill |
| Wordmark, accents (`--mark`, `--dawn-violet`) | `--night-mark` `#E0BFB6` (horizon haze) | 9.4 : 1 |
| Focus ring | `--night-focus` `#FFE3A3` (the sun's core), 3 px | 12.8 : 1 on page, 9.5 on fill |
| Success / warning / danger | `--success-night` `#93D0A9` / `--warning-night` `#ECC57C` / `--danger-night` `#F5A39A` | 9.1 / 9.8 / 8.1 : 1 on page (6.7 / 7.3 / 6.0 on fill); danger and the live calendar event take page-colour text, 8.1 / 9.1 : 1 |
| Hairline | `--night-hairline` `rgba(240,232,229,.18)` | decorative only |
| Artwork mat (`--dawn-mat`) and fixed light things (`--dawn-surface`: paper samples, image tiles) | `--night-mat` `#E3DAD6`, lit marble dimmed | ink on it 11.6 : 1; the artwork stays the brightest thing |
| Flutes | `#1B161C` / `#3E343C` / `#2D252B` | — |
| Overlay behind dialogs | `--night-deep` `#120F14` at 72 % | — |

`--dawn-ink` and `--dawn-sun` do not change (ink on the peach "now" leaf, ink on paper). Overlays have no shadow at night (`--overlay-shadow: none`); the 1.5 px `--input` border is their edge. shadcn `dark:` variants apply at night too.

### 4.3 Semantic colours (every mode, always with an icon and text)

| Token | Light | Night | Dusk |
|---|---|---|---|
| `--success` | `#1A6441` (5.0 : 1 on surface-2) | `#93D0A9` | `#7FD1A6` |
| `--warning` | `#7A5000` (4.9 : 1 on surface-2) | `#ECC57C` | `#F2C46D` |
| `--danger` | `#A3302A` (4.9 : 1 on surface-2) | `#F5A39A` | `#FF9C92` |

Destructive actions (end session, delete) use `--danger` for **both** the trigger and the confirm button.

### 4.4 Typography

| Role | Font | Size and line height | Notes |
|---|---|---|---|
| Wordmark | Tenor Sans 400, caps, +0.28 em tracking | 15–18 px | "COMFYMIND" |
| Display (landing line, screen titles at dusk) | Tenor Sans 400, caps, +0.10 em | clamp(28 px, 4 vw, 44 px) / 1.1 | ≤ 8 words. Never running text: Tenor's I and l are identical. |
| Heading 1 (dawn screen title, greeting) | Tenor Sans 400, mixed case, +0.01 em | 32–36 px / 1.15 | |
| Heading 2 | Readex Pro 600 | 24 px / 1.25 | |
| Heading 3 / label title | Tenor Sans caps +0.14 em, or Readex 600 | 17–18 px | museum labels use Tenor caps |
| Body | Readex Pro 400 | **18 px** / 1.6, max 60 ch | patient minimum; therapist 17 px |
| Small | Readex Pro 400 | 15 px / 1.45 | never below 15 px |
| Button | Readex Pro 600 | 18 px | sentence case |

- Self-host the fonts with `@fontsource/tenor-sans` and `@fontsource-variable/readex-pro` (latin + latin-ext). No Google CDN, for patient privacy.
- Fallbacks: Tenor → `Optima, Candara, "Segoe UI", sans-serif`. Readex → `"Lexend", Verdana, "Segoe UI", system-ui, sans-serif`.
- Catalan check string: `Col·legi, paral·lel, ŀl · ¿Qué? ¡Sí! «obra»`. All glyphs are verified in the font files.
- The Comfort panel can scale all type to 100 / 125 / 150 %. Use `rem`, never `px`, for font sizes in components.

### 4.5 Space, size, shape

- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96. Use `gap` on flex and grid containers.
- **Targets:** patient primary controls are **56 px** tall, with 48 px as the floor for any patient target. Therapist targets are at least 44 px. Leave at least 12 px between adjacent targets.
- **Shape (D15, set by VC4 §3):** a museum building, not a SaaS dashboard. Rooms are separated by **hairline rules and space**, artworks sit on **mats**, controls are **square-cut** like placards. No boxes around groups that a rule and space already separate.
  - `--radius` 2 px (shadcn base; `--radius-sm` 0, `-md`/`-lg`/`-xl` 2 px, set explicitly).
  - `--radius-control` **2 px**: buttons, inputs, segments.
  - `--radius-card` **0**: panels, mats, dialogs, popovers, toasts.
  - `--radius-pill` **retired** (now 2 px so old classes render square; do not use).
  - `--radius-niche` `999px 999px 0 0`: the arch top with a square foot. **The only curve**: the featured ArtworkMount, the empty-state poster, the CalmProgress window and the atrium.
  - `--radius-mark` 50 %: only the sun disc, the "now" dot and the Dibujo colour swatches.
- **Containers:** the default is a **panel** (`.panel`, `<SCard>`): no fill, no border, no radius; `--rule` above and 24–32 px of space; the heading is the only frame. A **mat** (`.mat`, `<SCard variant="mat">`) is opt-in for a form, the paper or the reflection: surface fill, square, no border, no shadow (at dusk: the 97 % scrim fill and a 1.5 px hairline). `--rule` = 1 px hairline (one per room, not per item). `--rule-strong` = 2 px ink (peach at dusk), once per screen, **under** a title or active tab, never as a left bar.
- **Chips** (`.chip`: suggestions, segments, tools): not boxes. 48 px tall, a 2 px bottom border in `--input` (≥ 3 : 1), no sides. Selected (`aria-pressed`/`aria-selected`/`.is-selected`): 3 px bottom rule in `--primary`, bold, plus a ✓ in the markup.
- **Buttons:** primary = ink fill (peach at dusk), 2 px radius, 56 px; secondary = transparent with a 2 px `--input` border; quiet = no box, an always-visible 1 px underline (2 px on hover), 48 px tall; danger = `--danger` fill for trigger and confirm. Disabled keeps its shape with a `--dawn-surface-2` fill, ink-soft text and a **dashed** 2 px border, so it never looks like the primary.
- **Borders:** controls 2 px solid (`--dawn-border` / `--dusk-border`). Overlays 1.5 px `--input`.
- **Elevation:** surfaces have **none** (`--elevation: none`, `--shadow-lift: none`; `.elev` is retired). `--shadow-hung` (`0 2px 0 rgba(20,32,47,.06), 0 14px 22px -10px rgba(20,32,47,.18)`) is for artwork mats only. `--shadow-float` (`0 1px 0 rgba(20,32,47,.10), 0 24px 48px -28px rgba(20,32,47,.35)`) is for true overlays at dawn (dialog, popover, menu, toast) via `--overlay-shadow`; at dusk overlays have no shadow, only the 1.5 px border.
- **Overlays:** dialogs are a mat on a `--dawn-ink` 55 % overlay, radius 0, padding 32 px, title in `type-h2`, with a **text** close button ("Cerrar / Tanca / Close", quiet) instead of an icon-only ✕. Toasts use the SNotice look (square, 2 px tone border, tone icon, 18 px text, a "Cerrar" text button), bottom-left, 12 s, paused on hover and focus; errors never auto-close.
- **Focus:** a 3 px ring in `--dawn-violet` / `--dusk-focus`, with a 3 px offset, on every interactive element. Never remove it.
- **Content width:** 1120 px max for app pages. Text columns at most 60 ch.

### 4.6 Motion

| Context | Allowed |
|---|---|
| Working screens (dawn) | 150 ms opacity and colour fades only |
| Dusk screens | slow mist drift (≥ 20 s loops, ≤ 2% movement); landing scene pointer response ≤ 3°, eased; on touch, nothing follows the finger |
| Waiting | a breathing sun or mist (opacity ±8% over 6 s) **plus** an honest progress bar |
| Never | flashing, parallax on scroll, autoplaying carousels, bouncing, shaking for errors, confetti |
| `prefers-reduced-motion` or Comfort → Motion off | everything still; the 3D scene becomes its poster image |

### 4.7 Palettes (presets for the dev palette selector)

A palette is one scene and its interior: the 3D scene colours (`frontend/src/theme/palettes.ts`, `PALETTES`, with the sampled scene colours in its header) and the GUI tokens, as an `html.palette-<id>` block in `style.css` §6 that overrides the raw dusk, light and night tokens (so one block covers the login and landing, the light interior and night). The dev selector sets the class and gives the scene the preset's `scene`; **Atrio is the default and has no class**. Helpers: `paletteClass`, `activePaletteId`, `applyPaletteClass`. The style guide (`/design`, `/design/dusk`) can preview each one.

| Id | Name | Scene | Light interior | Night |
|---|---|---|---|---|
| `atrio` | Atrio (default) | today's Quiet mood: `#1D2142 → #5E5A8A → #B49AB4`, horizon `#D9B4AE`, sun `#FFE6CC` | lit marble `#E9E2E3`, ink `#261F2B`, verdigris links | column-shadow stone `#261F27`, sun primary, sky-lilac links |
| `alba` | Alba | dawn: slate-pearl sky `#46506A → #9AA2BA`, rose-gold horizon `#F1D8C8` | pearl `#E8E8EB`, rose-gold top light, slate-teal links | graphite `#212328`, rose-gold primary `#F3D3BF`, pale slate links |
| `piedra` | Piedra | quarried stone: umber-grey sky `#3B3734 → #8A8076`, sand horizon `#DCCAB0` | limestone `#E6E2DC`, umber ink `#29251F`, moss-grey links (no terracotta) | warm stone `#22201D`, sandstone primary `#EBD7B7`, ochre links |
| `jardin` | Jardín | sage/olive dusk `#2D3631 → #6F7B69`, straw horizon `#D8CEA9` | sage stone `#E2E5DE`, green-black ink, verdigris links `#245E55` | moss stone `#1D2320`, straw primary `#E8DBB2`, verdigris links `#98C9B9` |
| `noche-clara` | Noche clara | moonlit: blue-grey sky `#2C3440 → #6B7584`, pale moon `#F1EFE6` | cool stone `#E3E5E7`, graphite ink, steel links | blue-grey stone `#1D2125` (low saturation, not navy), moon primary `#E6E2D2`, pale steel links |

**Contrast, every palette and mode.** Computed from `style.css` by a script (all text/background pairs on the page, surface and fill; 390 pairs, 0 failures). The table gives the lowest ratio for each role. Body text targets 7 : 1 (AA 4.5 is the hard floor); soft text, links and semantic colours ≥ 4.5; borders and focus rings ≥ 3.

**light** (lowest ratio across the page, surface and fill)

| Role | min | atrio | alba | piedra | jardin | noche-clara |
|---|---|---|---|---|---|---|
| Body text | 4.5 (target 7) | 11.2 | 10.8 | 10.3 | 10.4 | 11.2 |
| Soft text | 4.5 | 6.0 | 5.9 | 5.7 | 5.7 | 5.9 |
| Link | 4.5 | 5.4 | 5.6 | 5.1 | 5.3 | 5.4 |
| Control border | 3 | 3.6 | 3.5 | 3.3 | 3.3 | 3.4 |
| Focus ring | 3 | 6.3 | 5.7 | 5.5 | 5.2 | 5.9 |
| Success | 4.5 | 5.0 | 4.7 | 4.9 | 4.7 | 4.7 |
| Warning | 4.5 | 4.9 | 5.2 | 4.8 | 5.1 | 5.2 |
| Danger | 4.5 | 4.9 | 5.1 | 4.8 | 4.9 | 5.1 |
| Primary button text | 4.5 (target 7) | 14.5 | 13.8 | 13.8 | 13.5 | 14.4 |

**night** (lowest ratio across the page, surface and fill)

| Role | min | atrio | alba | piedra | jardin | noche-clara |
|---|---|---|---|---|---|---|
| Body text | 4.5 (target 7) | 9.9 | 10.1 | 10.3 | 9.7 | 10.3 |
| Soft text | 4.5 | 7.0 | 7.2 | 7.4 | 7.0 | 7.2 |
| Link | 4.5 | 6.9 | 6.6 | 6.9 | 6.2 | 6.7 |
| Control border | 3 | 3.9 | 3.7 | 3.9 | 3.9 | 3.9 |
| Focus ring | 3 | 9.5 | 9.3 | 9.9 | 9.2 | 9.6 |
| Success | 4.5 | 6.7 | 6.6 | 7.0 | 6.7 | 6.8 |
| Warning | 4.5 | 7.3 | 7.1 | 7.6 | 7.0 | 7.3 |
| Danger | 4.5 | 6.0 | 5.9 | 6.2 | 5.8 | 6.0 |
| Primary button text | 4.5 (target 7) | 11.5 | 11.1 | 11.6 | 11.6 | 12.5 |

**dusk** (lowest ratio across the sky and panel)

| Role | min | atrio | alba | piedra | jardin | noche-clara |
|---|---|---|---|---|---|---|
| Body text | 4.5 (target 7) | 12.1 | 10.6 | 11.6 | 11.5 | 11.9 |
| Soft text | 4.5 | 8.5 | 7.5 | 8.3 | 8.3 | 8.3 |
| Link | 4.5 | 6.7 | 6.9 | 7.7 | 7.4 | 7.7 |
| Control border | 3 | 5.0 | 3.9 | 4.4 | 4.6 | 4.4 |
| Focus ring | 3 | 10.7 | 9.8 | 11.0 | 10.8 | 11.0 |
| Success | 4.5 | 7.4 | 6.9 | 7.8 | 7.9 | 7.9 |
| Warning | 4.5 | 8.2 | 7.5 | 8.5 | 8.3 | 8.4 |
| Danger | 4.5 | 6.6 | 6.2 | 6.9 | 6.8 | 6.9 |
| Primary button text | 4.5 (target 7) | 11.7 | 8.8 | 11.0 | 11.6 | 12.3 |

---

## 5. Atmosphere system

### 5.1 Layers (dusk screens)

1. **Sky:** the vertical gradient in §4.1.
2. **Sun disc:** a large, low, soft peach disc near the horizon (CSS radial gradient), the "warm distant light". The primary button uses the same colour, so the eye connects them.
3. **Mist:** 2–3 blurred radial gradients in teal, lilac and peach, at no more than 35% alpha.
4. **Grain:** SVG `feTurbulence` noise at 4–6% opacity, `mix-blend-mode: screen`.
5. **Architecture (optional):** the 3D colonnade and statue fragment scene (§5.3), or a static poster of it.
6. **Content scrim:** text sits on `--dusk-surface` at 97% opacity (so no shape ghosts through), or directly on the sky only where the measured contrast passes.

### 5.2 Dawn echoes (no 3D)

> **D16 (owner, after the meeting prep):** the inside of the app reads *too white* and clashes with the dusk welcome. Keep dawn lower-intensity than dusk, but clearly the **same place**: dawn is the atrium in the morning, not a blank web page. Directions for the next session to explore and choose from: tint the page and surfaces from the dusk palette (lilac/peach haze, marble-warm off-whites instead of `#FFFFFF`); carry a faint horizon or sky band at the top of working screens; reuse the dither/grain at low strength; use the colonnade/flute motif in headers and dividers; let artwork mats be the brightest thing on screen. Contrast rules (§4, §9) still apply.


Working screens quote the sanctuary lightly:
- the warm dawn glow at the top of the page (`--dawn-bg-warm` radial)
- the **niche** arch for featured artwork
- a thin column-flute rule (3 parallel hairlines) as a section divider
- marble-white mats for artworks
- Tenor Sans caps for labels

### 5.3 The Sanctuary scene (3D)

- **Component:** `<SanctuaryScene preset="quiet|dreaming|liminal" />`, lazy-loaded. It always renders its **poster** first and upgrades to WebGL only if allowed.
- **Contents:** a colonnade or atrium in fog, a low sun disc, a pastel sky, a calm floor, and one **abstract, non-figurative** marble object (options: *Ruina*, an Ionic capital and broken drums; *Escultura abstracta*, a pierced modernist form; *Estudio*, geometric solids), with a pastel rim light.
- **No human or figurative shapes, ever** (busts, heads, hands, bodies, faces). The project's advisors asked for this, and patient generations are abstract only. The same rule applies to illustrations, posters and empty states.
- **Post-FX:** low-resolution render (1/3 by default) upscaled with crisp pixels, 4×4 ordered dithering to a pastel palette, and static or slow (≤ 2 Hz) grain. It reads as a remembered place, not a photo. No per-frame flicker. It can be turned off.
- **Reaction:** the fragment and camera ease ≤ 3° toward the pointer; a click turns the fragment slowly to face you; idle drift is slow. Nothing on touch.
- **Used on:** landing (full), login (background), the waiting state (small, calm), session end, and the empty gallery.
- **Never on:** the workspace, the canvas, the therapist console, or behind running text.
- **Assets:** procedural three.js geometry (no third-party models). The scene code lives in `frontend/src/components/sanctuary/scene/sanctuaryScene.js`, wrapped by `SanctuaryScene.vue`. Budget: < 60k triangles, DPR capped at 1.5, paused when the tab is hidden.
- The prototype is in `docs/redesign/liminal/`. Owner's choices: the **Quiet** mood; the object is a **generative *Escultura abstracta***: each visit gets a seeded sculpture, and the user can make another (click/tap, or the "Otra escultura" button), labelled like a museum piece ("Escultura nº 0427 · Mármol, generada para ti"). FX default: 1/4 pixels, strong dither, static grain.
- **The camera never moves** (no drift, no pointer lean). **The sculpture turns slowly on its plinth** (D14): a calm, constant 360° turntable so the user sees every angle, about 60–90 s per revolution, linear, no easing bursts. With Comfort → Motion off or `prefers-reduced-motion`, it stands still (WCAG 2.2.2: moving content must be stoppable; the Comfort toggle is the control, and a small pause control by the label is a good addition). A new sculpture still arrives with the short dither dissolve.

### 5.4 Comfort panel (patient and therapist)

The header button is "Comodidad / Comoditat / Comfort", a quiet text button with a sun icon. It persists per device. Each row is a group of `.chip` segments (underline, ✓ and bold when selected).

| Setting | Options | Default |
|---|---|---|
| Text size | 100 / 125 / 150 % | 100 % |
| Screen (Pantalla) | Clara / Oscura / Como el dispositivo (night, §4.2b; the device option follows `prefers-color-scheme` live) | Clara |
| Motion | On / Off | follows `prefers-reduced-motion` |
| Atmosphere | Thresholds only / Everywhere (faint mist behind working screens, never behind text) / Plain | Thresholds only |
| 3D scene | On / Off (poster) | On, desktop only |
| Language | ES / CA / EN | ES |

---

## 6. Components

All components are built on the existing Reka UI / shadcn-vue primitives, restyled with tokens. Patient sizes are given; the therapist uses the `density="comfortable"` variant (44 px).

| Component | Spec |
|---|---|
| **Button** | `primary` (dusk: peach fill, sky text; dawn: ink fill, white text), `secondary` (surface fill, 2 px border), `quiet` (text with an underline on hover), `danger`. 56 px, 18 px label, an icon only together with text. Disabled = surface-2 fill + ink-soft text (≥ 4.5 : 1), never 50% opacity. |
| **Field** | Visible label above (never placeholder-only), 56 px input, 2 px border, help text below, error below with an icon. Password fields get a "Show" toggle, and paste is allowed. |
| **Card** | 16 px radius, surface fill, hairline. One card = one thing. |
| **ArtworkMount** | White mat (16–32 px) around the image, optional niche arch, and a **MuseumLabel** below: title (Tenor caps; "Sin título / Sense títol / Untitled" if empty), a technique line ("A partir de un boceto"), date, "Hecha por Alex". |
| **SessionCard** | A date "leaf" (month + day), time, therapist name, status chip (Ahora / Hoy / Próxima), and one action ("Entrar a la sesión"). |
| **WayIn picker** | Three large tiles with an icon and a one-line description: **Palabras** (describe it), **Dibujo** (draw it), **Imagen** (start from an image). Combine sits inside "Imagen". Tiles are real `<button>`s. |
| **CalmProgress** | The dusk sun or mist visual + a thin progress bar + a single status line ("Tu obra está en camino", ES / "La teva obra és en camí", CA / "Your artwork is on its way", EN), with `aria-live="polite"`. |
| **ReflectionPrompt** | One open question ("¿Qué te llama la atención?"), a textarea, "Guardar nota" and an equally visible "Ahora no". This is the future chatbot slot. |
| **VersionsStrip** | Small thumbnails of the versions in this sitting; the current one is outlined. No ranking. |
| **Notice** | Inline, persistent, dismissed by the user. Toasts last ≥ 10 s and can be paused; errors never auto-dismiss. |
| **Dialog** | Title, plain-language body, two buttons; the destructive one is on the right and styled `danger`. Esc and the close button always work. |
| **AppShell** | Header: wordmark, nav (patient: Inicio · Mis obras · Ayuda; therapist: Hoy · Calendario · Pacientes), Comfort, language, profile. In a session, a right side panel (chat, and later the chatbot) is collapsible. |
| **DemoTag** | A small persistent "Demo" chip in the header when demo mode is on. No banners. |

---

## 7. Screens (meeting scope)

| Screen | Mode | Contents | Primary action |
|---|---|---|---|
| **Landing** | Dusk + full Sanctuary scene | Wordmark, display line "UN LUGAR TRANQUILO PARA CREAR", one sentence, language switch | **Comenzar** (plus a quiet "Soy terapeuta" link) |
| **Login** | Dusk, scene as poster or quiet | Email + password (large, Show toggle), "¿Has olvidado la contraseña?". In demo: "Entrar como Alex (paciente)" / "Entrar como Marta (terapeuta)". | **Entrar** |
| **Patient home** | Dawn | Greeting ("Buenas tardes, Alex"), SessionCard for the live or next session, a secondary "Crear por mi cuenta" card, the latest obra in its mount | **Entrar a la sesión** (or **Crear** when there is no session) |
| **Creation workspace** | Dawn | WayIn picker → the input for that way (prompt with gentle suggestions / canvas with large tools / image picker) → **Crear**. A side panel with chat and "Marta puede ver lo que compartes". | **Crear** |
| **Waiting** | Dusk overlay inside the workspace | CalmProgress, with "Puedes cancelar" | (none; cancel is secondary) |
| **Result** | Dawn | The ArtworkMount, then **Guardar en mis obras** · "Otra versión" · "Anotar un pensamiento"; VersionsStrip; "Compartir con Marta" (in session) | **Guardar** |
| **Reflection** | Dawn | ReflectionPrompt after saving | Guardar nota / Ahora no |
| **Gallery (Mis obras)** | Dawn | A grid of mounted obras with labels, filter "En sesiones / Por mi cuenta"; detail view with the reflection note. Empty state: the poster scene + "Aquí aparecerán tus obras". | open an obra |
| **Therapist live session** | Dawn, denser | Patient's current piece (large mount) + VersionsStrip as it updates live; chat; private notes (concept, marked "solo tú"); session timer; **Finalizar sesión** (danger) | — |
| **Session end** | Dusk | "Gracias por la sesión de hoy", the obras made today, and back to home | **Volver al inicio** |

Screens outside the meeting scope (calendar, signup, canvas page, free generation, past sessions) inherit the tokens and shell, and get redesigned later using this document.

---

## 8. Voice and words

- **Register:** informal *tú* (ES) / *tu* (CA), singular, calm, short sentences. Never infantilising.
- **Use:** crear, obra, otra versión, guardar, apartar, compartir, sesión, terapeuta, boceto, dibujo, palabras.
- **Never "paciente / pacient / patient" anywhere in the GUI** (both roles' screens, labels, buttons, alt text, the demo). People are addressed by name and as *tú*. When a role word is unavoidable, use **usuario · usuari · user** in short labels and **persona usuaria · persona usuària · user** in full sentences. Internal code identifiers (the `patient` role, API fields) stay as they are; this is about visible text only.
- **Never on patient screens:** generar, resultado, volver a intentar, prompt, calidad, error del servidor, paciente (as a label). See the terminology file `docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`.
- **Errors:** say what happened and what to do, without blame: "No hemos podido crear la obra esta vez. Puedes probar de nuevo cuando quieras." Never raw codes.
- **Waiting:** "Tu obra está en camino." Don't promise times you can't keep; the progress bar carries the honesty.
- **Translations:** every string lives in `usePrototypeLocale.ts` (ES / CA / EN). No hard-coded text in components.

---

## 9. Accessibility checklist (definition of done for every screen)

- [ ] Body ≥ 18 px (patient), small text ≥ 15 px, using rem units.
- [ ] Text contrast ≥ 7 : 1 for body where possible, ≥ 4.5 : 1 minimum. Control borders and icons ≥ 3 : 1 (we target 4.5).
- [ ] Patient targets ≥ 56 px primary, ≥ 48 px others; ≥ 12 px spacing.
- [ ] Everything works by keyboard. The focus ring is visible. Real `<button>` and `<a>` elements are used.
- [ ] No drag-only interaction; the canvas works with mouse, touch and stylus (Pointer Events).
- [ ] Nothing auto-dismisses or times out without a warning and an extension.
- [ ] `prefers-reduced-motion` and the Comfort settings are honoured; the 3D scene has a poster fallback.
- [ ] State is never shown by colour alone (icon + text).
- [ ] Images have alt text. Patient artworks get "Obra de Alex: <title or description>".
- [ ] `lang` is set per language; ES, CA and EN strings exist; Catalan glyphs render.
- [ ] **Vibecheck passed** (`VIBECHECK.md` §4): a reviewer who didn't build it answered "does it look vibecoded?" with *no*.
- [ ] It works at 1280 and 1440 px (meeting), 1024 px (tablet) and 390 px (phone, basic).

---

## 10. How to build with this (for students)

1. **Tokens first.** Use the CSS variables and the Tailwind theme names (`bg-dawn-bg`, `text-dawn-ink`, `font-display`, …) defined in `frontend/src/style.css`. If you need a colour that doesn't exist, add a token and document it here; don't inline hex.
2. **Pick the mode.** A threshold screen wraps in `<DuskLayout>`; a working screen wraps in `<AppShell>` (dawn).
3. **Reuse components** from `frontend/src/components/sanctuary/` (Button, Field, ArtworkMount, MuseumLabel, SessionCard, CalmProgress, ReflectionPrompt, …) before making new ones.
4. **Words go in the locale file**, in all three languages, using the vocabulary in §8.
5. **Check §9** before you open a PR, and add screenshots of your screen at 1440 and 1024 px.
6. **Demo mode:** `npm run build:demo` / `VITE_DEMO=true npm run dev` runs everything without the backend or ComfyUI (see `DEMO_MODE.md`). New features should add their fake responses to `src/lib/demo/store.js`, so they can be demoed too.

---

## 11. Open questions for the meeting (not design decisions)

1. **Emotional filtering in the image engine.** Every workflow appends "calm mood" and negative prompts such as "anxiety, horror, creepy". In art therapy a dark image is valid material. This is a clinical decision for the therapists.
2. **Therapist notes and session history** are shown as concepts; the backend doesn't store them yet.
3. **Chatbot role:** proposed stance "asks, never interprets, therapist-controlled", using the Reflection slot and the session side panel.
4. **Prompt translation** assumes Spanish input, so Catalan and English prompts are mistranslated today.
5. **Security and robustness backlog** before any real patient use (`01_APP_INVENTORY.md` §9).

---

## 12. Implementation status

Foundation built by B0 (2026-11-24). Live style guide: route **`/design`** (`/#/design` in the demo build). How-to for builders: `frontend/src/components/sanctuary/README.md`.

| Part | Where |
|---|---|
| Tokens, Tailwind `@theme`, shadcn variable mapping, `.dusk`, comfort classes, atmosphere + type CSS | `frontend/src/style.css` |
| Self-hosted fonts (Tenor Sans, Readex Pro; latin + latin-ext) | `frontend/src/main.js`, `frontend/src/fonts.css` |
| Comfort settings (text size, motion, atmosphere, 3D; persisted) | `frontend/src/composables/useComfort.ts` |
| Strings (ES default, CA, EN) for the components | `frontend/src/composables/usePrototypeLocale.ts` |
| Components: `SButton`, `SField`, `SCard`, `SNotice`, `ArtworkMount`, `MuseumLabel`, `SessionCard`, `WayInPicker`, `CalmProgress`, `ReflectionPrompt`, `VersionsStrip`, `DemoTag`, `ComfortPanel`, `DuskLayout`, `AppShell` | `frontend/src/components/sanctuary/` |
| Style guide view | `frontend/src/views/DesignView.vue`, route `/design` in `frontend/src/router/index.js` |
| App wiring | `frontend/src/App.vue` (AppShell for all routes without `meta.hideHeader`; the old `Header.vue` was removed) |

Not built yet: `SanctuaryScene` (3D, §5.3; `useComfort().scene3dAllowed` and the `.scene-3d` hook in `DuskLayout` are ready for it), a therapist "Pacientes" nav entry (no route exists), the Ayuda page (the nav item opens a small help popover), and a Dialog wrapper (the shadcn `AlertDialog`/`Dialog` get dawn colours from the tokens). Existing views still contain their old hard-coded colours until B1-B3 redesign them.

