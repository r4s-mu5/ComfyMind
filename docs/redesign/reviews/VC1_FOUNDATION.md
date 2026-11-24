# VC1: Vibecheck of the foundation layer

**Reviewer:** VC1. I did not build any of this.
**Date:** 2026-11-24
**Scope:** `frontend/src/style.css`, `frontend/src/components/sanctuary/*` (AppShell, DuskLayout, SButton, SField, SCard, SNotice, ArtworkMount, MuseumLabel, SessionCard, WayInPicker, CalmProgress, ReflectionPrompt, VersionsStrip, DemoTag, ComfortPanel), plus the header pieces AppShell pulls in (`LanguageSelector.vue`, `ProfileDropdown.vue`), the style guide (`/design`, `/design/dusk`) and the locale strings those components use.
**Not reviewed:** the landing, home, workspace, gallery and therapist screens, which other workers are rebuilding.
**Method:** I built a demo with `vite build --mode demo`, served it with `vite preview` and took Playwright screenshots of `/#/design` (full page) and `/#/design/dusk` at 1440 and 1024 px. I also captured the header with the Comfort panel open at dawn and at dusk, keyboard focus, 150 % text and EN. I read every component listed above. The screenshots are in the session scratchpad and are not committed. Below I refer to them by name: `dusk-1440.png`, `dusk-comfort-open.png`, `design-1440-full.png` and so on.

---

## Verdict: **somewhat vibecoded**

The parts of the brief that are hard to get right are already in place:
- The palette is ink, lilac-grey and peach, not purple-to-blue.
- The fonts are Tenor Sans and Readex Pro, not one of the fonts on the cliché list.
- Notices stay until the person closes them and always have a text label.
- The focus ring is visible: 3 px with a 3 px offset.
- Primary targets are 56 px.
- The copy inside the components is quiet and well chosen: "Tu obra está en camino", "No hemos podido crear la obra esta vez", "Ahora no".
- There is no emoji, no gradient text and no figurative imagery in the foundation.

The problem is the *composition* that the foundation gives every screen by default:

- **Dusk** (`dusk-1440.png`) is a dark navy gradient with blurred teal and lilac blobs and a soft glowing orb low in the centre, behind a centred, glowing, translucent card with wide-tracked caps. With the logo hidden, I would guess an LLM made it ("calm meditation app template"). The things that would make it *ComfyMind* are not in the foundation: a horizon, architecture, the dither and crisp pixels. They have all been left to the 3D scene, so login, waiting and session end inherit the generic version.
- **Dawn** (`design-1440-full.png`) reads as "a tidy shadcn design system with a nice font". Every block is the same white 16 px rounded box with a border and a soft lift. Every section has a Tenor-caps eyebrow, status chips are pills above the heading, every header control has an icon, and the reference "Crear" button carries a **Sparkles** icon.

None of this is hard to fix. Most of it is token and component defaults, so fixing it here fixes every screen at once.

---

## §4 checklist

