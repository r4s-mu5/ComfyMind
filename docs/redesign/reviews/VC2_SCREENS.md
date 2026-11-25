# VC2: Vibecheck of the finished screens

**Reviewer:** VC2. I did not build any of this.
**Date:** 2026-11-25
**Scope:** the demo build (`vite build --mode demo`, `vite preview`), meeting screens: login (with the demo shortcuts), user home, the whole creation flow (Palabras → Crear → waiting → result → Otra versión → Compartir → Guardar → reflection; Dibujo; Imagen, single and combine), the session side panel (chat, assistant placeholder), the session-end overlay, Mis obras (wall, filter, detail, empty state, one-session view), the therapist side (home, calendar, live session, private notes, end dialog) in a second page of the same browser context, the Comfort panel at 150 % with motion off, and CA/EN.
**Not reviewed:** the landing page's 3D scene and the "Otra escultura" button (another worker is changing them).
**Method:** Playwright with Chromium (SwiftShader GL) at 1440×900 and 1280×800, plus 1024×768 for home, workspace, gallery and login. I looked at every screenshot, tabbed through home, the workspace and the result with the keyboard, collected console output, grepped the source, and checked the rendered DOM text (including `aria-label`, `alt`, `title`, `placeholder`) for "pacient/patient". The screenshots are in the session scratchpad and are not committed. Below I refer to them by name (`08-result.png`, `51-session-1024-150.png` and so on).

---

## Verdict: **somewhat vibecoded**

The bones are specific to ComfyMind and good enough for students to build on:
- The **museum mount and niche** for the result and "Tu última obra". The square, hung mat with a Tenor-caps museum label ("SIN TÍTULO · A partir de palabras · Hecha por Alex") is the strongest thing in the demo.
- The **Mis obras wall**, grouped into salas by session, with pieces hung at different widths.
- The **date leaf** on the SessionCard ("NOV 24 · ● Ahora").
- The quiet, honest copy: "Tu obra está en camino", "Ahora no", "Marta puede ver lo que compartes", "Hoy no has guardado ninguna obra, y está bien".
- One primary action per screen, almost everywhere.
- The **live share** between two pages works: Alex shares, Marta's screen updates, her chat reaches Alex, and ending the session shows Alex the dusk "Gracias por la sesión de hoy".

What tips it to "somewhat", worst first:
1. A **hard-rule violation in the demo data**: two figurative pictures, a face and a head-and-shoulders silhouette, appear as Alex's own works in the Imagen picker (`35-image-full.png`).
2. The **first artwork a reviewer will make** is a neon-green aurora: the most "AI gallery" image in the set (`08-result.png`). VC1 flagged the same file.
3. The **empty states** (Mis obras empty, therapist "Alex aún no ha compartido ninguna obra") are exactly VC1's flag 2 again: a centred translucent card with a glowing sun showing through it as a grey ghost disc (`43-gallery-empty`, `71-…`, `22-t-live-empty.png`).
4. The workspace's first view is **three feature cards**: a Lucide icon top-left, a bold title and a grey hint (`04-session-compose.png`). VC1 moved this to "later", but it is now the main thing reviewers see after "Entrar a la sesión".
5. **Icon soup and crowding in the header**: Demo with a flask, Comodidad with a sun, Español with "文A", Perfil with a person, and Ocultar panel with a panel icon. Five bordered boxes, which wrap to two rows in the session at 1024 and at 150 %, and to three rows at 1024 + 150 %.

There are also four **flow breakers** that would embarrass us in the meeting, whatever the styling: the primary "Crear" sits below the fold in all three ways in; the demo shortcuts on login sit below the fold; Mis obras shows the empty state after "← Mis obras"; and "Cancelar" sits on top of the sun while waiting.

With the must-fix list below (about 2 h), I would expect the verdict to become **no**.

---

## Did VC1's must-fixes land?

