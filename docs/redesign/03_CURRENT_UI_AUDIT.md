# 03 - Current UI Audit

Worker W3, 2026-11-24. Scope: every reachable screen of the frontend on the clean base branch, captured without a backend, and critiqued against `AGENTS.md`, `DESIGN_SYSTEM_BRIEF_DRAFT.md`, `ACCESSIBILITY_REQUIREMENTS_DRAFT.md` and `WELCOME_SCREEN_VISUAL_ART_DIRECTION.md`. No source was modified. 63 screenshots (8 MB) live in `screens/current/`.

## 0. How the screens were captured

| Item | Detail |
|---|---|
| Server | `VITE_DEV_PREVIEW_MODE=true npx vite --port 5199`, Chromium via Playwright, DPR 1, 1440x900 (D) and 1024x768 (T); a few at 390x844 (M). Locale forced through `localStorage['comfymind.prototype.locale']`. |
| `?demo=1` | **Works, no mock needed.** `usePrototypeDemo` hard-codes a *patient* ("Alex") + therapist "Marta Soler" in `HomeView`, `Header`, `SessionView`, `ProfileDropdown`, and swaps `GenerationView` for `DemoCreationWorkspace`. It only covers Home, Generation (`/generation/`) and Gallery (`/freeimages/`). Login and Welcome just carry the flag along. Login still enforces email + 8-char password validation. |
| `VITE_DEV_PREVIEW_MODE` | **Works for all other screens, but the mock identity is always a therapist.** `mockCurrentUser.type = 'therapist'` (id 1001). `getActiveSession()` returns `null`, gallery is `{data: []}`, template images are two non-existent names. Result: therapist screens work; patient routes (`/session/:id/patient`, `/canvas/`) show the "Acceso denegado" dialog (`48-...`). |
| Harness for the real patient screens | To see the *real* (non-demo) `GenerationView`, `CanvasView`, modals and `SessionView` as a patient, the screenshot script intercepted the Vite-served modules `devPreviewMocks.js`, `sessionsService.js` and `comfyService.js` in the browser (Playwright `route`) and swapped in a patient user, an active session and six template images (served from `src/assets/images/template_images`). Source on disk is untouched. This is a capture aid only; **it shows that today the hosted demo cannot show the patient creation flow with `VITE_DEV_PREVIEW_MODE` alone.** Screens marked (patched) below were captured this way. |
| Not capturable | Real image generation, WebSocket chat messages, "final view" after "Confirmar la obra creada" (needs a generated image), session-expired global dialog. The refine modal's Generate button does nothing visible in preview (mock returns a filename pointing at the missing backend). |

Notes on the files: PNGs over ~400 KB were converted to `.jpg` (q80), so some links end in `.jpg`. Dark overlays in modal shots are the real Reka/shadcn overlay (`bg-black/50`-style), not a capture artefact.

### Key discovery: the app is two products stitched together

The "current UI" is a hybrid. Four screens (Welcome, Login, Patient Home, `DemoCreationWorkspace`/demo gallery, plus the Header) have already been re-skinned by the earlier prototype pass with the teal/cream tokens, `prototype-*` classes, 11-12 px-radius cards and three-language strings. **Everything behind them is the old app**: Signup, the real `GenerationView` (1578 lines), `CanvasView`, all modals, `CalendarView`, `TherapistGenerationView`, `CreateSessionModal`, `ChatPanel`, and the Spanish-only literals inside them. The two halves differ in palette, type scale, spacing, radii and tone, and the old half is not translated (CA/EN toggle changes only the redesigned screens).

---

## 1. Screen-by-screen

Legend: D = 1440, T = 1024, M = 390. All paths relative to `screens/current/`.

### 1.1 Entry screens

| Screen | Screenshots | Purpose | What works | Problems |
|---|---|---|---|---|
| **Landing / Welcome** (`/`, `WelcomeView.vue`) | [D](screens/current/01-landing-es-desktop.jpg) [T](screens/current/01-landing-es-tablet.jpg) [M](screens/current/04-landing-es-mobile.png) [CA](screens/current/02-landing-ca-desktop.jpg) [EN](screens/current/02-landing-en-desktop.jpg) [focus](screens/current/03-landing-focus-desktop.jpg) | Emotional first impression; Begin / Skip to login. | Strongest screen in the app. Dark atmospheric blue-teal/mauve sky, calm tone, one headline, one paragraph, one primary action, warm peach accent; contrast excellent (10.9-14.6:1); good focus ring (`#f2d2bc` 3 px); reduced-motion handled. Follows the art-direction doc. | (a) The "atmospheric sanctuary" is only blurred gradients; at 1440 the right 45% is empty and the mist reads as a smudged grey/blue wash rather than a place, so it feels like a generic "glassmorphism hero". (b) Headline is 76 px bold Inter with `max-width:12ch` - four lines, shouty rather than gentle. (c) Text sits in a dark translucent slab, i.e. the "large card" the art-direction doc says to avoid. (d) Brand is plain text "ComfyMind" - the logo mark is absent. (e) The language selector is a stark white pill, the only light element, fighting the dark scene (70x20 px label; pill 44 px tall). (f) "Saltar" (Skip) is ambiguous: skip what? (g) All CSS is scoped with hard-coded hex values; it uses none of the `style.css` tokens, so the landing cannot be re-themed with the app. |
| **Login** (`/login`, `LoginView.vue`) | [D](screens/current/05-login-desktop.png) [T](screens/current/05-login-tablet.png) [errors](screens/current/06-login-validation-errors-desktop.png) [EN](screens/current/07-login-en-desktop.png) | Authenticate; link to sign-up. | Clear two-column layout, large 48 px inputs/buttons, labelled fields, show-password toggle, inline validation + summary alert, translated. | (a) **Switches to a pale mint background (`#eef4f1`) with blurred blobs - a completely different world from the dark Welcome one click earlier.** (b) Right-hand card floats with a large soft shadow, left copy repeats the welcome headline and the app name three times (eyebrow, h1, "ComfyMind" chip) while the 96 px black outline logo is the visual centre. (c) The password placeholder is literal dots (`••••••••`), which looks like a pre-filled value; the show-password button is 40x40. (d) Eyebrow "UN ESPACIO CREATIVO Y SEGURO" is 14 px bold tracked caps in teal; fine contrast (5.9:1) but small and shouty. (e) "Crear cuenta" secondary is nearly the same weight as primary on cream (grey fill, 1.26:1 border). (f) No "forgot password" or role hint. |
| **Signup** (`/signup/`, `SignupView.vue`) | [D](screens/current/08-signup-desktop.jpg) [T](screens/current/08-signup-tablet.jpg) [full](screens/current/09-signup-fullpage-desktop.jpg) [errors](screens/current/10-signup-validation-errors-fullpage-desktop.jpg) | Create patient or therapist account. | Inline per-field errors with colour **and** text; password rules list. | **Worst-offender for cohesion.** Full-bleed saturated acrylic painting (`assets/utils/fondo_login.jpg`, 2.5 MB) behind a translucent card; a *third* brand lockup (logo + "ComfyMind" in **Nunito** 800, inline style); 36 px inputs, 12 px helper text, 16x16 show-password icons, role chosen via a native-looking select that starts unselected; card is cut off at the fold (needs scroll); link colour is default blue (`#2563eb`) not teal; error box is red-100 with `#dc2626`-ish text (3.95:1). A patient with MS signing up gets the busiest screen in the app, with low-contrast helper text over a noisy image. Translated (`signup.*` keys), but the visuals ignore the language of the rest. Sign-up is also exposed as free self-registration of a *therapist* role. |