```
Vibecheck: Foundation (tokens, sanctuary components, /design, /design/dusk)
[x] Looks vibecoded?   SOMEWHAT. Why: dusk = blurred colour blobs + glow orb + centred glass card;
                       dawn = every block is the same white rounded card; caps eyebrows everywhere;
                       Sparkles on "Crear" in the style guide.
[x] Colour & surfaces  (§3.1) flags found:
                       - Animated gradient "orbs/blobs" behind content: .mist (style.css:429-439, blur 36px,
                         three round radial blobs, 40 s drift) + .sun-disc as a soft glow with no edge (style.css:416-427).
                       - Mild glassmorphism: sticky header bg-background/90 + backdrop-blur (AppShell.vue:97);
                         .scrim is a translucent card with a glow shadow centred on a blurred sky (style.css:452-457).
                       - shadcn base left as shipped: `* { @apply border-border outline-ring/50 }` (style.css:293-295);
                         unused chart-*/sidebar-* variables (style.css:150-162, 214-226, 262-274).
                       - Not found: purple→blue gradients, gradient text, neon-on-black, cream + terracotta, teal hero slab.
[x] Layout             (§3.2) flags found:
                       - Every block is a card with the same radius, border and shadow: SCard raised by default
                         (SCard.vue:15), SessionCard (SessionCard.vue:34), SNotice (SNotice.vue:39), WayIn tiles
                         (WayInPicker.vue:30), ArtworkMount mat (ArtworkMount.vue:38), colour swatches, popovers.
                       - Pill badge above the heading: SessionCard status chip, with "Ahora" in the same ink pill
                         as the primary button (SessionCard.vue:44-50).
                       - Everything centred: DuskLayout defaults to align="center" and a centred scrim card (DuskLayout.vue:20, 37-41).
                       - Three-feature-cards pattern in miniature: WayInPicker = 3 equal tiles, icon top-left + caps title
                         + one-line hint (WayInPicker.vue:22-41).
                       - Not found: hover lift, left accent bars, bento, fake 01/02/03 steps.
[x] Typography         (§3.3) flags found:
                       - Uppercase wide-tracked micro-labels above every section: .type-h3 (Tenor caps +0.14em) is the
                         default for every subsection, popover title and patient tile label (VersionsStrip.vue:22,
                         WayInPicker.vue:37, AppShell.vue:117, DesignView.vue:136 "DESIGN SYSTEM" eyebrow above the H1).
                       - The cliché is encoded as utilities: .prototype-eyebrow, .prototype-title (tracking-tight, 4xl),
                         .prototype-lead (grey subtitle) (style.css:491-499).
                       - Not found: Inter, DM Sans or any font on the list. Tenor + Readex are a good, specific choice.
[x] Icons & imagery    (§3.4) flags found:  (no figurative shapes ✔)
                       - SPARKLES on the "Crear" button in the style guide (DesignView.vue:10, 272).
                       - Icon soup in the header: Home, Image, CircleHelp on the nav (AppShell.vue:58-65, 112, 122),
                         FlaskConical on Demo (DemoTag.vue:14), "文A" Languages (LanguageSelector.vue:16), UserRound
                         (AppShell.vue:134) and the Sun for Comfort, which the spec asks for.
                       - Radio "broadcast" icon for the "Ahora" status: live-stream SaaS metaphor (SessionCard.vue:25).
                       - Demo images in the reference: a neon-green aurora and a glowing spiral, both generic AI art
                         (DesignView.vue:121, `versions-1440.png`).
                       - No emoji, no wand, no human or figurative shapes, no gradient text anywhere in scope.
[x] Motion & feedback  (§3.5) flags found:
                       - Shimmer sweep for indeterminate progress (CalmProgress.vue:48-52, calm-sweep in style.css:513-516).
                       - A spinning Loader2 for busy buttons (SButton.vue:69).
                       - Both stop under Comfort → Motion off and prefers-reduced-motion (style.css:342-359). ✔
                       - Not found: confetti, shake, toasts, fade-up-on-scroll, fake typing.
[x] Copy ES/CA/EN      (§3.6) flags found:
                       - welcome.* keys (welcome.heading/description/begin in usePrototypeLocale.ts, shown on /design/dusk):
                         "Te damos la bienvenida a tu espacio creativo" + two triads ("pensamientos, emociones y
                         experiencias"; "tomarte tu tiempo, crear y descubrir") + "espacio creativo" twice. Brochure,
                         over-explaining.
                       - "Paciente" / "Patient" as a visible label in the profile menu on patient screens
                         (ProfileDropdown.vue:60, key `profile.role` in usePrototypeLocale.ts, all three languages).
                         This breaks DESIGN §8 and PLAN D11.
                       - notice.danger "Algo no ha ido bien / Something went wrong" is the generic error default (low).
                       - Clean: no em-dashes, exclamation marks, "journey/unlock/viaje", rhetorical headings or "Welcome back".
[x] Code               (§3.7) flags found:
                       - The style guide's live contrast check only parses 6-digit hex. The build minifies #FFFFFF to
                         #fff, so ink-on-white and border-on-white (the 4.7:1 control claim) show no ratio
                         (DesignView.vue:82-86; see `d1440-part0/1.png`).
                       - 1120px hard-coded instead of --content-max (AppShell.vue:49, 150).
                       - String-splitting tone classes (SNotice.vue:39-43); inline styles in CalmProgress.vue:28, 51.
                       - ProfileDropdown uses text-sm (14 px, below the 15 px minimum) and rounded-xl outside the tokens
                         (ProfileDropdown.vue:51, 58-59, 65).
[x] Logo-hidden test: dusk YES, a stranger would guess an LLM made it. Dawn SOMEWHAT ("shadcn kit, nice font").
First idea → flags → what we did instead: see the "First idea" line in each flag below.
```

