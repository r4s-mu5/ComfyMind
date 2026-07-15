# ComfyMind visual prototype — Codex handoff

Last updated: 14 July 2026

## Purpose

This document gives the next Codex agent enough context to continue work in the
same repository without reconstructing the prototype history.

ComfyMind supports art-therapy sessions for people with multiple sclerosis. The
current branch contains an initial patient-facing visual prototype for reviewing
appearance, hierarchy, terminology, accessibility basics, and the main patient
journey. It is not a production redesign.

Read the current root `AGENTS.md` before making changes. Also read:

- `docs/ACCESSIBILITY_REQUIREMENTS_DRAFT.md`
- `docs/DESIGN_SYSTEM_BRIEF_DRAFT.md`
- `docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md`
- `docs/CODEX_VISUAL_PROTOTYPE_TASK.md`
- `docs/PROTOTYPE_REVIEW_CHECKLIST.md`

## Approved decisions

The user explicitly approved the following constraints:

1. The therapist dashboard is completely deferred for this iteration.
2. Authentication must remain unchanged. Do not add, hard-code, or seed login
   accounts or credentials.
3. The frontend-only generation demonstration is allowed only when explicitly
   isolated, easy to remove, and unable to replace or modify ComfyUI services,
   WebSockets, API contracts, or backend behavior.
4. The approved demo switch is the query parameter `?demo=1`.
5. `SessionView.vue` may present artwork because its existing routes already own
   session artwork and free-creation artwork responsibilities. Do not repurpose
   unrelated routes.
6. Do not modify `CanvasView.vue`, creation modals, or unrelated legacy screens
   unless a later request specifically requires it.
7. Keep shared components proportional and avoid abstraction without reuse or a
   clear consistency/accessibility benefit.
8. All meeting data must be synthetic: artwork, patient names, email addresses,
   therapist information, dates, and session details.
9. Preserve the approved terminology:
   - Obra / Obras
   - Creación libre / Creació lliure / Free creation
   - Mi sesión / La meva sessió / My session
10. Do not commit unless the user explicitly requests it.

## Implemented prototype

### Login

- Calm two-column desktop layout and responsive single-column layout.
- Visible language selector.
- Larger form fields and actions.
- Existing authentication call and redirect flow preserved.
- Localized labels, validation, loading, and error states.
- Semantic form submission, autocomplete attributes, `aria-invalid`, and
  field-to-error relationships.
- Accessible show/hide password control.

Primary file: `frontend/src/views/LoginView.vue`.

### Shared patient shell

- Patient-first top navigation for Home, My session, and My artwork.
- Mobile Sheet navigation using existing Reka UI components.
- Active-route styling, language selector, and profile menu.
- Synthetic profile identity is shown only in demo mode.
- Existing therapist navigation is not expanded into a prototype.

Primary files:

- `frontend/src/components/Header.vue`
- `frontend/src/components/ProfileDropdown.vue`
- `frontend/src/App.vue`

### Patient home

- Low-density welcome screen.
- Dominant current-session card with therapist, date, time, and one primary
  Continue session action.
- Separate Free creation and My artwork actions.
- Dedicated loading and error states.
- Normal route retains existing API and WebSocket behavior.
- `?demo=1` skips home API/WebSocket activity and displays only synthetic data.

Primary file: `frontend/src/views/HomeView.vue`.

### Creation workspace

- The normal `GenerationView.vue` integration path is retained.
- When `?demo=1` is present, `GenerationView.vue` returns before user, session,
  gallery, ComfyUI, timer, and WebSocket setup.
- The demo UI lives in one removable component:
  `frontend/src/components/prototype/DemoCreationWorkspace.vue`.
- The demo includes empty-input validation, loading, result, saved, and
  navigate-to-gallery states.
- It uses bundled synthetic artwork and does not call or modify any generation
  service.
- Image, sketch, and combination methods are shown as disabled secondary
  controls. The existing creation modals were not changed.

Primary files:

- `frontend/src/views/GenerationView.vue`
- `frontend/src/components/prototype/DemoCreationWorkspace.vue`

### Artwork/gallery

- `SessionView.vue` keeps its existing responsibilities for:
  - artwork associated with `/session/:sessionId`;
  - free-creation artwork associated with `/freeimages`.
- The previous carousel presentation was replaced with a responsive artwork
  grid.
- Artwork items are keyboard-operable buttons and open a larger Dialog preview.
- Loading, empty, details, create, and back actions are represented.
- Existing authorization and data calls remain active without the demo flag.
- `?demo=1` skips artwork calls and uses only bundled synthetic artwork.

Primary file: `frontend/src/views/SessionView.vue`.

## Localization

Localization uses a lightweight composable rather than an added dependency:

- `frontend/src/composables/usePrototypeLocale.ts`
- `frontend/src/components/LanguageSelector.vue`

It supports Catalan (`ca`), Spanish (`es`), and English (`en`). The selected
language is stored under `comfymind.prototype.locale` in `localStorage`. The
composable also updates `document.documentElement.lang`.