| VC1 must-fix | Status |
|---|---|
| 1. Remove Sparkles from "Crear" | ✔ Gone from `DesignView.vue`; no Sparkles or Wand anywhere in the new screens. |
| 2. Dusk atmosphere: horizon, sun on the horizon, strata mist, dither, left wall text, scrim without glow | ◐ The CSS sky is fixed (horizon, disc-edged sun, strata, `.dither`, no glow on `.scrim`), and login is left-aligned. **But** three new places reuse the old composition (a centred scrim card over a sun disc): the gallery empty state (`GalleryView.vue:176-193`), the therapist empty state (`TherapistSessionView.vue:258-270`) and `SessionEndOverlay.vue:47` (centred card, centred headline). |
| 3. Square hung ArtworkMount; SCard not raised | ✔ Landed and looks right. |
| 4. Tenor caps only for wordmark / display / museum labels | ✔ `.type-h3` is Readex 600 sentence case; `.type-label` is Tenor. The WayIn labels are sentence case. |
| 5. SessionCard status on the date leaf | ✔ |
| 6. No "Paciente" in the profile menu, 15 px minimum | ✔ The menu shows name and email only (`82-profile.png`). The DOM grep for pacient/patient on home, Mis obras, workspace, login and calendar finds **0** hits. "Entrar como Alex (usuario)" uses the allowed role word. |
| 7. Comfort: check icon on the pressed option; dusk popover on dusk screens | ✔ (`44-comfort-open-150.png`, `80-login-comfort.png`). |
| 8. Text-only nav, flute active marker, solid header | ◐ Nav is text-only and the header is solid. The active marker is a plain 2 px bar, not the flute. The right-hand icon soup VC1 listed is still there. |
| 9. `/design/dusk` uses the landing copy | ✔ |

"Later" items from VC1 that matter now: WayIn as three feature cards (flag 10), the neon demo images (flag 12), the language `<select>` (flag 8, now also a focus bug; see F8), and the inline style in `CalmProgress.vue:52` (flag 13).

---

## §4 checklist per screen

### Login (`/#/login`, demo)
```
Vibecheck: Login
[x] Looks vibecoded?   NO. The dithered colonnade behind a left-aligned form reads as ComfyMind.
                       The form card itself is a generic dark rounded card, but the scene carries it.
[x] Colour & surfaces  none new (scrim 92 %, no glow).
[x] Layout             - The demo shortcuts are below the fold at 1440×900 and 1280×800
                         (`01-login-1440.png`, `58-login-1280.png`). Reviewers open the link here and see a
                         form they have no credentials for.
                       - Two quiet links stacked with 56 px each leave a large hole between "¿Has olvidado…?"
                         and "Crear una cuenta".
[x] Typography         ok.
[x] Icons & imagery    "文A" on the language control (LanguageSelector.vue:4). No figures ✔.
[x] Motion & feedback  ok: field errors with icon and text, no shake.
[x] Copy ES/CA/EN      ok. "Entrar como Alex (usuario)" is allowed by D11.
[x] Code               The language <select> has `outline-none` (LanguageSelector.vue:20), so its keyboard
                       focus is invisible here and in every header (`76-focus-lang.png`).
                       The control order is Español · Comodidad here but Comodidad · Español in the app header.
[x] Logo-hidden test: no.
First idea → flags → instead: centred glass card → everything centred + glass → left form over the atrium. Kept.
```

### User home (`/#/home`, Alex)
```
Vibecheck: Home
[x] Looks vibecoded?   NO. Greeting in Tenor, a date-leaf session card, a flute rule, and the latest obra hung in
                       a niche. Calm and low-density, with one primary ("Entrar a la sesión").
[x] Colour & surfaces  ok.
[x] Layout             - The SessionCard is still a white bordered card with a button at its right (the one
                         remaining "card" on the page); acceptable.
                       - The wordmark and content start at x=184 here but jump to x=24 in the workspace
                         (AppShell full width when there is an aside). It feels like a different app.
[x] Typography         ok.
[x] Icons & imagery    Header icon soup (see the header row below).
[x] Motion & feedback  ok.
[x] Copy ES/CA/EN      CA mixes persons: heading "Crear pel meu compte" vs button "Crea pel teu compte"
                       (`60-home-ca.png`); ES uses "Crear por mi cuenta" for both.
[x] Code               ok.
[x] Logo-hidden test: no.
```