### 1.2 Patient screens (prototype layer, `?demo=1`)

| Screen | Screenshots | Purpose | What works | Problems |
|---|---|---|---|---|
| **Patient home** (`HomeView` patient branch) | [D](screens/current/11-patient-home-demo-desktop.png) [T](screens/current/11-patient-home-demo-tablet.png) [CA](screens/current/19-patient-home-ca-demo-desktop.png) [EN](screens/current/19b-patient-home-en-demo-desktop.png) [real/patched](screens/current/21-patient-home-real-desktop.png) | See next session, enter it, or create freely. | Clear primary card ("Tu sesión está preparada" + one big "Continuar sesión"), personal greeting, low density, three languages. Closest to the brief. | (a) The hero is a large saturated teal slab with a decorative circle - heavy, "SaaS dashboard hero". (b) Second card "Creación libre" in cream with a pale outline button, third a bare link-card: three different card styles on one screen. (c) Hierarchy fine, but the teal block dominates the whole page; there is no reassurance or art. (d) Therapist label/date are 14 px at ~70% opacity white on teal. (e) Only 3 nav items yet "Mis obras" and "Mi sesión" are far apart in meaning. (f) In the real (non-demo) path the date shows in a different format (`24/11/26`) and the therapist name depends on API. |
| **Creation workspace** (`DemoCreationWorkspace`) | empty [D](screens/current/12-workspace-empty-demo-desktop.png) [T](screens/current/12-workspace-empty-demo-tablet.png) [tall](screens/current/12b-workspace-empty-demo-tall-desktop.png); error [D](screens/current/13-workspace-prompt-error-demo-desktop.png); loading [D](screens/current/14-workspace-loading-demo-desktop.png); result [D](screens/current/15-workspace-result-demo-desktop.png); saved [D](screens/current/16-workspace-saved-demo-desktop.png) | Describe an idea, generate, review, save. | Best flow in the app: one text area, one CTA, explicit empty/loading/result/saved states, "no hay una forma correcta de crear" is excellent reassurance, `aria-live`, progress bar. | (a) A "demo" banner and a progress bar ("Paso 1 de 2") add noise; the progress bar is half-filled in every state. (b) Prompt card is in cream with a *beige* icon tile, result card white with an *aqua* tile: two accent languages. (c) "Otras formas de empezar" options are disabled and at 60% opacity (contrast fails, and promises features that do nothing). (d) Result is a plain framed picture on a grey tile; no sense of ceremony or "this is yours". (e) Image is a flower/coast photo regardless of the prompt (mock). (f) Page content starts ~130 px down; on 1024x768 the generate button sits below the fold. (g) Header hamburger/nav switches responsive but the 40x40 profile button is under 44 px. |
| **Gallery / My artwork** (`SessionView` demo; real = [empty](screens/current/34-session-artwork-real-empty-desktop.png)) | [D](screens/current/17-gallery-demo-desktop.jpg) [T](screens/current/17-gallery-demo-tablet.jpg) [open](screens/current/18-gallery-artwork-open-demo-desktop.png) | Review saved works. | Calm three-up grid, big thumbnails, captions with date, nicely empty state in the real path ("Todavía no hay obras"). | (a) The stock template images (neon-green aurora, glossy hotel room) are the *only* strong colour in the product and clash with the muted teal; they set a stock-photo tone, not a therapeutic one. (b) Captions are "Obra creada durante la sesión 1/2/3" - no title, no mood, no prompt, no way to name or favourite a work. (c) Card with tiny image icon on the right is purely decorative. (d) Artwork open state is just the same page (no lightbox in the capture). |
| **Profile menu** | [demo](screens/current/20-profile-dropdown-demo-desktop.png) [real](screens/current/49-profile-dropdown-real-desktop.png) | Account / logout. | Simple. | 40x40 trigger; menu items are default shadcn; no name/role shown prominently. |

