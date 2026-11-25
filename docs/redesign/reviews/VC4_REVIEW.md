# VC4: Shape-language vibecheck (D15) and branch check

**Reviewer:** VC4. I did not build any of this.
**Date:** 2026-11-25
**Build:** `vite build --mode demo --outDir /tmp/cm-vc4` (the working tree at the time; other workers were editing in parallel), served with `vite preview --port 5197`.
**Method:** Playwright Chromium (SwiftShader GL) at 1440×900 and 1024×768, plus a 1024×768 pass at 150 % text. Alex and Marta ran as two pages in one context, so the live share, chat, Finalizar and session end really happened. I also ran 3D off with motion off, a full ES, CA and EN pass with a dump of the visible text, the comfort panel at dawn and at dusk, the help popover, the profile menu, and the calendar dialogs (details, create, cancel, and the toast). I read every screenshot. There were 0 console errors and 0 page errors. "paciente/pacient/patient" does not appear in the visible text in any language. Screenshots are in the session scratchpad (`VC4/`) and are not committed.

---

## 0. Short answer

The **places** are ComfyMind: the atrium, the niche mounts, the wall hung by sala, the session end as wall text, and the date leaf. The **containers and controls** are still a generic LLM app. Almost everything is a rounded white box (`--radius-card` 16 px), every button is either a 999 px pill or a 12 px box, chips are boxes, and the header is four boxes in a row. The worst corners are the way-in (three feature cards), the calendar and its dialogs and toast (stock shadcn plus stock FullCalendar), and the chat (bubbles in a box in a box).

The fix is mostly at the token and component level (§3, §4a), so most screens will inherit it. The interior is also **too white** next to the dusk welcome (D16). Removing the white cards will help, but another worker owns that, so I only note it here.

---

## 1. Per-screen verdict

| Screen | Vibecoded? | Why |
|---|---|---|
| Landing | **Somewhat** | The scene and its museum label are excellent. The text sits in a 12 px-rounded dark box with a peach **pill**, and the label is a second rounded box (`WelcomeView.vue:53,70`). At 1024 the hero box covers most of the sculpture. |
| Login | **Somewhat** | It is a rounded panel on a muddy, darkened scene. A peach pill sits on top of three 12 px boxes (Marta, the two fields, Entrar), so two shape families are stacked in one column. |
| User home | **Somewhat** | The SessionCard is a rounded white card with a boxed date leaf inside it (a box in a box) and a pill. The niche obra and the greeting are good. |
| Taller: way-in | **Yes** | It is still three feature cards: a Lucide icon in violet, a bold title, a grey hint, all the same size, 2 + 1 at 1024, and a rounded chat card beside them. This is the biggest tell (`WayInPicker.vue:23-41`). |
| Palabras / Dibujo / Imagen | **Somewhat** | Each panel is a big rounded white card. The chips are 12 px boxes. Disabled Crear is a grey **pill**, but disabled Enviar is a grey **box**. The selected image has a pill badge (`ImagePanel.vue:201`). The paper is now visible (the F3 fix works). |
| Waiting | **No** | The sun, the honest bar and Cancelar are good. The minor issue is the rounded-card dusk box and the pill-ended bar. |
| Result | **No** (shape mix) | The niche mount is strong. The action stack is a pill, then a box, then a box: two shape languages in a single column. |
| Reflection | **Somewhat** | A rounded card holding a rounded field, next to a rounded chat card. |
| Mis obras: wall | **No** | Hung square mats, salas, flute rules and an underline filter. This is the reference for the rest of the app. |
| Mis obras: detail | **Somewhat** | The stock shadcn dialog (`rounded-card`, a drop shadow, a black/80 overlay). The content inside is good. |
| Mis obras: empty | **No** | The poster sits in a niche. The copy problems are still there: a future session offers "Crear", and the subtitle reads "Con Marta Soler · Alex" (`GalleryView.vue:168`). |
| Session chat (Alex) | **Somewhat** | A stock chat widget: bubbles inside a grey rounded inset inside a white rounded card. |
| Session end (Alex) | **No** ✔ | Fixed. It is wall text on the sky with no card, and "Volver al inicio" is above the fold at 1440 and at 1024. The lede measures about 5 : 1 where it crosses the sun disc: that passes AA, but is under the 7 : 1 target. |
| Therapist home | **Somewhat** | One rounded card and two buttons in the top-left third of an empty page. |
| Calendar + dialogs + toast | **Yes** | Stock FullCalendar in a rounded card with `elev`; a "+ Crear una sesión" pill (Home says "Programar una sesión"); a black circle for today; "11/11/26" dates; the shadcn "Detalles de la sesión / Información de la sesión seleccionada." with an ✕; a stock create modal (36 px inputs, "Rellena los detalles…"); and a green sonner toast reading "Sesión cancelada correctamente". |
| Therapist live session | **No** (minor) | The ledger, the mount and "solo tú" are good. Small issues: the red pill, the tab pair as boxes, the status as an outlined box with an icon, and the paper-plane on Enviar. |
| Finalizar confirm | **Somewhat** | The shadcn dialog with an ✕ that says "Close" in every language. |
| Therapist "ended" | **No** ✔ | It is now a page in our own words with two actions. One bug: an orphan "Ocultar panel" floats top-right with no panel (`TherapistSessionView.vue:273`, the aside slot still renders). |
| Comfort panel | **Somewhat** | Eleven bordered 12 px segments in a rounded popover: a grid of boxes. It works well at dusk and at dawn. |
| Header | **Somewhat** | Four boxed controls in a row: the Demo pill, the language box, the Comodidad box, and an icon-only profile box. Patient nav targets are 44 px tall, under the 48 px patient floor (`AppShell.vue:86`). |
| 3D off (poster) | **Somewhat** | The poster works with no canvas. But the poster sculpture is the **crescent with the drilled hole** (the "bird head" from VC3 flag 4), and the museum label disappears, so the landing loses its best cue. |
| Copy ES / CA / EN | **No**, with slips | The voice is quiet and good. See §2, flag 9. |