### Workspace: compose (Palabras / Dibujo / Imagen)
```
Vibecheck: Taller (compose)
[x] Looks vibecoded?   SOMEWHAT. The way-in picker is the three-feature-cards pattern (icon top-left, bold
                       title, grey hint), and every control below it is a 2 px rounded box.
[x] Colour & surfaces  ok.
[x] Layout             - WayInPicker.vue:22-41: three equal tiles, Lucide icons (Type "T" reads as a text-format
                         tool), hover fill identical to the selected fill (`04-session-compose.png`: "Imagen"
                         looks selected under the pointer).
                       - **Crear is below the fold** in all three ways in: Palabras at 1440×900 after typing
                         (`06-words-typed.png`) and at 1280×800 even before typing (`56-words-1280.png`);
                         Dibujo ~750 px below the canvas top (`30-draw-full.png`, canvas 816×612 at 1440);
                         Imagen ~600 px below the picker (`35-image-full.png`). For a person with fatigue or
                         tremor, "draw, then scroll a long way to find the button" is the opposite of the brief.
                       - At 1024 + 150 % the three tiles are ~115 px wide and their text spills over the
                         borders ("Palabras", "imaginas.") (`51-session-1024-150.png`).
[x] Typography         ok.
[x] Icons & imagery    - **Figurative demo images**: Alex's "Mis obras" tab in the Imagen picker shows a line-art
                         face and a head-and-shoulders silhouette (`35-image-full.png`). The files are
                         `lib/demo/images/simple_test_00180_.jpg` and `simple_test_00185_.jpg`, used as
                         SKETCH_KEYS (`lib/demo/images.js:16`). This breaks DESIGN §5.3 and VIBECHECK §3.4
                         ("no human or figurative shapes, ever").
                       - Icons on every tool button (Pincel, Goma, size dots) are fine: they are drawing tools.
[x] Motion & feedback  ok.
[x] Copy ES/CA/EN      Good: «un lugar tranquilo» chips with guillemets, "Con unas pocas palabras basta".
[x] Code               - The selected draw tool or size differs from the others only by border colour plus the
                         same lilac fill as hover (DrawPanel.vue:152-155): state by colour alone (DESIGN §9).
                         The colour swatches do it right, with a check.
                       - After choosing a way by keyboard, focus stays on the tile; the next Tab goes to the
                         other tiles, not the new textarea or canvas.
[x] Logo-hidden test: somewhat ("form builder with a nice font").
```

### Workspace: waiting
```
Vibecheck: Waiting (CalmProgress inside the Taller)
[x] Looks vibecoded?   NO in idea (a dusk pause, an honest bar, "Tu obra está en camino"); SOMEWHAT in execution.
[x] Layout             "Cancelar" sits on top of the sun disc and cuts it (`07-waiting.png`,
                       `47-waiting-150-motionoff.png`): CalmProgress.vue:25-26, `pb-24` with
                       `--horizon:20%; --sun-size:10rem`. It reads as a layout bug.
[x] Motion & feedback  Motion off: the sun stops breathing and the bar is still honest ✔. With motion on and an
                       indeterminate bar, the shimmer sweep is still inline (CalmProgress.vue:52; VC1 flag 11).
[x] Copy               ok.
[x] Logo-hidden test: no once the overlap is fixed. The flat peach half-disc on a lit horizon is close to the
                      "Outrun sunset"; keep it stripe-free.
```

### Workspace: result, Otra versión, Compartir, Guardar, reflection
```
Vibecheck: Result + reflection
[x] Looks vibecoded?   NO in layout: a large niche mount, a museum label, Guardar (primary) · Otra versión ·
                       Compartir con Marta · "Anotar un pensamiento", a status list with checks, and
                       VersionsStrip with no ranking. YES in content: the first result is a neon-green aurora
                       (`08-result.png`), ComfyUI_00094_ (images.js:11), the image VC1 flagged as generic AI art.
[x] Layout             - At 150 % the actions drop below a full-height mount; at 1440×900 + 150 %, "Tu obra" sits
                         at the bottom edge and Guardar is off screen (`48-result-150.png`).
                       - The museum label is cut at the fold at 1440×900 (`08-result.png`).
                       - "Marta puede ver lo que compartes" appears twice (result column and side panel).
                       - Done state: "Otra versión" as a quiet button with no underline reads as plain text
                         (`11-done-full.png`).
[x] Copy               ok. The scripted Marta reply "Qué imagen tan especial." (lib/demo/fakeSocket.js:29) praises
                       the image; an art therapist would not judge it, and the sentence lacks "¡".
[x] Logo-hidden test: no (apart from the aurora).
```

