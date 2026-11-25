# VC3: Final vibecheck before the meeting

**Reviewer:** VC3. I did not build any of this.
**Date:** 2026-11-25, morning of the 11:00 meeting
**Build:** `vite build --mode demo` (current working tree after F2), served with `vite preview --port 5194`.
**Method:** Playwright Chromium with SwiftShader GL at 1440×900, 1280×800 and 1024×768, plus 1024×768 at 150 % text and 1440×900 at 150 %. Alex and Marta ran as two pages in one context for the live session. I read every screenshot. I also made a contact sheet of all 14 demo images and 6 scene posters, sampled 15 sculptures with "Otra escultura", tabbed through the landing, home and Taller, and scanned the rendered text (body text plus `aria-label`, `alt`, `title` and `placeholder`) for "pacient/patient" on every screen in ES, CA and EN. The screenshots are in the session scratchpad and are not committed.

---

## 1. Does it look vibecoded?

### Overall: **no, but three corners are still "somewhat"**

With the logo hidden, a stranger would not guess an LLM made the main path: landing → login → home → result → Mis obras. Specific to ComfyMind: the dithered colonnade with a numbered marble piece and its museum label, the arched niche mounts, the date leaf, the wall hung by sala, and copy that is quiet and honest. The VC2 must-fixes landed. There are no figurative images and no "paciente" anywhere, and there were **0 console errors** in every flow.

What still reads as generic, worst first:
1. The **Taller's first view**: three feature cards (Lucide icon, bold title, grey hint), with a white card under them, next to a stock chat widget in another card. It is the screen reviewers will spend the most time on.
2. The **session end**: a large dark card about 830 px wide, with one obra on its left half, the sculpture showing through the 92 % scrim as a ghost, and the only action below the fold (see §3).
3. The **therapist edges**: a stock FullCalendar with a "+ Crear una sesión" pill, a "Session details / Information about the selected session." dialog, and a generic "Sesión finalizada · La sesión ha terminado correctamente." modal over an emptied page.

### Per screen

| Screen | Verdict | Why |
|---|---|---|
| Landing (sculpture, Otra escultura, label) | **No** | The strongest screen. The colonnade, the low sun and the dither read as a "remembered place". The museum label "ESCULTURA Nº 2973 · Mármol, generada para ti" is a good touch. Small issues: "Otra escultura" is indented about 30 px from the column edge and sits in the hero card instead of by the sculpture; the EN label wraps to "SCULPTURE NO. / 8058"; and the sculptures barely vary (see §2, flag 4). |
| Login | **No** | Demo shortcuts come first, with one peach primary. The scene behind is darkened to a muddy grey. The lede "Escribe tu correo y tu contraseña." now sits above the demo block, so it describes the wrong thing first. |
| User home | **No** | Greeting, date leaf, one primary and the latest obra in its niche. The wordmark x-position still jumps from 184 px (home) to 24 px (Taller): VC2 F19, later. |
| Taller: way-in | **Somewhat** | Three feature cards plus card-in-card. See §2, flag 1. |
| Taller: Palabras / Dibujo / Imagen | **Somewhat**, with a usability bug | The sticky Crear row works, but it now covers the start of each panel. See §3, item 1. |
| Waiting | **No** | "Tu obra está en camino", an honest bar, Cancelar now above the sun at both 100 % and 150 %. |
| Result, Otra versión, Compartir, Guardar | **No** | The niche mount, one primary, a status list in words with check icons, and versions with no ranking. The museum label is still cut by the fold at 1440×900 and 1280×800. "Marta puede ver lo que compartes" appears twice. In the done state, the quiet "Otra versión" reads as plain text. |
| Reflection | **No** | One question, with "Ahora no" as visible as "Guardar nota". The note stays private: it never reaches Marta. That matches the copy, and it is good. |
| Session chat | **Somewhat** | A stock chat widget, but it works live both ways. The scripted greeting stays in Spanish after switching to CA or EN, because it is stored history. |
| Session end (Alex) | **Somewhat** | Left-aligned now, but see flag 2 above and §3, item 2. |
| Mis obras: wall, filter, detail | **No** | Salas with a flute rule, hung mats at varied widths, and an underline + bold filter. Tile names now include the technique and date (F14 ✔). The detail dialog is plain but fine. Repeated images (the lake and the valley each appear twice) are noticeable on the full wall. |
| Mis obras: empty | **No** | The poster scene in an arched niche, with left-aligned text and "Crear" (F7 ✔). For a future session (26 Nov) it still offers "Crear", which is odd, and the subtitle reads "Con Marta Soler · Alex". |
| Therapist home | **Somewhat** | One card and two buttons in the top-left third of an empty page (VC2 F17, later). |
| Calendar | **Somewhat** | Stock FullCalendar, a Plus-icon pill, "11/11/26" dates in EN, and a generic details dialog. |
| Live session + Finalizar | **No** | The ledger header now stays on one line at every width (F10 ✔), with the mount, the "solo tú" private notes and a red Finalizar → danger confirm. After the confirm comes the generic ended modal (see flag 3 above). |
| Comfort panel | **No** | Check icons, persisted settings, a static header at ≥ 125 %. At 150 % the Idioma row is cut at the bottom of the popover and needs a scroll. |
| CA / EN switch | **No** | Every label switches and `<html lang>` follows. CA person agreement is fixed (F21 ✔). |