---

## 2. Red flags, worst first

1. **A rounded box as the default container** (§3.2, D15). `--radius-card: 1rem` (`style.css:184`) is applied through `SCard.vue:22`, `.scrim` (`style.css:502`), `SNotice.vue:39`, `CalmProgress.vue:25`, `CreateView.vue:389` (the panel), `ResultStage.vue:101`, `SessionChat.vue:42`, `CalendarView.vue:16`, `GalleryView.vue:251` and `TherapistSessionView.vue:321`, plus the popovers (`AppShell.vue:126`, `ComfortPanel.vue:56`, `ProfileDropdown.vue:51`). That is about 158 `rounded*` uses in the live views and components.
2. **Way-in as three feature cards** (§3.2 hero→3 cards, §3.4 icon soup). `WayInPicker.vue:23-41`: `min-h-36 rounded-card border-2 p-5` with `Type`/`PenLine`/`Image` icons at `size-8 text-mark`.
3. **Stock shadcn dialogs, overlay and toast** (§3.7, §3.5 "Success!" toasts). The generic primitives: `ui/dialog/DialogContent.vue:37` (`rounded-lg shadow-lg`, ✕ with sr-only "Close" at :49), `ui/dialog/DialogOverlay.vue:17` (`bg-black/80`), `ui/alert-dialog/AlertDialogContent.vue:36`, `ui/popover/PopoverContent.vue:37`. Then `App.vue:11-15` (`<Toaster rich-colors>`, top-right), and toast strings hard-coded in Spanish at `CalendarView.vue:478,483,490,539,560` ("…correctamente"). More hard-coded Spanish: `CalendarView.vue:44,48` ("Cargando..."), `:87`, `:162`. The create modal is `components/CreateSessionModal.vue`.
4. **Two button shapes in one column** (§3.2 rounded pill buttons). `SButton.vue:43,46`: primary and danger are `rounded-pill`, while secondary and quiet (`:44-45`) are `rounded-control`. The disabled state (`:59`) keeps each variant's radius, so a disabled pill and a disabled box appear side by side.
5. **Boxed header controls** (§3.2). Four boxes: `DemoTag.vue:10`, `.language-selector` (`style.css:547-549`), the `ComfortPanel.vue:51` trigger (SButton secondary) and the icon-only profile SButton (`AppShell.vue:141-146`). The profile menu adds a shadcn avatar circle with "MS" initials (`ProfileDropdown.vue:53-55`).
6. **Stock calendar** (§3.7). `CalendarView.vue:10-13` (Plus pill), `:27-29` (▶ ✓ legend glyphs), `:52` (`.slice(0,8)` → "11/11/26"), `:677` (12 px buttons), `:696` (`999px` today circle), `:699` (8 px event pills), `:712,716` (▶ / ✓ content glyphs).
7. **Chat bubbles in a box in a box** (§3.2). `SessionChat.vue:42` (card), `:53` (grey rounded inset), `:66` (rounded bubbles); `TherapistChat.vue:51`.
8. **Chips and segments as boxes** (§3.2 rounded chips). `WordsPanel.vue:60`, `ComfortPanel.vue:33-37` (11 segments), `DrawPanel.vue:178` (tools), `TherapistSessionView.vue:238,285,300` (status, tabs, "solo tú" tag), `ImagePanel.vue:201` (pill badge), and the date leaf `SessionCard.vue:32` (a box inside a card).
9. **Copy slips.**
   - **CA:** "Sessió del 11 de novembre" should be "Sessió de l'11 de novembre" (`usePrototypeLocale.ts:414` needs an elision for 1 and 11). The same action is "Mira les obres" at `:455` and "Mostra les obres" at `:474`. "Crear pel meu compte" (`:236,238`) should be the imperative "Crea pel meu compte", like every other CA button.
   - **EN:** "artworks" as a plural is awkward ("See the session’s artworks", "15 artworks", "Your artworks are waiting in My artwork": `:1119,1323,1376-1377`). Use "pieces" or "artwork". "Back to home" and "Back to start" mean the same thing (`:1114,1122,1184,1317,1378`).
   - **All languages:** the sr-only "Close" in the dialogs is not translated. "Crear una sesión" (`:927`) and "Programar una sesión" (`:706`) name the same action.