### Session side panel (chat, assistant)
```
Vibecheck: Session panel
[x] Looks vibecoded?   SOMEWHAT. A stock chat widget: grey "Tú" bubbles on the right, white bubbles on the left,
                       a textarea and a full-width "Enviar". It works by keyboard (Enter sends) and arrives live
                       from Marta's page (`34-alex-gets-chat.png`).
[x] Layout             - "Ocultar panel" lives in the global header, not on the panel; it is one reason the
                         header wraps. Hiding the panel works (`13-panel-collapsed.png`).
                       - At 1024 + 150 % the panel keeps 22rem and squeezes the workspace (see compose).
[x] Copy               "Asistente (próximamente)" with "solo hace preguntas abiertas. Todavía no está activo."
                       Honest and good: it gives the chatbot question a home.
[x] Logo-hidden test: somewhat (generic chat).
```

### Session-end overlay
```
Vibecheck: Session end
[x] Looks vibecoded?   SOMEWHAT. The colonnade behind is right, but the content is a centred dark card with a
                       centred Tenor headline and a centred peach pill (VC1 flag 2 pattern).
[x] Layout             With one kept obra it sits in the first column of a 3-column grid, leaving two empty
                       columns to its right (SessionEndOverlay.vue:55, `38-session-end.png`).
                       The label wraps "25 de noviembre de 2026 ·" / "Hecha por Alex" with a dangling middot.
[x] Copy               Very good ("Gracias por la sesión de hoy", "y está bien").
[x] Logo-hidden test: somewhat.
```

### Mis obras: wall, filter, detail, empty
```
Vibecheck: Mis obras
[x] Looks vibecoded?   Wall: NO. The most ComfyMind-specific screen: salas per session with a flute rule,
                       hung mats at varied widths, museum labels, and a text filter with underline + bold
                       (not colour alone).
                       Detail: SOMEWHAT (a standard dialog: mount left, "Mi nota" right, Descargar + Volver).
                       Empty state: YES (`43-gallery-empty-102`, `71-…`, `72-…`): a centred translucent card
                       over a dusk panel, the sun showing through the card as a grey ghost disc, and
                       "+ Crear" with a Plus icon. DESIGN §7 asks for the poster scene here.
[x] Layout             - **Bug: Mis obras does not reload when the route changes.** GalleryView serves both
                         /freeimages and /session/:id and loads only in `onMounted` (GalleryView.vue:104). Open
                         a session that has no obras, press "← Mis obras", and you get "Aquí aparecerán tus
                         obras" although Alex has 14 (`72-back-to-misobras.png`). Going from the full wall to
                         /session/:id shows the old list under an empty heading: "Sesión del", "Con · Alex"
                         (`43-gallery-empty-102.png`).
                       - "Por mi cuenta" repeats as the filter and as the only sala title.
                       - "SIN TÍTULO · Hecha por Alex" repeated 14 times on Alex's own wall is noise.
                       - The wall uses about two thirds of the width, with a ragged empty right side at 1440.
[x] Code               Every tile has the same accessible name, "Abrir la obra: Sin título"
                       (GalleryView.vue:229), so a screen reader hears 14 identical buttons. Add the
                       technique and date.
[x] Logo-hidden test: wall no; empty state yes.
```

### Therapist: home, calendar, live session
```
Vibecheck: Therapist
[x] Looks vibecoded?   Home: SOMEWHAT (one card and two buttons in the top-left third of an empty page).
                       Calendar: SOMEWHAT (stock FullCalendar in a shadowed card, a "+ Crear una sesión" pill,
                       a ▶ "play" glyph for "Ahora" in the legend).
                       Live session: NO for the ledger header (time, "Sesión con Alex", remaining bar, status
                       in words, red Finalizar) and the mount; YES for the empty state (same ghost-sun card as
                       the gallery, `22-t-live-empty.png`).
[x] Layout             - Live header wraps "Sesión con / Alex" onto two lines at 1440 as soon as the status
                         becomes "Alex ha guardado su obra" (`24-t-live-note.png`; TherapistSessionView.vue:215-235).
                       - The calendar shows a session from 23:17 to 00:17 as a bar across two days
                         (`21-t-calendar-full.png`).
                       - Live view: the mount sits left and the VersionsStrip sits in a far-right 16rem column,
                         leaving a dead middle.
                       - Ended: a generic "Sesión finalizada · La sesión ha terminado correctamente." modal over
                         an emptied page (`28-t-ended.png`).
[x] Icons & imagery    Paper-plane Send icon on "Enviar" (TherapistChat.vue:3), Hourglass and Image icons in the
                       status pill, Plus on "Crear una sesión". Each is small; together they are SaaS.
[x] Copy               The same action has two names: "Programar una sesión" (home) and "Crear una sesión"
                       (calendar).
                       "Concepto: todavía no se guardan en el servidor" under private notes is honest. Good.
[x] Code               Inline `style="font-size: 1.0625rem"` (TherapistSessionView.vue:252, 268) and repeated
                       `text-[1.0625rem]`: use a `type-body-therapist` token.
                       Alex's saved reflection note never reaches Marta's view (the `sharedNote` block stays
                       empty). Decide: private by design (then say so on Alex's side) or shared.
[x] Logo-hidden test: home and calendar somewhat; live session no apart from the empty state.
```