---

## 2. Remaining LLM red flags (worst first)

1. **Three feature cards for the way-in** (§3.2, §3.4 "icons in tiles"): `frontend/src/components/sanctuary/WayInPicker.vue:22-41`. VC1 and VC2 already flagged this as "later" (VC2 F12). It is now the biggest remaining tell, because the bugs around it are fixed.
2. **Translucent card over a scene, with shapes ghosting through** (§3.1 glass, VC1 flag 2): `frontend/src/style.css:500` (`.scrim` at 92 %). Visible on the session end (the sculpture is a dark silhouette inside the card), on the landing at 1024 and 1280 (the sun disc and columns show through), and on login. At 92 % opacity the shapes still show through, so it reads as glass.
3. **Stock calendar and stock dialogs on the therapist side** (§3.2, §3.7 copy-pasted shadcn): `frontend/src/views/CalendarView.vue:11-12` (Plus pill), the calendar detail dialog ("Information about the selected session."), and `frontend/src/views/TherapistSessionView.vue:333-334` ("La sesión ha terminado correctamente.").
4. **A "generative" sculpture that is nearly always the same crescent** (§3.4 ComfyMind figurative rule, risk only): `frontend/src/components/sanctuary/scene/sanctuaryScene.js:183-222`. I sampled 15 seeds and all of them were a leaning crescent on a block. When the drilled hole (`P.hole`, line 217, 65 % of seeds) lands near the lower horn, the crescent reads as **a bird's or duck's head with an eye** (seeds 2711, 8224, 9483). Nobody will see a person, but an advisor could say "is that a bird?". And pressing "Otra escultura" three times shows almost the same piece, which undercuts the word "generada".
5. **Icon soup in the small places** (§3.4): a paper-plane on the therapist "Enviar", Hourglass and Image icons in the status pill, the Plus on "Crear una sesión", a Download icon on "Descargar". Each is small; together they are SaaS. The patient header is clean now.
6. **Code** (§3.7): `frontend/src/components/create/useNavLink.ts:6` still says that SButton `to` is broken, and `HomeView.vue` and `ResultStage.vue` still use the wrapper. Students will copy it. `text-[1.0625rem]` is repeated 6× in `TherapistSessionView.vue` (225, 237, 256, 267, 309) and in `CalendarView.vue:41`, where a therapist body token should be used. A left accent bar (`border-l-[3px]`) is used for the shared note in `TherapistSessionView.vue:254`; it never renders today, because notes are private.

No sparkles, no emoji, no gradient text, no fake typing, no confetti, no auto-dismissing toasts, and no Inter, Fraunces or similar fonts. Copy contains no "journey", "unlock" or exclamation marks. The scripted therapist now asks instead of judging (F15 ✔, `lib/demo/fakeSocket.js:28-31`).

---