### 1.3 Patient screens (old app layer, real `GenerationView`, (patched))

| Screen | Screenshots | Purpose | What works | Problems |
|---|---|---|---|---|
| **First-visit instructions dialog** | [D](screens/current/22-generation-instructions-first-visit-desktop.png) | Orient the patient on first entry. | Content is thoughtful and kind ("no hay obras buenas o malas"). | Auto-opens a **7-bullet, ~150-word** dialog before the first action; Spanish only, mixed "tu / vuestra / confiad" register (singular vs plural); 14 px text; tiny 28 px close button. Cognitive-load heavy for a first moment. |
| **Creation hub** | [D](screens/current/23-generation-main-desktop.png) [T](screens/current/23-generation-main-tablet.png) [full](screens/current/23b-generation-main-fullpage-desktop.png) [chat open](screens/current/29-generation-chat-open-desktop.png) | Choose a method: text, image, sketch, mix; confirm final artwork. | Four options are clearly named and iconised; chat FAB is discoverable. | (a) **Looks like a different app than the demo screen**: grey-blue (`bg-slate-300/30`) panel that stops ~730 px and leaves a cream strip below; title 24 px left-aligned tight under the header; 14 px muted descriptions. (b) Large empty white card (300 px) with a faint icon eats the viewport - the hero is a blank. (c) **The four option cards are `div`s with `cursor-pointer` and `tabindex=-1`: they cannot be reached or activated by keyboard.** (d) Black outline icons, no colour coding, identical weight - no recommended starting point. (e) "Confirmar la obra creada" is a green-600 pill with white text at 50% when disabled (~2:1) - the single most important button is near-invisible until enabled; green is a third green (Tailwind `green-600`, `emerald`, teal primary). (f) Info and Help icon buttons are bare 32-px glyphs in 44-px hit areas with no visible label. (g) Teal chat FAB bottom-right overlaps content and has no label. (h) Spanish only. |
| **Modal: from text** | [D](screens/current/24-modal-refine-from-text-desktop.png) [generating](screens/current/30-refine-generating-desktop.png) [after](screens/current/31-after-generate-mock-desktop.png) | Prompt + preview. | Two-column prompt/preview is understandable; textarea gets a visible ring. | Title "Genera tu obra a partir de una descripción" is long; description repeats it; textarea is full height of the modal with no examples; "Generar imagen" (disabled grey-teal) and "Confirmar imagen" (disabled green, different green) are **two similar buttons with different colours and a hidden order**; text 14 px; close icon 16 px. |
| **Modal: from image** | [upload](screens/current/25-modal-images-from-image-desktop.png) [gallery](screens/current/25b-modal-images-gallery-tab-desktop.png) | Upload or pick an image then transform. | Tabs (upload / pick) are logical. | "Paso 1: ..." instruction in 14 px tight leading (line-height ~1), file input is a native-style "Seleccionar archivo / Ningún archivo seleccionado"; selected-tab pill is sub-44 px (≈ 30 px); focus ring is the only feedback. |
| **Modal: from sketch** | [upload](screens/current/26-modal-draw-from-sketch-desktop.png) [draw tab](screens/current/26b-modal-draw-tab-desktop.png) | Draw/upload/pick a sketch. | Three entry options. | Three tabs + steps + "Confirmar imagen" = a mini wizard inside a modal; modal height jumps between tabs; user must open yet another editor (`CanvasView`) for drawing. |
| **Modal: image mix** | [grid](screens/current/27a-modal-multiimage-mix-desktop.png) [2 selected](screens/current/27b-modal-multiimage-two-selected-desktop.png) | Select 2-4 images to blend. | Selection is visible (blue ring + check). | Selected state uses **blue** (`#3b82f6`), a fifth colour; the 108-px thumbs are tiny in a 1000-px modal; select by clicking tiny tiles (tremor); 2-4 rule only explained in the subtitle; "Generar imagen combinada" is a small teal button, different from the other modals' buttons; mock gallery empty -> toast "No hay imágenes en tu galería" ([see](screens/current/27a-modal-multiimage-mix-desktop.png) when images exist). |
| **Session info dialog** | [D](screens/current/28-dialog-session-details-desktop.png) | Therapist/date/time. | Compact. | Plain dl; no relation to the new "session card" in Home. |
| **Drawing editor** (`CanvasView`) | [D](screens/current/32-canvas-desktop.png) [T](screens/current/32-canvas-tablet.png) [drawn](screens/current/33-canvas-with-drawing-desktop.png) | Free-hand sketch to be turned into an image. | Simple toolset (thickness, draw, erase, undo, clear), large white canvas. | (a) Only monochrome black pen, no colour, no brush variety - for an *art* tool it is spartan. (b) Tool buttons are 36 px tall, the thickness slider is a 4-px track with a 16-px thumb (fine-motor hostile); slider shows "5 px" at 14 px. (c) "Confirmar boceto" is a pale disabled green. (d) The 600x600 canvas is not centred relative to the toolbar and sits in an unused grey-blue page (`bg-slate-200/..`). (e) No pointer-friendly alternative for people who cannot drag a line (upload exists elsewhere). (f) Page title 24 px / sub 14 px - same dense pattern as the hub. |

### 1.4 Therapist screens (`VITE_DEV_PREVIEW_MODE`)