10. **Poster fallback still has the drilled crescent** (§3.4 figurative risk). In `assets/poster-escultura-*.jpg` the hole makes the "bird head" VC3 described. The live generator may have dropped it (L2), but the poster has not been re-rendered.
11. **Soft lift and glow tokens are still there for whoever reaches for them.** `--shadow-lift`/`.elev` (`style.css:188,244,531`) is only used by the calendar today (`CalendarView.vue:16`), plus the stock `shadow-lg/md` in `ui/*`. `--shadow-glow` is unused at dusk, which is good.

No sparkles, emoji, gradient text, fake typing or confetti. No Inter, Fraunces or similar fonts.

---

## 3. Replacement shape language (ready to apply)

**Idea:** a museum building, not a SaaS dashboard. Rooms are defined by **hairlines and space**, artworks sit on **mats**, controls are **square-cut** like placards and wall labels, and the **arch** appears only on artwork niches and in the atrium. There are no boxes around groups that space and a rule can already separate. To avoid swapping one cliché for another (§3), there are **no** heavy black borders everywhere, **no** hard offset "neo-brutalist" shadows, and **no** mono or all-caps UI. Tenor caps stay limited to labels.

### 3.1 Tokens (`style.css`, `:root` and `@theme static`)

```css
/* Shape: square-cut. The niche is the only curve. */
--radius: 2px;                       /* shadcn base */
--radius-niche: 999px 999px 0 0;     /* arch top, square foot (artwork + atrium only) */
/* @theme inline: set explicitly, no calc (calc(2px - 4px) is negative) */
--radius-sm: 0px;  --radius-md: 2px;  --radius-lg: 2px;  --radius-xl: 2px;
/* @theme static */
--radius-control: 2px;   /* buttons, inputs, chips, segments: reads square, no aliasing */
--radius-card: 0px;      /* panels, dialogs, popovers, toasts, mats */
--radius-pill: 2px;      /* RETIRED alias, so old classes go square; delete after migration */
--radius-mark: 50%;      /* only the sun disc, the "now" dot and the Dibujo colour swatches */

/* Elevation: nothing on surfaces. Hung = artwork. Float = true overlays only. */
--shadow-lift: none;                 /* retired; .elev resolves to nothing */
--shadow-hung: 0 2px 0 rgba(20,32,47,.06), 0 14px 22px -10px rgba(20,32,47,.18);   /* unchanged, mats only */
--shadow-float: 0 1px 0 rgba(20,32,47,.10), 0 24px 48px -28px rgba(20,32,47,.35); /* dialog, popover, menu, toast at dawn */
--elevation: none;                   /* dawn and dusk; dusk overlays use a 1.5px --dusk-border instead of a shadow */
--rule: 1px solid var(--hairline);   /* room divider */
--rule-strong: 2px solid var(--dawn-ink);  /* used once per screen, under the page title or active tab, never as a left bar */
```