## 3. Anything that would embarrass us in the meeting

| # | What | Where it shows | Cause |
|---|---|---|---|
| 1 | **Choosing "Dibujo" shows no paper.** At 1440×900 and 1280×800, the tools appear and right under them the sticky "Crear (disabled) · Dibuja algo en el papel para poder crear". The canvas starts at y≈810, under that bar. "Imagen" is the same: "Pulsa una imagen para elegirla" with no images on screen. In Palabras the chips are cut in half by the bar. At 1024 + 150 % the bar sits at the top of the panel and covers its heading. A reviewer will try to draw on nothing. | screenshots `a32/a33` (1440), `d32` (1280), `f73` (1024 + 150 %) | F3's sticky row (`WordsPanel.vue:71`, `DrawPanel.vue:257`, `ImagePanel.vue:237`), plus `CreateView.vue:329`, which scrolls only to `block: 'nearest'` of the panel heading |
| 2 | **Session end: the only action is off screen.** "Volver al inicio" is entirely below the fold at 1280×800, half cut at 1440×900, and gone at 1024. With 2–3 obras it moves further down. This is the emotional close of the demo. | `d37`, `a37`, `e37` | `SessionEndOverlay.vue:55-69` (button after the list) |
| 3 | The therapist's "Sesión finalizada · La sesión ha terminado correctamente." modal over a blank grey page. It is not broken, but it is the last thing Marta's screen shows and the least ComfyMind-like moment. | `a66` | `TherapistSessionView.vue:333-334` |
| 4 | EN landing label breaks as "SCULPTURE NO. / 8058". | `c65` | `SanctuaryScene.vue:210` / MuseumLabel width |

**Checked and clean:** no figurative image anywhere (all 14 demo JPEGs, the 6 posters, the Imagen picker "Mis obras" and "Colección" tabs, the wall, the result, the session end), no human figure in the 15 sculptures I sampled, **0 hits for paciente/pacient/patient** in visible text, `alt`, `aria-label`, `title` or `placeholder` on any screen in ES, CA or EN, no console errors or page errors, no auto-dismissing messages, and the keyboard path works from Home to "Entrar a la sesión" to Palabras to the textarea with a visible 3 px ring (including on the language select).

---

## 4. Did VC2's must-fixes land?

| VC2 | Status |
|---|---|
| F1 figurative sketches | ✔ Replaced by `sketch_spiral` and `sketch_horizon`; every image is abstract or a landscape. |
| F2 Mis obras reload | ✔ "← Mis obras" from an empty session shows all 14 obras. |
| F3 Crear below the fold | ◐ Crear is always on screen, **but it introduced §3, item 1** (it covers the paper and the images). |
| F4 neon aurora | ✔ Gone; the first «un lugar tranquilo» result is the watercolour. |
| F5 demo shortcuts on login | ✔ First, above the fold at 1440 and 1280. The lede above them is now out of order. |
| F6 Cancelar on the sun | ✔ At 100 % and 150 %. |
| F7 empty states | ✔ Gallery: poster niche with left-aligned text. Therapist: dashed dawn niche. |
| F8 header | ✔ No wrap at 1024; panel toggle in the aside; no flask or 文A; select focus ring; static header at ≥ 125 %. |
| F9 WayIn grid | ✔ 2 + 1 at 1024, no overflow at 150 %. |
| F10 therapist ledger | ✔ One line at 1440, 1280 and 1024. |
| F11 session-end grid | ✔ Flex-wrap. The new problem is the button position (§3, item 2). |
| Quick wins F13, F14, F15, F21 | ✔ All four. |

---

## 5. MUST fix before 11:00 (about 75 min, in this order)