| Screen | Screenshots | Purpose | What works | Problems |
|---|---|---|---|---|
| **Therapist home** | [no session](screens/current/40-therapist-home-no-session-desktop.png) [T](screens/current/40b-therapist-home-tablet.png) [active](screens/current/42-therapist-home-active-session-desktop.png) | Add a session or enter the active one. | Reasonable minimum. | **A 575 px card floating in an empty 900 px page** with the heading "Inicio", one sentence, one button. No agenda, no patients, no today's sessions - the brief's "today's sessions / calendar / patients" is absent. Titles/labels not translated; nav items "Calendario" hard-coded Spanish and uses an *image* icon for calendar. |
| **Create session modal** | [D](screens/current/41-therapist-create-session-modal-desktop.png) | Pick patient, date, start/end. | Native pickers. | Browser-default `--:-- --` time inputs, 36-px controls, date popover; confirm is small and right-aligned; no summary of what will be created. |
| **Calendar** | [D](screens/current/43-calendar-desktop.png) [T](screens/current/43-calendar-tablet.png) [session dialog](screens/current/44-calendar-session-dialog-desktop.png) [create](screens/current/45-calendar-create-session-desktop.png) | Therapist schedules and opens sessions. | FullCalendar gives a full month grid. | **Third visual language**: emerald nav buttons (`#059669`), full-width (no max-width, 40 px margins vs 104 px header), lime event chip `#48d421` with dark bold text, light-yellow "today" cell `#fffcd5`, sky-blue event dot, `#6366f1` indigo for some states; 16-px page title; weekday headers 36 px; prev/next icon buttons 55x44 joined. Event text truncated ("Preview Patien"). Colour alone separates today/selected/past. |
| **Therapist live-session view** | [D](screens/current/46-therapist-session-desktop.png) [T](screens/current/46-therapist-session-tablet.png) [end-confirm](screens/current/47-therapist-end-session-confirm-desktop.png) | Watch patient's work, chat, end session. | Chat + image side by side is the right model; confirmation before ending. | **Fourth look**: pale-blue chat panel with sky-blue header and blue send button, **saturated red "Finalizar sesión" pill**, light grey-blue page ending at ~800 px; the confirmation dialog's confirm button is **teal, not destructive** while the trigger is red - inconsistent destructive pattern; chat empty state is a blank blue box; 14-px text; info icon is a bare glyph. |
| **Access denied** | [D](screens/current/48-access-denied-error-state-desktop.png) | Role/ownership error. | Does stop the user. | Opens over a fully rendered patient page (content visible but dimmed), message "No tienes acceso a este contenido" with a single "Volver al inicio" - correct but cold; Spanish only. |

---

## 2. Landing vs. app cohesion

**Verdict: the Welcome screen is a design island.** Walking `/` -> `/login` -> `/home/` -> `/generation/` the user meets three palettes, three type voices and three background treatments, and `/signup/` and the old therapist/canvas screens add two more.

| Aspect | Welcome (`WelcomeView.vue`, scoped CSS) | Login / Patient layer (`style.css` tokens + `prototype-*`) | Old app (slate/green/blue utilities, FullCalendar CSS) |
|---|---|---|---|
| Background | 4-stop dark gradient `#101827 -> #172d3a -> #413f59` + radial teal/mauve/peach + 3 blurred "mist" layers; no image files | `#eef4f1` (login) / `--background #f6f8f5` flat, two `blur-3xl` blobs (`#cfe4de`, `#f1dfca`) | `bg-slate-300/30` panels, `bg-slate-200`, white cards; Signup: `assets/utils/fondo_login.jpg` full-bleed painting |
| Colour logic | Dark, peach (`#f2d2bc`/`#f2e5dc`) accent, near-white text | Light, teal primary `#176b63`, cream `#fffaf4/#f3e8dc` secondary | Tailwind `green-600/700`, `emerald-600/700`, `blue-500/600`, `sky-500`, `red-600`, `indigo-500`, lime `#48d421` |
| Type | Inter 750-800, huge clamp up to 76 px, tracking +0.08em brand | Inter 700, 30-48 px h1, tracked caps eyebrow 14 px | Inter 600, 24 px titles, 14 px body; Signup logo in **Nunito** (`index.html` loads only Nunito) |
| Shapes | Radius 20-32 px glass slab, 999 px pill-ish buttons (≈ 48 px tall) | `--radius 0.875rem` -> cards 12-16 px, inputs 12 px, buttons mixed pill and `rounded-xl` | `rounded-md/lg/xl`, `rounded-full` red/green CTAs |
| Imagery | None; logo not shown | Black line-art logo mark (`public/logo_comfymind.svg`) 96/44 px; template photos in gallery | Painting JPG in Signup; template photos; icon glyphs |
| Language | 3 languages | 3 languages | Mostly Spanish literals |

Concrete CSS/assets involved:

* **`src/views/WelcomeView.vue` `<style scoped>`**: hard-coded hex everywhere (`#f7f7fa`, `#172d3a`, `#f2d2bc`, `rgba(231,205,186,.3)`, ...). It does not read `--background`/`--primary`. It restyles `.language-selector` (defined in `style.css`) via `:deep()` to a white pill.
* **`src/style.css` `:root` tokens** only describe the light teal theme; the `.dark` block is the stock shadcn slate oklch set (`oklch(0.129 0.042 264.695)` etc.) and was never retuned - it does not match the Welcome's dark atmosphere and is not reachable from the UI. The sidebar and chart tokens are also stock slate.
* **`public/wave-haikei.svg`, `public/stacked-waves-haikei.svg`**: unreferenced in `src/` (leftover from the old landing).
* **`src/assets/utils/fondo_app.jpg` (3.0 MB), `fondo_login.jpg` (2.6 MB), `header_app.png`, `logo.png`**: only `fondo_login.jpg` is still used (Signup). `fondo_app.jpg` and `logo.png` are dead weight; `logo_comfymind_border.svg` is not referenced either. The old app was built on a painted-canvas aesthetic that the redesign dropped but never replaced.
* **`index.html`**: `<title>frontend</title>`, `<html lang="en">` (app is ES/CA), `vite.svg` favicon, loads Nunito from Google Fonts but **not Inter**. `style.css` names `Inter` first in `font-family`, so on a machine without Inter installed the UI falls back to `system-ui`; the captured screenshots were rendered with a locally installed Inter, so a real user's rendering will differ.
* **`App.vue`**: `class="font-sans text-gray-900"` on `#app` and a long commented-out legacy gradient block.
* **`CalendarView.vue` scoped `--fc-*` variables** (`#059669`, `#0ea5e9`, `#48d421`, `#fffcd5`, `#6366f1`, `#f1f5f9`).