### 3.2 Components

| Element | Dawn | Dusk |
|---|---|---|
| **Primary button** | `--dawn-ink` fill, `--dawn-surface` text (14.5 : 1), radius 2px, `min-h-14` (56 px), `px-7`, Readex 600 18 px. Hover: `--dawn-ink-soft` fill (white text 9 : 1). | `--dusk-light` fill, `--dusk-sky` text (11.7 : 1), radius 2px. Hover: `color-mix(--dusk-light 88%, white)`. |
| **Secondary** | Transparent fill (not white), 2px `--dawn-border` (4.7 : 1 on white, about 4.1 : 1 on `--dawn-bg`), ink text, radius 2px. Hover: `--dawn-surface-2` fill. | Transparent, 2px `--dusk-border` (6.2 : 1), radius 2px. |
| **Quiet** | No box. Ink or `--link` text with an **always-visible** 1px underline at `underline-offset-[6px]` (2px on hover). Keeps `min-h-12` with `px-1` so the target stays 48 px or more. | Same, in `--dusk-teal`. |
| **Danger** | `--danger` fill, white text (7 : 1), radius 2px. Confirm and trigger are the same. | `--danger-dusk` fill, sky text. |
| **Disabled** | The variant's own shape. `--dawn-surface-2` fill, `--dawn-ink-soft` text (7.9 : 1), border `2px dashed --dawn-border` so it never looks like the primary. | Surface fill, `--dusk-text-soft`. |
| **Chip** (suggestion, segment, tool) | **Not a box.** `min-h-12`, radius 0, **2px bottom border** `--dawn-border` (it identifies the control at 3 : 1 or more), no side borders, text in ink. Selected: `--rule-strong` bottom (3px ink) + ✓ + bold, the same as nav and the gallery filter. Groups are separated by `gap-6`, not boxes. | 2px bottom `--dusk-border`; selected 3px `--dusk-light` + ✓. |
| **Status tag** (Ahora, Hoy, Demo, "solo tú") | Text only, Readex 600 15 px, with a leading glyph or dot where state needs one. No box and no pill. Demo becomes the word "Demo" in `--muted-foreground` next to the wordmark. | Same. |
| **Input / textarea** | `--dawn-surface` fill, 2px `--dawn-border`, radius 2px, 56 px tall, 18 px text. Error: 2px `--danger` + icon + text below. | `--dusk-sky` fill, 2px `--dusk-border`. |
| **Panel** (replaces SCard as the default) | **No fill, no border, no radius.** A `--rule` above, 24–32 px padding above the heading, and the section heading as the only frame. | Same, with `--hairline` dusk. |
| **Mat** (opt-in surface: forms, the paper, the reflection) | `--dawn-surface` fill, radius 0, no border and no shadow; padding 24/32 px. It sits on the page like a mount board. | `--dusk-surface` at 97 % (the `.scrim` fill), radius 0, `1.5px --hairline`. |
| **Dialog** | A mat floating on a `--dawn-ink` 55 % overlay (not `black/80`). Radius 0, `--shadow-float`, padding 32 px, title in `type-h2`. A **text** close button ("Cerrar / Tanca / Close", quiet variant, 48 px) instead of an icon-only ✕. Destructive action on the right. | `--dusk-surface`, `1.5px --dusk-border`, no shadow. |
| **Popover / menu** | Radius 0, `1.5px --dawn-border`, `--shadow-float`. | `1.5px --dusk-border`, no shadow. |
| **Toast** | SNotice look: mat, radius 0, **2px border in the tone colour on all four sides**, a tone icon, a title, body text at 18 px, and a text "Cerrar" button. Bottom-left. At least 10 s, paused on hover and focus, errors never auto-close. Copy is the plain fact: "Sesión cancelada." Never "…correctamente". | Same, with dusk tokens. |
| **Focus ring** | Unchanged: `3px solid --dawn-violet`, `outline-offset: 3px`. With 2px radii it reads square. On the dark primary button it still shows, because the offset puts it on the page. | `3px solid --dusk-focus` (13.1 : 1). |
| **Niche / arch** | `--radius-niche` on ArtworkMount `niche`, on the empty-state poster, on CalmProgress's sun window, and nowhere else. | Same. |
| **Colour swatch** (Dibujo) | The only allowed circle besides the sun: paint has no corners. Keep 56 px, 2px `--dawn-border`, selected = 3px ring + ✓. | n/a |