1. **Paper and images on screen after choosing a way** (15 min). In `CreateView.vue:326-330`, scroll the panel host to the top, not to "nearest": `panelHost.value?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' })` with `scroll-mt-24` on the panel. Also give the paper room: in `DrawPanel.vue`, cap the canvas at `max-h-[calc(100dvh-22rem)]` so the paper and the sticky Crear fit together at 800 px. Then check that Dibujo shows the paper, Imagen shows the first row of images, and Palabras shows whole chips at 1440×900, 1280×800 and 1024×768.
2. **Session end: action next to the words** (10 min). In `SessionEndOverlay.vue`, move the `SButton` "Volver al inicio" up under the lede (before the flute rule), and let "Lo que has creado hoy" follow as the quiet part. Make the card `max-w-[44rem]`, so there is no empty right half. Check at 1280×800 with 1 and 3 obras.
3. **Scrim opaque enough that nothing ghosts through** (5 min). `style.css:500`: go to 97 % (`color-mix(... 97%, transparent)`). Check the landing at 1024 and 1280 and the session end. This removes the last glass read.
4. **Landing: one primary, one quiet link, and the sculpture control by the sculpture** (10 min). Move "Otra escultura" out of the hero card into the label block in `SanctuaryScene.vue:~205-212` (under "Mármol, generada para ti"), so it lines up with the piece it changes. Add `whitespace-nowrap` to the number in the label to fix "SCULPTURE NO. / 8058".
5. **No bird heads** (5 min). In `sanctuaryScene.js:217`, `P.hole = r() < 0.65 && false;` (keep the `r()` call so the other parameters per seed stay the same). Then sample 10 seeds again. Re-render the posters only if they have a hole (0427 does not).
6. **Therapist "ended" in our own words** (15 min). Change the locale only: `therapist.endedTitle` "Sesión con {name} terminada", `therapist.endedBody` "Las obras compartidas hoy están en las obras de la sesión. Tus notas siguen en este dispositivo." (CA and EN to match). Add a second button "Ver las obras de la sesión" that goes to `/session/:id`. Keep the dialog.
7. **Login lede order** (2 min). In demo mode, hide `login.lede` (or move it under "O entra con tu correo"), so the first words describe what is first.
8. **Rehearsal hygiene** (10 min, no code). Run the two-page flow once, in ES, from a fresh browser profile. Don't switch language mid-session (the Spanish greeting stays in the chat history). Open the Taller *before* you start talking, so the reviewers see the paper appear.

Then re-shoot Dibujo, Imagen and the session end at 1440, 1280 and 1024.

## 6. Later (after the meeting)

- **Way-in as three doorways** (VC2 F12): arched tops, a material sample instead of the Lucide icon, the picker collapses to a compact row once a way is chosen. This removes the biggest remaining flag and the scroll problem for good.
- **Sculpture variety:** widen `sculptureParams` (two-lobed forms, stacked blocks, a pierced slab), and re-run the 120-seed figurative check. Today "Otra escultura" mostly gives the same crescent.
- Therapist home with today's agenda as ledger rows; one verb ("Programar una sesión") everywhere (VC2 F17).
- Calendar: drop the Plus pill and the ▶ legend glyph, use locale dates ("11 nov"), and rewrite the details dialog in ComfyMind words (VC2 F16).
- Therapist "ended" page as a dawn page with today's obras and notes (VC2 F18).
- Result: avoid cutting the museum label at the fold (smaller mount at ≤ 900 px tall); show "Marta puede ver lo que compartes" once; underline the quiet "Otra versión".
- Comfort popover at 150 %: scrollable body with the Idioma row visible, or drop Idioma there (it duplicates the header select).
- Demo data: avoid showing the same image twice on the wall; for a future session, say "Esta sesión aún no ha empezado" instead of offering "Crear"; fix "Con Marta Soler · Alex".
- Scripted chat history: re-translate the stored greeting when the language changes (or store a key, not text).
- Header x-position jump between home and Taller (VC2 F19).
- Code: remove `useNavLink.ts` in favour of `SButton to=`; add a therapist body token for `text-[1.0625rem]`; drop the paper-plane, Hourglass and Image icons on the therapist side.

## 7. What to keep (don't "fix" these)

The landing scene and its museum label, the niche mounts, the wall by sala, the date leaf, CalmProgress, ReflectionPrompt with "Ahora no", the honest "Asistente (próximamente)" and "Concepto: todavía no se guardan en el servidor", the live two-page share, the "solo tú" notes, the Comfort panel, and the copy voice.