---

## Red flags, worst first, with fixes

Each fix stays inside DESIGN.md (tokens, Tenor/Readex, dusk/dawn) and keeps §9 accessibility: contrast, 56/48 px targets, state shown by text and not colour alone, and motion off.

### 1. Sparkles on "Crear" in the living style guide (MUST FIX)
`DesignView.vue:10, 272`. This is the first flag in VIBECHECK §3.4, and it sits in the reference page that every TFG student will copy.
- *First idea:* "Crear" plus Sparkles. *Flags:* sparkles-for-AI, "magic". *Instead:* the "Crear" text alone. DESIGN §6 says icons are allowed only *with* text; it does not require one. If the row needs an icon example, use a non-AI action such as `ArrowRight` on "Entrar a la sesión". Remove the `Sparkles` import.

### 2. The dusk atmosphere is the generic "blurred blobs + glow orb + centred glass card" (MUST FIX)
`style.css:410-457` (`.sky`, `.sun-disc`, `.mist`, `.scrim`), `DuskLayout.vue:20-44`, screenshots `dusk-1440.png` and `dusk-1024.png`. This is the default look for login, waiting (CalmProgress) and session end, and for the landing too whenever the 3D scene is off or still loading.
- *First idea:* a dark gradient, colour blobs, a glowing sun and a centred card. *Flags:* animated orbs and blobs, everything centred, near-glassmorphism. *Instead:* quote the **atrium at dusk** in plain CSS, so that it holds even without 3D:
  1. **Horizon.** Add a flat "floor" band (the bottom 22 % of the sky in `--dusk-sky-low`, slightly lighter at the top edge) so the scene has a ground and a horizon line.
  2. **A sun that is a disc.** Give `.sun-disc` a defined edge: a solid `--dusk-light` core at about 85 % to 60 % of the radius, then a short falloff. Seat it *on* the horizon so the floor cuts its lower half, with a faint reflection on the floor. Keep the 6 s ±8 % breathe. No stripes (that is the Outrun cliché).
  3. **Mist as strata, not blobs.** Replace the three round radial blobs with two or three long horizontal bands (`radial-gradient(160% 12% at 50% y, …)`) lying low near the horizon. Drop the 36 px blur to about 12 px. Drift sideways only (≤ 2 %), 40 s or more.
  4. **Dither.** Add a `.dither` utility: a 4×4 Bayer pattern as a tiny SVG or PNG data URI, `image-rendering: pixelated`, at about 6–8 % opacity over sky, sun and mist. This one move makes the CSS sky read as the "remembered place" in DESIGN §5.3 rather than a stock gradient. The `.grain` can stay.
  5. **Colonnade silhouette (optional, cheap).** Add a `.colonnade` layer: evenly spaced vertical bars (`repeating-linear-gradient(90deg, …)`) in `--dusk-sky-mid`, a few % lighter than the sky, standing on the horizon and fading upward. It is abstract and architectural, not figurative.
  6. **Layout.** Change DuskLayout's default to `align="start"`, with a left-aligned "wall text" column (max 34rem, about 12 % in from the left) placed **directly on the upper sky**. The sky is #0F1826 to #14202F there, and dusk text measures 14.9 to 16 : 1, which DESIGN §5.1.6 allows. Keep `scrim` only for forms over the scene (login) and remove its glow shadow (`.scrim` box-shadow).