**Accessibility check:**
- **Targets:** unchanged. Patient 56 px, other patient controls 48 px or more; therapist 44 px. Patient nav moves from 44 to 48 px.
- **Focus:** the 3px ring stays on everything.
- **Control boundaries:** every control boundary is 3 : 1 or more. The 2px bottom border on chips is a component boundary in the WCAG 1.4.11 sense, and selection is never colour alone (✓, weight and a 3px rule).
- **Hairlines:** still decorative only. No control relies on a hairline.
- **Text contrast:** unchanged, because only shapes move.

**VIBECHECK check:**
- **Square edges plus hairlines** could read "Swiss template" if everything is ruled. So rules separate **rooms** (one per section), not every item, and mats and space do the rest.
- **No brutalism:** no hard offset shadows, no 2px black outlines on panels, no mono type.
- **No left accent bars**, ever: the strong rule goes **under** the title or active tab only.

---

## 4. Fix list

### 4a. Token and sanctuary-component level (do these first; screens inherit them)

| File:line | Change |
|---|---|
| `style.css:62-63` | `--radius: 2px; --radius-niche: 999px 999px 0 0;` |
| `style.css:133-136` | Replace the four `calc()` lines with `--radius-sm: 0px; --radius-md: 2px; --radius-lg: 2px; --radius-xl: 2px;` (this squares every `ui/*` primitive at once). |
| `style.css:183-185` | `--radius-control: 2px; --radius-card: 0px; --radius-pill: 2px;` (pill retired). |
| `style.css:188` | `--shadow-lift: none;` add `--shadow-float` (§3.1). `:244` and `:291` set `--elevation: none;`. |
| `style.css:499-503` (`.scrim`) | Keep the 97 % fill; `border-radius: 0`. |
| `style.css:547-549` (`.language-selector`) | Remove the box: `inline-flex min-h-12 items-center gap-2 border-b-2 border-input bg-transparent px-1` (keep the `:has(select:focus-visible)` ring). |
| `style.css` (new) | `.chip` (§3.2: `min-h-12 border-0 border-b-2 border-input rounded-none px-2`; `[aria-pressed=true]` → `border-b-[3px] border-foreground font-semibold`) and `.panel` (`border-t border-hairline pt-6`). |
| `SButton.vue:43-46` | primary `rounded-control bg-primary …`, danger `rounded-control bg-danger …`, secondary `rounded-control bg-transparent … border-2 border-input hover:bg-secondary`, quiet `rounded-none bg-transparent border-0 underline decoration-1 underline-offset-[6px] hover:decoration-2 px-1`. `:59` disabled: add `border-dashed border-input` and drop `border-transparent`. |
| `SCard.vue:22` | Default becomes the **panel**: `border-t-[1px] border-hairline pt-6 text-foreground` (no fill, no radius). Add `variant="mat"` → `bg-card p-6 sm:p-8` (radius 0, no border). Delete `raised`. |
| `WayInPicker.vue:23-41` | **Doorways, not cards.** Use `grid grid-cols-3 divide-x divide-hairline border-y border-hairline` (a colonnade). Each button: `min-h-40 rounded-none bg-transparent px-6 py-6 text-left`, a 4:3 **material sample** (a paper strip with a Tenor word / a pencil line / a demo image crop, square mat, no icon), then the label in `type-h3` and the hint. Selected: `border-b-[3px] border-foreground` + ✓ + "Elegida". Once a way is chosen, collapse to a single row of three underline tabs (the gallery-filter look). At 1024 and at 150 % stack as a list, each row a hairline apart. |
| `SessionCard.vue:29-33` | No outer card: render a **ledger row** (`border-y border-hairline py-6`). The date leaf: drop `rounded-control border-2` and use `bg-dawn-sun` (now) or nothing (later) with radius 0, keeping its size. Status as text (§3.2). |
| `SNotice.vue:39` | `rounded-none`. `:53`: the dismiss button becomes the quiet variant with its text. |
| `SField.vue:38` | Keep `rounded-control` (now 2px). Nothing else. |
| `CalmProgress.vue:25` | `rounded-none` (the dusk box becomes a window). `:42-51`: the bar gets `rounded-none` (a 6px straight bar reads as a ruler, not a pill). |
| `ComfortPanel.vue:33-37` | Segments → `.chip` (underline, ✓, bold). `:56` popover → `rounded-none border-[1.5px]` + `shadow-[var(--shadow-float)]`. `:51` trigger → `variant="quiet"` (sun icon + "Comodidad", no box). |
| `DemoTag.vue:10` | `type-small font-semibold text-muted-foreground` with no border and no padding box. |
| `VersionsStrip.vue:30,35` | `rounded-none` (square mats, as on the wall). |
| `AppShell.vue:86` | Nav `min-h-12` (48 px patient floor). `:112` wordmark `rounded-none`. `:126` help popover → `rounded-none border-[1.5px] shadow-[var(--shadow-float)]`. `:141-146` profile → quiet text button "Alex ▾" (first name), no icon-only box. |
| `ProfileDropdown.vue:51-55` | `rounded-none`. Drop the `Avatar` initials circle; show the name and role as text. |
| `ui/dialog/DialogContent.vue:37` / `ui/alert-dialog/AlertDialogContent.vue:36` | `rounded-none border-[1.5px] border-input shadow-[var(--shadow-float)] p-8`. `:43-50`: replace the ✕ with a quiet "{{ t('dialog.close') }}" text button. Add `dialog.close` ES "Cerrar" / CA "Tanca" / EN "Close". |
| `ui/dialog/DialogOverlay.vue:17` (+ alert-dialog overlay) | `bg-dawn-ink/55` instead of `bg-black/80`. |
| `ui/popover/PopoverContent.vue:37`, `ui/dropdown-menu/DropdownMenuContent.vue:34` | `rounded-none shadow-[var(--shadow-float)]`. |
| `App.vue:11-15` | Replace the sonner `rich-colors` Toaster with a `position="bottom-left"` Toaster styled via `toastOptions.class` = SNotice look (§3.2), with `closeButton` and the text label. Or route the toasts to an inline SNotice. |