### Header (AppShell) and Comfort panel
```
Vibecheck: Header + Comfort
[x] Looks vibecoded?   Header SOMEWHAT (five bordered controls with icons, a pill "Demo" with a flask).
                       Comfort NO (check icon on the pressed option, dusk mode on dusk screens, persisted).
[x] Layout             - The header wraps: 2 rows in the session at 1024 (`52-session-1024-100.png`), 2 rows at
                         150 % on every screen at 1440 (`45-home-150`, `46-session-150`), and 3 rows at
                         1024 + 150 % (`51-session-1024-150.png`, ~260 px of sticky header = a third of the
                         screen). At 150 % the sticky header covers the page title.
                       - At 150 % the Comfort popover runs off the bottom; the Idioma row is cut (it scrolls).
                       - Language appears twice (header select + the Comfort "Idioma" row).
[x] Focus              The ring is visible and strong on buttons and links (3 px violet, `73-focus-home-*.png`)
                       with two exceptions:
                       - the nav links' ring is clipped to a sliver by `overflow-x-auto` on the <nav>
                         (AppShell.vue:108, `73-focus-home-6.png`);
                       - the language <select> has no ring at all (LanguageSelector.vue:20 `outline-none`).
[x] Code               `useNavLink.ts` is now a redundant wrapper: SButton's `to` was fixed (SButton.vue:34-39),
                       but the comment at useNavLink.ts:6 still says it is broken. Students will copy both.
```

### Language switch
- CA and EN change every visible label on home, workspace, gallery, login and calendar, and `<html lang>` follows (`en` after the switch). Catalan renders with correct apostrophes ("d’ara").
- Chat history and the scripted greeting stay in the language they were sent in (`66-session-en-1024.png`). That is fine for real chat, but in the demo, a reviewer who switches to EN still sees "Hola Alex, me alegra verte".
- CA person mismatch on home (above).

### Console
No errors from the screens in any flow (only SwiftShader "GPU stall due to ReadPixels" warnings). Before L2's latest commit, the scene threw `ReferenceError: sculptureGeometry is not defined` and repeated `Cannot read properties of null (reading 'focusY')` page errors on login and session end, and fell back to the poster. The rebuilt scene is clean. Re-check once L2 lands, because login and session end use it.

---

## Ranked findings with fixes