### 3. Every block is the same white rounded card, including the artwork mat (MUST FIX the mat and the SCard default; the rest later)
`SCard.vue:15` (`raised: true` by default), `ArtworkMount.vue:38, 44` (mat `rounded-card` + `elev`, image `rounded-sm`), SessionCard, SNotice, WayIn tiles, swatches. VIBECHECK §5 says to use "the mount and niche … instead of rounded-2xl thumbnails", but the mat *is* a rounded app card (`artwork-1440.png`).
- *First idea:* one card component for everything. *Flags:* same radius, border and shadow on every block. *Instead:* give different things different materials:
  - **ArtworkMount:** a museum mat, with corner radius 2 px (or 0), image corners square, and no hairline border. Use a "hung" shadow (a short drop down, e.g. `0 2px 0 rgba(20,32,47,.06), 0 14px 22px -10px rgba(20,32,47,.18)`, as a new `--shadow-hung` token) and an inner bevel (`inset 0 0 0 1px` hairline about 12 px inside the mat, like a cut window). Keep the `niche` arch variant for featured work. The artwork then looks hung on a wall, not dropped into a widget.
  - **SCard:** default `raised: false`. Lift is for hung things only.
  - **SNotice (later):** drop the four-sided coloured box. Put the notice between two `.flute-rule` hairlines, with the icon hanging in the left margin and the state word in bold text. This is not a left accent bar: no rounded box, no coloured border. Danger can keep a 2 px `--danger` top and bottom rule so it is still unmistakable.
  - **SessionCard (later):** see flag 5.

### 4. Tenor caps used as a generic eyebrow everywhere (MUST FIX)
`style.css:396-403` (`.type-h3`), `style.css:491-499` (`.prototype-eyebrow`, `.prototype-title` with `tracking-tight`, `.prototype-lead`), `WayInPicker.vue:37`, `VersionsStrip.vue:22`, `AppShell.vue:117`, `DesignView.vue:136` and every subsection header on `/design`.
Tenor caps is the voice of the **museum label**. Used on every heading it becomes the SaaS "FEATURES" micro-label and loses its meaning. It also hurts readability on the patient's tile labels: low vision, and Tenor's I and l look the same.
- *First idea:* caps eyebrow, then headline, then grey lead. *Flags:* uppercase micro-labels above every section; huge tight headline with a grey subtitle. *Instead:*
  - Reserve Tenor caps for exactly three uses: the wordmark, the dusk display line, and the **museum label title**. Rename `.type-h3` to `.type-label` and use it only in MuseumLabel (and the date leaf month).
  - Add a `.type-h3` that is Readex 600 at 1.0625rem, sentence case, for subsection headings, the "Versiones de esta sesión" title, the help popover title and the **WayIn tile labels** ("Palabras", "Dibujo", "Imagen").
  - In `style.css`, remove `tracking-tight` from `.prototype-title` and point `.prototype-eyebrow` at the new sentence-case `.type-h3`, until B2 stops using these. Do not edit the screens in this pass.
  - On `/design`, drop the "DESIGN SYSTEM" eyebrow. The H1 is enough.

### 5. Pills that are not primary actions; a status pill above the heading (MUST FIX the SessionCard chip)
`SessionCard.vue:26-30, 44-50` (in `design-1440-full.png` the "Ahora" chip is the same ink pill as the "Entrar a la sesión" button), `DemoTag.vue:11`, and the contrast-grade pills in `DesignView.vue:172`. DESIGN §4.5 says pill = primary action only, so a pill-shaped chip looks pressable.
- *First idea:* a status badge above the time. *Flags:* pill badge above the headline. *Instead:* put the status in words on the **date leaf**, which already holds month and day.
  - The leaf gets a third line, in plain Readex 600 at 15 px: "Ahora", "Hoy" or "Próxima".
  - For "Ahora" only, the leaf turns peach (`--dawn-sun` fill, ink text, 2 px ink border) with a small static sun-disc dot. The state is carried by the word, the dot and the fill, so it never depends on colour alone.
  - The heading line becomes just "17:00 – 18:00", with "Con Marta Soler" below it.
  - Remove the Radio, Sun and CalendarClock chip icons.
  - DemoTag: square-ish (`rounded-sm`), no flask, text "Demo" in Readex 600, like a gallery placard ("maqueta"). *Later.*