### 4b. Screen-level leftovers

| File:line | Change |
|---|---|
| `WelcomeView.vue:53` | Remove `!rounded-control`. The hero text becomes **wall text** on the sky (the same treatment as the session end), with a scrim only behind the text column if the measured contrast is under 7 : 1. At 1024, cap the width at `max-w-[28rem]` so the sculpture is not covered. `:70` label: `rounded-none`, `px-0` (Otra escultura aligned to the label edge). |
| `SanctuaryScene.vue:230` | `rounded-control` → `rounded-none`. When the poster is shown (3D off), **keep the museum label** with the poster's number ("Escultura nº 0427") and hide only "Otra escultura". Re-render `poster-escultura` without the drilled hole. |
| `LoginView.vue:71` | It inherits `.scrim` square. Change the demo Marta button and the Entrar button to the quiet variant, so the column is one primary plus text links. |
| `CreateView.vue:389` | Panel host: `rounded-card border… bg-card p-6` → **mat** (`bg-card p-6 sm:p-8`, radius 0, no border). |
| `WordsPanel.vue:60` | Suggestions → `.chip`. `:71` sticky Crear row: add a `border-t border-hairline` and drop the separate flute rule above it. |
| `DrawPanel.vue:178` | Tools and sizes → `.chip`. `:242` `paper-frame`: `rounded-none` and no border (the paper is the mat). `:249` canvas `rounded-none`. `:289` `rounded-none`. |
| `ImagePanel.vue:136` | Upload zone `rounded-none` (keep the dashed border; it is functional). `:193,198,215-216` `rounded-none`. `:201` pill badge → square ink label at the top-left, flush (`rounded-none px-2`). `:121` tabs already underline: `rounded-none`. |
| `ResultStage.vue:90-112` | After 4a it becomes one square primary plus square secondaries. Demote "Compartir con Marta" to quiet when "Otra versión" is already secondary, so the stack has 1 fill, 1 outline and the rest links. `:101` reflection → mat. |
| `SessionChat.vue:42` | Card → panel. `:53` remove the grey inset (`bg-background rounded-control`). `:66` no bubbles: each message is a name line (`type-small font-semibold`) plus text, hairline between turns, "Tú" right-aligned only through the label, not a coloured bubble. `:81` 2px radius. `:91` `rounded-none`. |
| `TherapistChat.vue:51` | Same transcript style; Enviar without the paper-plane icon. |
| `TherapistSessionView.vue:238` | Status → text tag (§3.2), not an outlined box. `:285` tabs → underline tabs. `:300` "solo tú" → text tag. `:310` 2px radius. `:274` SCard → panel. `:273` render the `#aside` slot only `v-if="!ended"` (fixes the orphan "Ocultar panel"). `:321` dialog inherits 4a. |
| `HomeView.vue:256-261` | Therapist home: show today's agenda as ledger rows (SessionCard after 4a), "Programar una sesión" as secondary, calendar link quiet. |
| `CalendarView.vue:10-13` | "Programar una sesión" (same key as Home, `home.therapistCreate`), secondary, **no Plus icon**. `:16` drop the card and `elev`: the calendar sits on the page with its own hairline grid. `:27-29` legend: text tags, no ▶. `:32-74` detail dialog: title "Sesión con {name}", no description line, date via `Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' })` (not `.slice(0,8)`), "Cargando..." → `t()`. `:87,162,478-560` move every string to `t()`; toasts say "Sesión cancelada." / "Sesión cambiada al {date}." `:677` `border-radius: 2px`. `:696` today = ink underline under the number, not a black circle. `:699` events `border-radius: 0`. `:712,716` drop the ▶ / ✓ pseudo-content (state is already in the colour and legend text; add an sr-only label instead). |
| `CreateSessionModal.vue` | Sanctuary fields (SField, 56 px, 18 px), title "Programar una sesión", no "Rellena los detalles…" description, Confirmar → "Programar". |
| `GalleryView.vue:251` | Inherits 4a. `:168` → "Con Marta Soler" only (drop "· Alex"). For a future session, the empty state says "Esta sesión aún no ha empezado" and offers "Volver a Mis obras" instead of "Crear". |
| `SignupView.vue:136` | Radio rows → `.chip` pattern. |
| `usePrototypeLocale.ts` | CA `:414` elide before 1/11 ("de l'11", "de l'1"); `:455` and `:474` use one string ("Mostra les obres de la sessió"); `:236,238` "Crea pel meu compte". EN "artworks" → "pieces" in running text (`:1119,1323,1376-1377`, plus `:1242` "one of your pieces"); one "Back to home" everywhere. |