| # | Finding | Where | Fix (specific to ComfyMind) | Effort |
|---|---|---|---|---|
| F1 | **Figurative pictures (a face, a head-and-shoulders silhouette) shown as Alex's works** in the Imagen picker | `lib/demo/images.js:16` (SKETCH_KEYS), `lib/demo/images/simple_test_00180_.jpg`, `simple_test_00185_.jpg` | Replace both files with abstract line sketches: two or three charcoal strokes, a spiral, a horizon line. Export two PNG/JPGs from the DrawPanel itself (it already makes PNGs) and keep the same file names, so the store needs no change. Then grep the other demo images for any figure. | 15 min |
| F2 | **Mis obras does not reload on route change**: works "disappear" after "← Mis obras"; the session view shows "Sesión del" / "Con · Alex" | `GalleryView.vue:104` | `watch(() => route.fullPath, () => { selected.value = null; filter.value = 'all'; load() })` next to `onMounted(load)`, or `:key="$route.fullPath"` on the `<router-view>` in `App.vue`. | 5 min |
| F3 | **"Crear" below the fold** in Palabras (1280×800 always, 1440×900 after typing), Dibujo (~750 px down), Imagen (~600 px down) | `WordsPanel.vue:45, 70-71`, `DrawPanel.vue:224-230, 253-254`, `ImagePanel.vue:236-237` | Make the Crear row a **sticky footer of the panel**: `sticky bottom-0 bg-card py-4` with the flute rule as its top edge (no shadow), so Crear and its hint ("Dibuja algo en el papel…") are always on screen. Also set the words textarea to `rows="3"` and cap the canvas at `max-h-[calc(100vh-24rem)]`. | 25 min |
| F4 | **Neon-green aurora as the first creation**, and repeated in the gallery and the Colección picker | `lib/demo/images.js:11` (`ComfyUI_00094_`) | Remove `ComfyUI_00094_` from ARTWORK_KEYS (and the file), or replace it with a muted watercolour. The chip prompts («un lugar tranquilo», «el mar en calma») should land on the calm lake / watercolour pieces: the hashing is deterministic, so check that the first result for each chip looks calm. | 10 min |
| F5 | **Demo shortcuts below the fold on login** at 1440×900 and 1280×800 | `LoginView.vue:111-122` | In demo mode only, put the "Modo demo" section **above** the email form: "Entrar como Alex" as the one primary pill, "Entrar como Marta" as secondary. Then a flute rule and "o con tu correo" before the form. Outside demo nothing changes. | 10 min |
| F6 | **"Cancelar" sits on top of the sun** while waiting | `CalmProgress.vue:25-26` | Put the sun below the content: `[--horizon:14%] [--sun-size:8rem]` and `pb-40`, or move the actions above the bar. Check at 100 % and 150 %. | 5 min |
| F7 | **Ghost sun behind a centred translucent card** in both empty states (VC1 flag 2 again) | `GalleryView.vue:176-193`, `TherapistSessionView.vue:258-270` | Gallery empty: use the `SanctuaryScene` poster (DESIGN §5.3/§7) with the text **left-aligned directly on the sky** (no scrim) and "Crear" without the Plus icon. Therapist empty: it is a working screen (dawn), so use a plain dawn block: the empty arched niche (dashed hairline, like the home "Aquí colgará tu última obra") with "Alex aún no ha compartido ninguna obra" beside it. No sky, no sun. | 20 min |
| F8 | **Header**: wraps to 2–3 rows (1024, 150 %); nav focus ring clipped; language select has no focus ring | `AppShell.vue:108, 127-147`, `LanguageSelector.vue:20` | (a) Move "Ocultar / Mostrar panel" out of the header into the top of the aside, plus a slim "Mostrar panel" tab on the right edge when it is closed. (b) Drop the flask on Demo and the "文A" glyph; let "Perfil" go icon-only below `2xl`. (c) On the nav, replace `overflow-x-auto` with `flex-wrap` plus `p-1` so rings are not clipped. (d) Add `.language-selector:focus-within { outline: 3px solid var(--ring); outline-offset: 3px }`. (e) At text size ≥ 125 %, make the header `static` instead of sticky. | 30 min |
| F9 | **WayIn tiles overflow** at 1024 + 150 % | `WayInPicker.vue:22` | `grid-cols-[repeat(auto-fit,minmax(min(100%,15rem),1fr))]` instead of `sm:grid-cols-3`. With F8(a) the aside can also drop below the main column under `xl` when text size ≥ 125 %. | 5 min |
| F10 | **Therapist live header wraps the name** onto two lines when the status changes | `TherapistSessionView.vue:215-235` | Two ledger rows: row 1 is the time + "Sesión con Alex" + Finalizar on the right; row 2 is the remaining bar + status in words. Add `text-balance` to the h1 and `shrink-0` on the status. | 10 min |
| F11 | **Session end: one obra stranded in column 1 of 3** | `SessionEndOverlay.vue:55` | `flex flex-wrap justify-center gap-6` instead of the grid; give the label `text-pretty` so the middot does not dangle. | 5 min |
| F12 | The three-feature-cards way-in picker | `WayInPicker.vue:22-41` | VC1 flag 10: three **doorways**. Niche-arched tops, and a small material sample instead of the Lucide icon (a quoted «frase» for Palabras, one charcoal stroke SVG for Dibujo, a tiny white-matted thumbnail for Imagen), Readex labels, "Elegido" + check when selected. Hover must not equal the selected fill. | 45 min (later) |
| F13 | Selected tool or size shown by colour only | `DrawPanel.vue:152-155` | Add the same check icon the swatches use, or a 3 px ink border + "(elegido)" in sr-only text. | 10 min (later) |
| F14 | Identical accessible names on every gallery tile | `GalleryView.vue:229` | `t('gallery.open', { title: \`${technique(o)}, ${dateLabel(o.date)}\` })`. | 5 min (later) |
| F15 | Scripted therapist praises the image | `lib/demo/fakeSocket.js:29, 43` (+EN) | "Gracias por compartirla. ¿Qué es lo primero que te transmite?" An art therapist asks; she does not judge. | 5 min (later) |
| F16 | Calendar: midnight session drawn across two days; ▶ glyph for "Ahora"; legend `aria-hidden` | `CalendarView.vue:27-29`, calendarOptions | `nextDayThreshold: '06:00:00'`; use the date-leaf sun dot instead of ▶; don't hide the legend from screen readers. | 15 min (later) |
| F17 | Therapist home is one card in an empty page; "Programar" vs "Crear una sesión" | `HomeView.vue` (therapist branch), locale `home.therapistCreate` / `calendar.create` | One verb ("Programar una sesión") everywhere. Add today's agenda (the next 3 sessions as ledger rows, text only) so the page earns its space. | 30 min (later) |
| F18 | Generic "Sesión finalizada" modal for the therapist | `TherapistSessionView.vue` ended dialog | Replace with a dawn page: "Sesión con Alex terminada", the obras shared today in mounts, the private notes, and "Ver las obras de la sesión" / "Volver a hoy". | later |
| F19 | Header/content x-position jumps between home (centred 1120) and workspace (full width) | `AppShell.vue` `wrapWidth` | Keep the header at the same width on every page; widen only the content row when an aside is present. | 10 min (later) |
| F20 | Code hygiene | `useNavLink.ts:6` (stale comment, redundant now that SButton `to` works), `TherapistSessionView.vue:252, 268` inline font-size, `CalmProgress.vue:52` inline gradient | Replace `nav()` with `SButton to=`; add a therapist body token; move the sweep into `style.css`. | later |
| F21 | CA copy person mismatch | locale `home.ownTitle` / `home.ownAction` (CA) | "Crear pel meu compte" for both, as in ES. | 2 min (later) |