### 6. Patient-visible "Paciente" label and small text in the profile menu (MUST FIX)
`ProfileDropdown.vue:60` shows `profile.role` ("Paciente / Pacient / Patient") on every patient screen. This contradicts DESIGN §8 and PLAN **D11** ("No 'patient' in the GUI"). The same menu uses `text-sm` (14 px), which is below the 15 px floor (lines 58-59), and `rounded-xl` (line 51), which is outside the tokens.
- *Instead:* show only the person's name and email. Show a role line only for therapists ("Terapeuta"). Use `type-small` and `rounded-card`. Also remove or rename `nav.patients` ("Pacientes") before anyone wires it up. D11 says "usuarios / persones usuàries / users".

### 7. Comfort panel: selection shown by colour only, and a white panel over dusk (MUST FIX)
- `ComfortPanel.vue:27-29`: the pressed option differs from the others only in fill and border colour (lilac fill, violet border); see `shell-comfort-open.png`. DESIGN §9 forbids colour-only state. *Instead:* put a `Check` icon before the label of the pressed option, keep `aria-pressed`, and use a 3 px ink border. This mirrors WayInPicker, which already does it.
- `dusk-comfort-open.png`: the popover is portalled outside `.dusk`, so on the dusk screens a white dawn panel pops out of the night sky. *Instead:* give ComfortPanel a `mode` prop, or `provide/inject` it from DuskLayout, and add `class="dusk"` to `PopoverContent` when it opens from dusk. Do the same for any popover opened inside DuskLayout.

### 8. Header icon soup and frosted header (MUST FIX the nav icons; the rest later)
`AppShell.vue:58-65, 97, 112, 122`, `LanguageSelector.vue:16-20`, `DemoTag.vue:14`. `shell-1024-en.png` shows the result: seven icons in one header row.
- *First idea:* an icon on every header item plus a blurred sticky bar. *Flags:* icon soup, glassmorphism. *Instead:*
  - The nav is text-only: Inicio · Mis obras · Ayuda.
  - The active item is marked with a `.flute-rule` underline (three hairlines, the column flute), bold text and `aria-current`, instead of a tinted rounded tab.
  - The header background is solid `bg-background`, not `/90 backdrop-blur`, with a `.flute-rule` as its bottom edge instead of `border-b`.
  - Keep only the Comfort sun, which the spec asks for.
  - *Later:* replace the `<select>` language control with three text buttons "ES · CA · EN" (48 px each, with visible pressed state and `lang` attributes). The select has `appearance-none` and no chevron, so today "Español" looks like a button, not a menu.

### 9. Generic welcome copy shown in the foundation demo (MUST FIX, cheap)
`DesignDuskView.vue:13-16` renders the `welcome.heading/description/begin` keys from `usePrototypeLocale.ts`. The text has two triads, says "espacio creativo" twice and reads like a therapy brochure. The new landing no longer uses these keys.
- *Instead:* show the DESIGN §7 landing line: display "Un lugar tranquilo para crear", one plain sentence ("Aquí puedes tomarte el tiempo que necesites."), and **Comenzar**, using the landing worker's keys. Then delete the `welcome.*` keys if nothing else reads them.

### 10. WayInPicker is the "three feature cards" pattern (LATER, after the caps fix in flag 4)
`WayInPicker.vue:22-41`, `design-1440-full.png` (three equal white tiles, Lucide icon top-left, caps title, grey hint). The `Type` "T" icon also reads as a text-formatting tool.
- *Instead:* make **three doorways into the studio**: tiles with the `niche` arch top, the same width and at least 9rem tall, still real `<button>`s.
  - Replace each Lucide icon with a small *material sample*. For Palabras, a short quoted phrase in Readex («un bosque al amanecer»). For Dibujo, one charcoal stroke as an inline SVG path. For Imagen, a tiny mounted thumbnail with a white mat.
  - Labels are Readex 600 in sentence case. The selected tile keeps the check icon and gains the word "Elegido".