Only the redesigned journey and shared shell are fully covered. Legacy signup,
calendar, canvas, creation modals, and therapist screens remain outside the
prototype dictionary.

## Demo routing

The query flag is handled by:

- `frontend/src/composables/usePrototypeDemo.ts`

It only detects `route.query.demo === '1'` and preserves that flag across the
approved prototype routes. It is intentionally not a large demo-state system.

Meeting entry point:

```text
http://127.0.0.1:5173/?demo=1
```

Use the existing placeholder credentials. The login screen does not contain or
reveal credentials. After login, the intended demo journey is:

```text
/?demo=1
  → /home?demo=1
  → /generation?demo=1
  → /freeimages?demo=1
```

## Accessibility implementations

- Global 3 px high-contrast `:focus-visible` treatment.
- Large primary controls, generally 44–48 px high.
- Semantic headings, forms, navigation, buttons, lists, and definition lists.
- Accessible names for icon-only controls.
- Decorative icons marked `aria-hidden="true"`.
- Form errors linked with `aria-describedby` and `aria-invalid`.
- `aria-live="polite"` regions for loading and result states.
- Alert component retains `role="alert"`.
- Text and icons accompany color-based state changes.
- No drag-only interaction was introduced.
- Reduced-motion behavior via `prefers-reduced-motion`.
- Dynamic HTML language value for assistive technology.
- No horizontal overflow was found on the four prototype screens at a 390 px
  viewport width.

Shared visual tokens and accessibility rules are in
`frontend/src/style.css`.

## Validation already completed

The final frontend production build succeeded:

```powershell
Set-Location frontend
npm.cmd run build
```

PowerShell blocks the `npm.ps1` wrapper on this machine, so use `npm.cmd` when
running npm scripts from PowerShell. The successful build transformed 2,559
modules.

Non-blocking build warnings:

- Browserslist data is stale.
- One generated JavaScript chunk is larger than 500 kB.

Do not update dependencies or run audit fixes solely to remove these warnings.

Manual browser review completed successfully for:

- Login, home, workspace, and gallery opening.
- Navigation through the full demo journey.
- Catalan, Spanish, and English switching.
- Persistence of language and `html[lang]` updates.
- Empty prompt validation.
- Loading, result, saved, and gallery states.
- Visible 3 px keyboard focus ring.
- Desktop and 390 px-wide layouts without horizontal overflow.
- No console warnings or errors during the reviewed journey.

If frontend code is changed again, rerun `npm.cmd run build` and repeat the
manual checks required by `AGENTS.md` before reporting completion.

## Documentation produced

- `docs/INTERFACE_CHANGES_VISUAL_PROTOTYPE.txt`
  - English description of the interface changes.
- `docs/CAMBIOS_INTERFAZ_PROTOTIPO_VISUAL_ES.txt`
  - Spanish description of the interface changes.
- `docs/INFORME_ACCESIBILIDAD_PROTOTIPO_VISUAL_ES.pdf`
  - 13-page Spanish accessibility report with code evidence, indicative WCAG
    2.2 mapping, contrast calculations, validation, limitations, recommendations,
    and official W3C/WAI references.

The PDF was structurally validated as PDF 1.4 with an EOF marker, 13 page
objects, document title, and no prohibited attribution in its source. Its SHA-256
at generation time was:

```text
f6a27a5b0673ec38aff3e3ee4c56729ee8307f406782dc0de9bfe761e901c93a
```

## Intentionally incomplete

- Therapist dashboard preview remains deferred.
- Authentication, backend, database, API contracts, and WebSocket contracts are
  unchanged.
- Missing ComfyUI nodes and generation failures are not addressed.
- Demo Save is visual and does not persist artwork.
- Demo image, sketch, and combination methods are disabled.
- `CanvasView.vue` and all creation modals are unchanged.
- Legacy screens are not fully translated or redesigned.
- Formal WCAG conformance, automated accessibility testing, screen-reader
  testing, 320 CSS px reflow, 400% zoom, high-contrast themes, text-size controls,
  and motor/cognitive customization remain future work.
- Route-specific document titles have not been added; the document title remains
  the general “ComfyMind”.

## Suggested next steps

1. Collect stakeholder feedback before expanding the prototype.
2. Record terminology, density, and workflow changes requested in the meeting.
3. If accessibility work continues, prioritize:
   - complete keyboard traversal including all dialogs;
   - NVDA/VoiceOver testing;
   - 320 CSS px and 200%/400% zoom checks;
   - route-specific page titles;
   - complete contrast inventory;
   - testing with patients and therapists.
4. Do not expand into therapist UI, production image generation, or unrelated
   legacy screens without renewed approval.

## Current repository state

At the time this handoff was written:

- Branch: `redesign/foundation`
- HEAD: `de5bfe8` (`patient-prototype-v1` tag)
- The frontend implementation is tracked and currently clean relative to HEAD.
- The generated documentation files listed above are untracked, as is this
  handoff document.
- No commit was created as part of the documentation requests.

Always run `git status --short` before changing files. Preserve existing and
unrelated user changes, and do not commit unless explicitly asked.