**D16 (noted, not solved):** after 4a, most white rectangles disappear. The remaining whites (mats, inputs, the reflection) should become the brightest thing on a tinted page. That is the other worker's call.

---

## 5. VC3's remaining "somewhat" corners

| VC3 corner | VC4 verdict |
|---|---|
| Way-in (three feature cards) | **Not done: still "yes".** Unchanged since VC1. It needs 4a `WayInPicker.vue`. |
| Session end (card, action below the fold) | **Done: "no".** Wall text on the sky, the action above the fold at 1440 and 1024, no card, no ghosting. Optional: raise the lede to 7 : 1 with a soft local scrim behind the text column only. |
| Therapist calendar + "ended" modal | **Split.** The "ended" moment is **done** (a page in our own words, two actions; one orphan "Ocultar panel"). The **calendar is still "yes"**: Plus pill, the stock details and create dialogs, "11/11/26", a sonner success toast, and hard-coded Spanish. |
| (VC3 must-fixes checked here) | Dibujo paper visible ✔. Scrim 97 % ✔. Login lede order ✔. EN label nowrap ✔ (it no longer wraps). Poster hole ✘ (the live seeds I saw had no hole; the poster JPEG still has it). |

**To reach "no" everywhere:** 4a (tokens, SButton, SCard, WayInPicker, dialogs, toast, header), then the calendar and chat rows in 4b. Then re-shoot the way-in, the calendar with its dialogs and toast, and the header at 1440, 1024 and 150 %.