What should be shared: the Welcome's sense of depth and warmth (peach `#f2d2bc`, desaturated teal `#356771`, twilight mauve `#756c8d`) is not present anywhere inside the app; the app's teal is a different, more clinical green-teal (`#176b63`). There is no bridge colour (login should be able to inherit a dusk/mist surface), and the logo mark appears everywhere *except* the landing.

---

## 3. Accessibility quick check

Measured by DOM audit on the captured pages (visible interactive elements below 44 px on the shortest side, rendered font sizes) and by computing WCAG ratios from the CSS values. This is a quick check, not a formal audit.

### 3.1 Target size

| Screen | Interactive elements < 44 px | Examples |
|---|---|---|
| Header (all app screens) | 2 | Profile button 40x40, language `<select>` label 70x20 (container 44 high) |
| Login | 2 | Show-password 40x40 |
| Signup | **10** | Inputs and submit 36 px tall, show-password icons 16x16, role select |
| Patient demo home / workspace | 2 | Header only (good: page controls 44-48 px) |
| Real creation hub | 3 | "Confirmar la obra creada" 40 px, header |
| Canvas editor | **8** | Draw/Erase 36 px, Undo/Clear/Confirm 36 px, slider thumb 16x16 |
| Calendar | **56** | Day-name headers 36, day cells links 36x40, "Crear nueva sesión" 42, Hoy 42 |
| Therapist live view | 5 | Send 36x36, "Finalizar sesión" 40 high, text input 36 |

The redesigned layer mostly honours 44-48 px (`h-12`, `min-h-11`); the old layer defaults to shadcn's `Button` `h-9` (36 px) and `size-9` icons (`components/ui/button/index.ts`: default 36, sm 32, lg 40, icon-lg 40). **There is no token or default that enforces a minimum target**; every view re-applies `h-12 rounded-xl` by hand.

MS-specific: tremor and dexterity make 36 px controls, 16 px slider thumbs, tight tab pills in modals and image tiles 108 px square (multi-select) the riskiest spots. Spacing between adjacent small controls (Undo / Clear / Confirm, 8 px apart) invites accidental activation, and **Clear canvas is not confirmed**.

### 3.2 Text size

| Observed font size (visible text characters) | Where |
|---|---|
| 12 px (≈109 chars) | Signup helper text and password rules |
| 13.6-14.4 px | Calendar, many labels |
| 14 px (dominant: 382 chars on the creation hub, 202 on the demo workspace, 146 on canvas) | Card descriptions, modal body, form labels |
| 16 px | Prototype body |
| 18-20 px | Leads and card titles |

`ACCESSIBILITY_REQUIREMENTS_DRAFT.md` asks for a "comfortable base text size". The base is 16 px in the prototype layer and **14 px in the old layer**, and all captions drop to 12-14 px. There is no text-size control (deferred in the draft, but worth planning: use `rem` everywhere so browser zoom/user font size works; `html` has no explicit size).

### 3.3 Contrast (computed from real CSS values)

| Pair | Ratio | Verdict |
|---|---|---|
| `--foreground #17302d` on `--background #f6f8f5` | **13.1:1** | AAA |
| `--muted-foreground #526762` on `#f6f8f5` / white / `#edf1ee` | 5.7 / 6.0 / 5.3 | AA (AAA fails; borderline for low vision) |
| White on `--primary #176b63` (primary button) | **6.3:1** | AA |
| `--primary` text (eyebrows) on background | 5.9:1 | AA |
| `--secondary-foreground #164f49` on `#e8f1ee` | 8.1:1 | AAA |
| `--accent-foreground #714b31` on `#f3e8dc`; `#68472f` on `#fffaf4` | 6.3 / 8.0 | AA/AAA |
| Welcome: `#f7f7fa` on `#17243a`; `#f2d2bc` on `#17243a`; `#e7e7ed` on `#172d3a` | 14.6 / 10.9 / 11.6 | AAA |
| Welcome primary button `#17243a`-ish text on `#f3e8dc` | 12.9 | AAA |
| **Borders** `--border #d7e0dc` on bg; `--input #cbd8d3` on white | **1.26 / 1.47:1** | Fails the 3:1 non-text contrast (WCAG 1.4.11) - card and input outlines are almost invisible; cards rely on shadow |
| Focus ring `--ring #21857b` on bg / white | **4.2 / 4.5:1** | Passes 3:1, 3 px + 3 px offset: good (`:focus-visible` in `style.css`, Welcome has its own peach ring) |
| White on Tailwind `green-600` (`#16a34a`, old "confirm" buttons) | **3.3:1** | Fails AA for 14-18 px text |
| Disabled "Confirmar imagen" (green at 50% opacity, white text) | ≈ **2:1** | Exempt as disabled, but it is the primary CTA of every modal and is unreadable |
| Calendar event `#f8fafc` on `#0ea5e9` | **2.65:1** | Fails |
| Calendar nav `#f8fafc` on `#059669` | 3.6:1 | Fails for 14 px |
| Signup error text `#dc2626` on `#fee2e2` | 3.95:1 | Fails AA for small text |
| Link blue `#2563eb` on white | 5.2:1 | Passes |
| White on red `#e60000` ("Finalizar sesión") | 4.8:1 | Passes narrowly |
| Disabled "Otras formas de empezar" rows (60% opacity) | ≈ 2.3:1 | Reads as muted, but looks like active content |