---

## MUST fix before the meeting (about 2 h, in this order)

1. **F1**: replace the two figurative "sketch" images (a hard rule; the reviewers know it was asked for).
2. **F2**: reload Mis obras on route change (works must never "disappear").
3. **F3**: sticky Crear row in Palabras, Dibujo and Imagen (the core action must be on screen).
4. **F5**: demo shortcuts first on login (the reviewers' entry point).
5. **F4**: drop the neon aurora from the demo pool; check the first image for each chip.
6. **F6**: Cancelar off the sun.
7. **F7**: rebuild both empty states (poster on the sky for the gallery; a plain dawn niche for the therapist).
8. **F8**: header: panel toggle into the aside, fewer icons, nav ring not clipped, a focus ring on the language select, header not sticky at ≥ 125 %.
9. **F9, F10, F11**: three 5–10 minute layout fixes (WayIn grid, therapist header, session-end grid).

Then re-shoot at 1440, 1280, 1024 and 1024 + 150 % and run the two-page share once more.

## Later
F12 (WayIn doorways, which removes the last big "feature cards" flag), F13–F21.

## What to keep (do not "fix" these)
- ArtworkMount + MuseumLabel + niche: the result screen and "Tu última obra" are the signature.
- The Mis obras wall by sala, and the underline + bold filter.
- The SessionCard date leaf with "● Ahora".
- The result choices, with Guardar as the one primary, a status list in words with checks, and no ranking in VersionsStrip.
- ReflectionPrompt with an equally visible "Ahora no"; the "Asistente (próximamente)" placeholder and its honest wording.
- The live two-page share, chat and session end. This is the best thing to demo, so rehearse it.
- The Comfort panel: check icons, dusk mode on dusk screens, motion off honoured.
- The copy voice: "Tu obra está en camino", "Hoy no has guardado ninguna obra, y está bien", «chips» in guillemets.