### 11. Shimmer and spinner (LATER)
`CalmProgress.vue:48-52` (indeterminate sweep) and `SButton.vue:69` (`Loader2 animate-spin`). Both stop when motion is off, which is good.
- *Instead:* for indeterminate progress, keep the track **still** and let only the breathing sun move. The status line carries the honesty ("Tu obra está en camino"), with no hint of a timing. For the busy button, swap the label to a "busy" word (e.g. "Guardando…") and use a static small disc in place of the spinner.

### 12. Demo images in the reference look like AI art (LATER)
`DesignView.vue:121-126`: the neon-green aurora (`ComfyUI_00094_`) and the glowing spiral (`simple_test_00145_`). On `/design` they are the most saturated thing on the page and read as "AI gallery".
- *Instead:* pick muted, slightly imperfect works from the curated set (sketch-based, watercolour-like) that look like plausible patient pieces. Keep the rule that the artwork is the strongest colour on the screen, but not neon.

### 13. Code hygiene (LATER)
- `DesignView.vue:82-86`: accept 3-digit hex, or read the values through `getComputedStyle` on a probe element and use `rgb()`. Today the guide silently skips the most important pairs (ink on white, and the control border on white at 4.7 : 1).
- `AppShell.vue:49, 150`: use `--content-max`, not `1120px`.
- `style.css:293-295`: replace the shadcn `* { @apply border-border outline-ring/50 }` with an explicit `border-color: var(--hairline)`. Delete the unused `chart-*` and `sidebar-*` variables, or mark them as shadcn compatibility.
- `SNotice.vue:39-43`: use one object of `{ border, text }` classes instead of `split(' ')`.
- `CalmProgress.vue:28, 51`: move the inline styles into `style.css` classes (`.sun-disc--panel`, `.calm-track`).
- `DemoTag.vue:12`: the `title` tooltip cannot be reached by keyboard. Drop it, or add visually-hidden text.

---

## What to keep (do not "fix" these)

- The palette and the dusk/dawn split. The tokens themselves are good and specific, with checked contrast.
- Tenor Sans + Readex Pro, the `.niche` arch, `.flute-rule` and `.grain`.
- MuseumLabel's content model (title, technique, date, "Hecha por Alex", with the "Sin título" fallback).
- SNotice: persistent, with the state word in text and `role="alert"` only for danger.
- SField: label above, a "Mostrar" toggle with text, and the error shown with an icon and text.
- ReflectionPrompt with an equally visible "Ahora no".
- CalmProgress copy, and `aria-live` on the status line.
- Comfort settings, `motion-off` and the `prefers-reduced-motion` handling.
- The visible focus ring (`focus-comfort.png`, `focus-skip.png`). Layout holds at 1024 px and at 150 % text (`shell-150-1024.png`).

## Must fix before the meeting (in order)

1. Remove Sparkles from "Crear" (`DesignView.vue:10, 272`).
2. Dusk atmosphere: horizon, a disc-edged sun on the horizon, strata mist, a `.dither` overlay, left-aligned wall text directly on the sky; scrim only for forms, with no glow (`style.css` §5, `DuskLayout.vue`).
3. ArtworkMount as a square museum mat with a hung shadow; SCard `raised` defaults to false.
4. Tenor caps only for the wordmark, the display line and museum labels. Add a sentence-case Readex `.type-h3`. WayIn labels in sentence case. Neutralise `.prototype-eyebrow` and `.prototype-title`.
5. SessionCard: status in words on the date leaf, no pill chip, no Radio icon.
6. Profile menu: no "Paciente" label (D11), 15 px minimum.
7. ComfortPanel: a check icon on the pressed option; a dusk-mode popover on dusk screens.
8. Header: text-only nav with a flute-rule active marker; solid background.
9. `/design/dusk`: the DESIGN §7 landing copy instead of `welcome.*`.

## Later

WayIn doorways (flag 10), unboxed notices (flag 3), DemoTag placard and the language as text buttons (flags 5 and 8), still indeterminate progress and the busy button without a spinner (flag 11), calmer demo images (flag 12), code hygiene (flag 13).