### 3.4 Focus visibility and keyboard

* A global `:focus-visible` ring (3 px `--ring` + 3 px offset) exists in `style.css`; modals show good rings ([modal](screens/current/24-modal-refine-from-text-desktop.png)). 
* **The four creation-method cards in the real hub are click-only `div`s (tabindex -1)**; Tab traverses header, icons and the confirm button but never reaches them ([focus test](screens/current/50-focus-ring-generation-desktop.png)). A keyboard-only or switch-access patient cannot start creating. Same pattern likely in the old modals' thumbnail tiles (they are `img` click targets in `MultiImageModal`/`GalleryDialog`).
* Canvas drawing is pointer-only; there is no keyboard route (acceptable for freehand, but the "upload a sketch" fallback is buried in a modal 2 levels away).
* Language `<select>` is a native element with `outline: none` on the select and the ring moved to the wrapper (`:focus-within` on Welcome) - works, but custom per-screen.
* `<html lang="en">` in `index.html`; the language is not reflected in `lang` when ES/CA is chosen -> screen readers mispronounce.

### 3.5 Motion and colour reliance

* `prefers-reduced-motion` is globally honoured in `style.css`; Welcome additionally checks `matchMedia` and a narrow-viewport media query. Pointer parallax is only 6-18 px. Good. Spinners (`animate-spin`) remain, which is fine.
* Colour-only cues: calendar "today" (pale yellow), selected (indigo), past (grey), event state (lime vs sky) are distinguished by hue; multi-select uses a blue ring **plus** a check (good); validation errors use red **plus** text (good); the demo "stepper" colour fill has a text label. "Finalizar sesión" red/destructive vs teal confirm is a colour convention only.
* Toasts (`vue-sonner`, `top-right`, `rich-colors`) auto-dismiss and are blue/green/red tinted - the draft says "avoid automatic dismissal of important messages"; the "No hay imágenes en tu galería" toast is an example of important info that disappears.

### 3.5b Other findings against the draft

| Draft requirement | Status |
|---|---|
| Back / cancel / close easy to find | Modals have a 16-px "x" only; no visible "Cancelar" in the creation modals. Canvas has no back button besides the header nav. |
| Plain direct language, short labels | Prototype layer yes; old layer has long titles ("Genera tu obra a partir de una imagen de entrada"). Instructions dialog mixes register. |
| Do not remove entered info after validation error | Login/signup keep input (good). |
| Ask confirmation before destructive actions | "Finalizar sesión" yes; "Limpiar lienzo" no; deleting a session in calendar uses destructive button. |
| Session state / unsaved work visible | No autosave indicator or "saved" chip in the old creation flow; demo has "Guardado". |
| Avoid time pressure | The session-end timer silently closes all modals and shows "Sesión finalizada" with no countdown or warning. |
| Reassuring neutral language | Good in prototype copy; errors in old flow are raw ("Error cargando galería: ..." toast with backend detail). |
| Language selector visible | Visible on every page, but translations stop at the prototype layer. |

---

## 4. Usability

### 4.1 Core patient task: "create an image in a session"

Real flow (patched mock; counts actions a patient performs from first load):

| # | Action | Screen |
|---|---|---|
| 1 | Click "Empezar" | Welcome |
| 2 | Type e-mail | Login |
| 3 | Type password | Login |
| 4 | Click "Iniciar sesión" | Login |
| 5 | Click "Continuar sesión" / "Acceder a la sesión" | Home |
| 6 | Close the auto-opened 7-bullet instructions dialog (first visit only) | Creation hub |
| 7 | Click "Desde texto" (card is mouse-only) | Creation hub |
| 8 | Type the description | Modal |
| 9 | Click "Generar imagen" (wait for ComfyUI, tens of seconds) | Modal |
| 10 | Click "Confirmar imagen" | Modal |
| 11 | Click "Confirmar la obra creada" | Creation hub |

**11 actions / 5 screens-or-states (incl. 1 modal), 9 if already logged in and the instructions were seen.** Sketch route adds: open editor (new page), draw, "Confirmar boceto", back, optional description, generate, confirm = **~14**. Image-mix adds selecting 2-4 tiles.

Prototype (`?demo=1`) flow: Empezar, e-mail, password, Iniciar, Continuar sesión, type, Generar, Guardar = **8 actions** - a better target (login is the fat: 4 of 8). For a fatigued patient the ideal is ≤ 4 from Home: Continue session -> type -> Generate -> Save.

### 4.2 Points of confusion

1. **Two confirmations** ("Confirmar imagen" in the modal and "Confirmar la obra creada" in the hub) with unclear difference; the latter probably ends the artwork for the therapist ("send to therapist"), but the label does not say so.
2. Three separate stages of *generate* inside modals (Generar imagen / Generar imagen combinada / Confirmar) with different button colours.
3. Creation hub empty state says "Empieza seleccionando una opción abajo" while the options are below the fold on 1024x768 and look like content cards, not buttons.
4. "Mi sesión" vs "Mis obras" vs "Inicio": three nav items for a patient who has a single task. In the real app "Mi sesión" opens `/generation` (not the session) and "Mis obras" opens `/freeimages` (free works, not the session's works).
5. Demo banner "Vista de demostración..." + hard-coded date 16/07/2026 (in the past) and "Marta Soler" are visible in the prototype - confuses stakeholders about what is real.
6. "Saltar" on Welcome and "Creación libre" on Home imply a path outside a session that the old app barely supports.
7. No indication of how much session time is left; session end is abrupt.
8. Therapist role: after login the therapist sees the same "Inicio" with no list of patients or today's sessions; they must discover the Calendar. The therapist cannot see *which patient* is working until opening the live view.
9. Role is chosen once in Signup via a select defaulting to nothing; a patient can register as therapist.
10. Preview-mode specific: `VITE_DEV_PREVIEW_MODE` yields a therapist who is denied the patient screens; `?demo=1` yields a patient who sees no therapist screens. Neither mechanism is a role switcher, and neither covers Canvas, the modals or Calendar as a patient/therapist pair. (Relevant to hosted-demo planning, decision D3.)

---

## 5. Current design tokens

### 5.1 `frontend/src/style.css` (Tailwind v4 `@theme inline`; there is **no** `tailwind.config.*`; `components.json`: shadcn-vue `new-york`, baseColor `slate`, cssVariables, Lucide)

Light (`:root`):

| Token | Value | Notes |
|---|---|---|
| `--radius` | `0.875rem` (14 px) | `sm = r-4`, `md = r-2`, `lg = r`, `xl = r+4` -> 10 / 12 / 14 / 18 px |
| `--background` | `#f6f8f5` | warm-grey green off-white |
| `--foreground` | `#17302d` | deep green-black |
| `--card`, `--popover` | `oklch(1 0 0)` | pure white |
| `--card-foreground`, `--popover-foreground` | `oklch(0.129 0.042 264.695)` | **stock slate navy, inconsistent with `--foreground`** |
| `--primary` / `-foreground` | `#176b63` / `#ffffff` | teal |
| `--secondary` / `-foreground` | `#e8f1ee` / `#164f49` | |
| `--muted` / `-foreground` | `#edf1ee` / `#526762` | |
| `--accent` / `-foreground` | `#f3e8dc` / `#714b31` | warm cream / brown |
| `--destructive` | `oklch(0.577 0.245 27.325)` | stock red (~`#e7000b`) |
| `--border`, `--input` | `#d7e0dc`, `#cbd8d3` | 1.3-1.5:1 |
| `--ring` | `#21857b` | |
| `--chart-1..5` | stock shadcn oklch | unused |
| `--sidebar*` | `#fbfcfa`, `#17302d` + stock slate oklch for primary/accent/border/ring | unused |

Dark (`.dark`): complete stock shadcn slate palette (`oklch(0.129 0.042 264.695)` background, `oklch(0.208 ...)` card, ...). Not themed for the app and no switch exists.

Base layer: `* { border-border outline-ring/50 }`, `body { bg-background text-foreground antialiased; min-width: 320px; font-family: Inter, ui-sans-serif, system-ui, ... }`, `:focus-visible { outline: 3px solid var(--ring); outline-offset: 3px }`, `scroll-margin: 1rem` on controls.

Component classes: `.prototype-page` (`max-w-6xl px-4/6 py-8/10`), `.prototype-eyebrow` (14 px bold uppercase tracking 0.16em primary), `.prototype-title` (30/36 px bold), `.prototype-lead` (16/18 px, leading 7, muted), `.language-selector` (min-h 44, rounded-xl, border, white, shadow-sm).

`prefers-reduced-motion` global reset (0.01 ms animations). `tw-animate-css` imported. No spacing, shadow, z-index, motion or type-scale tokens; no semantic status colours (success, warning, info) - the old views use raw Tailwind greens/blues/reds instead.

### 5.2 Fonts

* Declared stack `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`; **Inter is not loaded** (no `@font-face`, no `<link>`, no `@fontsource` dependency).
* `index.html` loads **Nunito** (Google Fonts, variable 200-1000), which is only used by an inline style on the Signup wordmark.
* Observed sizes: 12, 13.6, 14, 16, 18, 20, 24, 30, 36, 48, 76 px; weights 500-800 (Welcome uses 750 and 800).

### 5.3 Hard-coded colours outside the tokens

| Where | Values |
|---|---|
| Login | `#eef4f1`, `#cfe4de`, `#f1dfca`, `#17302d`, `#526762`, `#315b55` |
| Home / workspace | `#fffaf4`, `#f3e8dc`, `#825b3e`, `#d8c4ad`, `#68472f` |
| Welcome | ~25 hex/rgba values (see §2) |
| Old views | Tailwind `green-600/700`, `emerald-600/700`, `blue-50/100/500/600`, `red-100`, `slate-300/30`, `gray-100/200`, `text-slate-600/900` |
| Calendar | `--fc-*` plus `#48d421`, `#fffcd5`, `#6366f1`, `#0ea5e9`, `#059669` |
| Signup | inline `rgb(17, 24, 39)`, Nunito, `bg-white/95` over JPG |

### 5.4 UI primitives (`src/components/ui`, shadcn-vue + Reka UI)

`button` (variants default/destructive/outline/secondary/ghost/link; sizes default 36, sm 32, lg 40, icon 36, icon-sm 32, icon-lg 40 px; base `rounded-md text-sm font-medium`), `input`, `textarea`, `select`, `native-select`, `dialog`/`alert-dialog`/`sheet`, `card`, `tabs`, `calendar`, `popover`, `command`, `carousel`, `sidebar`, `slider`, `skeleton`, `spinner`, `sonner`, `tooltip`, `avatar`, `breadcrumb`, `alert`, `label`, `separator`, `dropdown-menu`. Views override sizes/radii per call-site (`h-12 rounded-xl px-6`) instead of defining a patient-size button variant.

---

## 6. Top 10 issues (ranked)

| # | Issue | Why it matters (evidence) | Redesign recommendation |
|---|---|---|---|
| 1 | **Landing and app are different products** (dark atmosphere -> pale mint -> teal slab -> grey-blue/green/red old screens; five palettes, three type voices) | §2; compare [01](screens/current/01-landing-es-desktop.jpg), [05](screens/current/05-login-desktop.png), [23](screens/current/23-generation-main-desktop.png), [43](screens/current/43-calendar-desktop.png), [08](screens/current/08-signup-desktop.jpg) | Define one token set (dusk-teal/mist/peach family from Welcome) in `style.css`, re-point Welcome and all views to it, and drive the same atmospheric background through login, home and workspace with calmer, lighter variants. |
| 2 | **The core creation flow is the old, inaccessible UI**: mouse-only method cards, 14-px text, modal-in-modal wizard, two "confirm" buttons with disabled ≈2:1 green, Spanish-only | [23](screens/current/23-generation-main-desktop.png), [24](screens/current/24-modal-refine-from-text-desktop.png), [26](screens/current/26-modal-draw-from-sketch-desktop.png), §3.4 | Rebuild the hub on the `DemoCreationWorkspace` pattern: one prompt + one generate CTA, method choices as real buttons (large, keyboard-operable), a single result/save step; migrate strings to the locale dictionary. |
| 3 | **Touch targets and text below the brief** (36-px buttons, 16-px slider thumb, 12-14 px text, 56 sub-44 controls on Calendar) - hostile to tremor and low vision | §3.1-3.2 | Set a minimum 48-px control height and 18-px base text as tokens/variants (patient `lg` button, bigger slider, 56-px thumbs); use `rem` everywhere so zoom works; keep 44 as hard floor for therapist screens. |
| 4 | **Low-contrast structure**: borders 1.3-1.5:1, off-brand status colours (white on `green-600` 3.3:1, calendar chips 2.65:1, red-on-pink errors 3.95:1), disabled CTA unreadable | §3.3 | Darker border/input tokens (>= 3:1), define success/warning/error/info tokens at AA, never fade the primary CTA - show enabled-but-explained or "describe your idea first" helper instead of 50% opacity. |
| 5 | **Therapist side has no design**: floating "Inicio" card, FullCalendar in lime/emerald/yellow, blue chat panel, red pill | [40](screens/current/40-therapist-home-no-session-desktop.png), [43](screens/current/43-calendar-desktop.png), [46](screens/current/46-therapist-session-desktop.png) | A dense-but-calm therapist home (today's sessions, patients, recent artwork) in the same tokens; restyle the calendar through `--fc-*` mapped to the tokens; chat as a neutral side panel; destructive pattern consistent (red trigger = red confirm). |
| 6 | **Signup is the noisiest, smallest-text screen** (saturated painting background, Nunito wordmark, 36-px fields, 12-px rules) and arrives right after the calmest one | [08](screens/current/08-signup-desktop.jpg), [10](screens/current/10-signup-validation-errors-fullpage-desktop.jpg) | Reuse Login layout/tokens; one field group per step or at least large fields; plain role chooser as two large cards; drop `fondo_login.jpg` or reserve it as a decorative, low-contrast art accent. |
| 7 | **Generic "SaaS template" feel**: stock shadcn cards/buttons/icons (Lucide black outlines), big teal hero slab, white cards on off-white, stock chart/sidebar/dark tokens, neon stock photos in the gallery | [11](screens/current/11-patient-home-demo-desktop.png), [17](screens/current/17-gallery-demo-desktop.jpg), §5 | Give the product an art-therapy identity: tonal surfaces with depth from the Welcome palette, a distinctive display + text pairing, softer organic shapes (consistent radius scale), curated calm illustrations/placeholder artwork, and the logo mark used as a motif. |
| 8 | **Welcome page**: beautiful intent, but headline too large/shouty, content in a dark slab, empty right half, logo missing, ad-hoc white language pill, hex-only CSS | [01](screens/current/01-landing-es-desktop.jpg) | Keep atmosphere and contrast; tone headline to ~48-56 px with softer weight, add logo mark and a hint of artwork or layered mist on the empty side, make the language control match the dark scene, move styles to tokens. |
| 9 | **Too many steps and ambiguous nouns for a fatigued user**: 11 actions to first image; two confirms; "Mi sesión / Mis obras / Creación libre"; unannounced session end; instructions dialog before first task | §4 | Target <= 4 actions from Home; one persistent "Continue session" path; clearly named final step ("Send to Marta"); optional, collapsible 3-line guidance instead of an auto dialog; visible session timer with a gentle 5-minute notice. |
| 10 | **Infrastructure/identity hygiene** undermining trust: `<title>frontend`, `lang="en"`, Vite favicon, Inter not loaded, Nunito loaded but only for one wordmark, 5.6 MB of unused JPGs and waves SVGs, CA/EN toggle translating only half the app, demo-mode banner and past dates, preview mocks that cannot show a patient | §2, §0 | Load one self-hosted variable font (with Catalan glyph check), set `lang` from locale, real title/favicon, delete dead assets, complete the translation dictionary, and unify the two demo mechanisms into one role-switchable mock (patient / therapist) usable by the hosted static build. |

### Quick wins (<= 1 day each)

* Add `min-h-12` patient button variant and apply to all primary actions.
* Make the four method cards `<button>` elements.
* Darken `--border` / `--input` to >= 3:1 and replace `green-600` and calendar chip colours with the tokens.
* Fix `index.html` (`lang`, title, favicon, font links).
* Remove `fondo_app.jpg`, `logo.png`, `header_app.png`, `wave-haikei.svg`, `stacked-waves-haikei.svg`, `logo_comfymind_border.svg` after confirming no references.

### Strengths to keep

The Welcome copy and calm structure; the patient greeting card and its hierarchy; the demo workspace's empty/loading/result/saved states with `aria-live`; the global focus ring and reduced-motion handling; 44-48 px primary controls and `min-h-11` language selector in the redesigned layer; the three-language dictionary approach (`usePrototypeLocale`) and the terminology table in `UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`; the reassuring "no hay una forma correcta de crear" tone, which is the emotional core the visual design should serve.
