# ComfyMind Redesign — Master Plan

Living document. Workers update **only their own row** in the Status Board and
append to the Log at the bottom. The orchestrator owns everything else.

## Goal

Turn ComfyMind (art-therapy app for people with multiple sclerosis; patient +
therapist roles; ComfyUI image generation behind a FastAPI backend) into an
intentional, cohesive, good-looking and usable product — landing page and app in
one visual language — and have a **polished, hosted, backend-free demo** ready for
the stakeholder meeting.

## Decisions so far

| # | Decision | Source |
|---|----------|--------|
| D1 | Meeting scope: **polished core flow** — Landing → Login → Patient home → Creation workspace → Gallery/result, + one therapist screen. Other screens only inherit tokens. | User, 2026-11-24 |
| D2 | Interview: interviewer agent writes the questions + a **visual direction board**; orchestrator asks them in chat; answers recorded in `DESIGN.md`. | User |
| D3 | Demo delivered as a **hosted link** (static build, mocked data, no ComfyUI/backend). | User |
| D4 | A **clean repo** to share in the meeting: history = upstream `main` + clean commits, no `node_modules`, `__pycache__`, `.db`, `.env`. | User |
| D5 | Base = `main` + content of `feature/welcome-screen` (which contains `redesign/foundation`) + PR #1 mock services, junk removed. Branch: `claude/art-therapy-gui-redesign-8c2ik9`. | Orchestrator |
| D6 | Keep the stack: Vue 3, Vite, Tailwind 4, Reka UI / shadcn-vue, Lucide, Pinia, Axios. No new component framework. | `AGENTS.md` |
| D7 | Audience: research director + academic reviewers. Several TFG students will build on the design, so **the design system and handbook are first-class deliverables**. | User (interview) |
| D8 | Direction: **Liminal Sanctuary** (A + artwork mounts and labels + soft-vaporwave liminal atrium with reactive classical 3D on dusk screens). Dusk outside, dawn inside. Tenor Sans + Readex Pro. Comfort panel toggles. Full spec: `DESIGN.md`. | User (interview) |
| D10 | **Vibecheck rule:** criticise the first idea against LLM red flags and move away from them; regular fresh-eyes reviews. `VIBECHECK.md`, also in AGENTS.md and CLAUDE.md. | User |
| D11 | **No "patient" in the GUI.** Use the person's name and *tú*; the role word is usuario · usuari · user ("persona usuaria" in sentences). Code identifiers are unchanged. | User |
| D12 | 3D = **procedural three.js only** (no model files), lazy-loaded, low-res render pass, tight budget. A shader-only scene was considered and kept as an option. | User + orchestrator |
| D13 | 3D: **generative Escultura abstracta**, a new seeded sculpture on click/tap plus a keyboard button, with a museum label "Escultura nº NNNN". FX = 1/4 pixels + strong dither + static grain. **No camera or object motion** except the regenerate transition. | User |
| D9 | Demo: Spanish default; reviewers view it over a video call and on their own computers, so desktop QA comes first; curated template images. | User (interview) |

## Known facts / constraints

- Users: people with **multiple sclerosis** (possible tremor, fatigue, low vision,
  cognitive load) and their **therapists**. Accessibility is a design driver, not a checklist.
- UI languages: **ES / CA / EN** (`usePrototypeLocale.ts`).
- Two backend-free mechanisms exist and must be reconciled:
  1. `VITE_DEV_PREVIEW_MODE=true` → mocked API services (`src/lib/devPreview*.js`, from PR #1).
  2. `?demo=1` query flag → prototype screens (`usePrototypeDemo.ts`, `DemoCreationWorkspace.vue`).
- Router uses `createWebHistory` — static hosting needs hash history or a fallback.
- Prior design thinking lives in `docs/*_DRAFT.md`, `docs/WELCOME_SCREEN_*`, `docs/CODEX_*`, `AGENTS.md`.
- GitHub push currently blocked (403) — commits are local until access is fixed.

## Phases

### Phase 1 — Discovery (parallel workers)
| ID | Task | Model | Output |
|----|------|-------|--------|
| W1 | Codebase & feature inventory: routes, roles, flows, API, WebSocket, data model, ComfyUI workflows, both demo modes, code-quality/tech-debt findings | Sonnet | `docs/redesign/01_APP_INVENTORY.md` |
| W2 | Project history: branches/epics, commit log, PR, mkdocs docs, what changed when | Haiku | `docs/redesign/02_PROJECT_HISTORY.md` |
| W3 | Current UI audit: run demo mode, screenshot every screen (desktop + tablet), critique vs. existing design docs & accessibility draft | Sonnet | `docs/redesign/03_CURRENT_UI_AUDIT.md` + `docs/redesign/screens/current/` |
| W4 | Design research: art-therapy & MS-accessible UI, calm/creative product references, type & colour candidates (Catalan/Spanish glyphs), Vue-compatible resources | Sonnet | `docs/redesign/04_DESIGN_RESEARCH.md` |

### Phase 2 — Direction
| ID | Task | Model | Output |
|----|------|-------|--------|
| I1 | Interviewer: read Phase 1, list gaps/unknowns, propose 2–3 aesthetic directions with rationale, write question bank | Opus | `docs/redesign/05_INTERVIEW.md` |
| V1 | Visual direction board (palettes, type, sample screen per direction) | Sonnet | Artifact link + `docs/redesign/board/` |
| — | Orchestrator runs interview in chat, records answers | Orchestrator | `05_INTERVIEW.md` answers |
| — | Write design document (principles, tokens, components, screen specs) | Orchestrator | `docs/redesign/DESIGN.md` |

### Phase 3 — Build (meeting scope, D1)
| ID | Task | Model |
|----|------|-------|
| B0 | Foundation: tokens in `style.css`, typography, shell/header, unify demo mode, hash routing for hosting | Sonnet |
| B1 | Landing + Login/Signup | Sonnet |
| B2 | Patient home + session/creation workspace (+ draw/canvas entry) | Sonnet |
| B3 | Gallery / result + one therapist screen | Sonnet |
| R1 | Review: visual QA screenshots, a11y check (contrast, targets, focus), code review | Opus/Sonnet |
| VC | **Vibecheck** (`VIBECHECK.md`): a fresh-eyes reviewer per finished screen and before the meeting asks "does it look vibecoded? obvious LLM red flags?" Anything rated yes or somewhat gets fixed. | Opus (fresh agent) |

### Phase 4 — Deliver
- Static demo build → hosted link.
- Clean repo ready to share (push once access is fixed).
- Meeting notes: what changed, why, what's next (chatbot, etc.).

## Status Board

| ID | Status | Notes |
|----|--------|-------|
| W1 | done | Inventory in 01_APP_INVENTORY.md; neither demo mode is complete; txt2img workflow JSON is corrupt on this branch |
| W2 | done | Wrote `02_PROJECT_HISTORY.md`: origin, epic timeline e0–e8, fork redesign branches, docs list, hygiene findings (tracked node_modules/.pyc, .env/.db in e0007e2 history, duplicate welcome sha), glossary. |
| W3 | done | `03_CURRENT_UI_AUDIT.md` + 63 screenshots in `screens/current/`. Demo: `?demo=1` = patient (home/workspace/gallery only); dev-preview = therapist only. |
| W4 | done | 04_DESIGN_RESEARCH.md: 3 directions (Atmospheric Sanctuary / Paper Studio / Gallery Wall); w3.org fetch blocked, some links unverified |
| I1 | done | 05_INTERVIEW.md: 4 rounds / 16 questions, R1 re-ranks R2; 11 contradictions; 14 open Qs triaged a/b/c; 17 defaults not asked |
| V1 | done | board/index.html + board/img/art1-6.jpg |
| T1 | done | 06_TYPOGRAPHY.md + type/index.html; recommend Castoro Titling/Castoro + Luciole; Atkinson Hyperlegible (Next too) fails Catalan Ŀŀ |
| L1 | done | liminal 3D prototype |
| B0 | done | Tokens in style.css, 15 components in components/sanctuary/ (+README), useComfort, AppShell wired in App.vue, locale ES/CA/EN, `/design` style guide (+ `/design/dusk` DuskLayout demo). Builds pass; contrast script all ok. Header.vue removed. |
| B0a | done | demo engine: `VITE_DEMO`, fake backend + sockets, hash routing; see `DEMO_MODE.md` |
| B1 | done | Landing, Login, Signup (dusk, SField/SButton), SanctuaryScene.vue (thin lazy wrapper, poster/CSS-sky fallback; waits for L2's scene/sanctuaryScene.js), SessionEndOverlay.vue (props: artworks, name, homeTo, overlay; B2 to mount). Locale ES/CA/EN landing/login/signup/sessionEnd. 3D untested until L2 file lands. |
| L2 | done | abstract objects + post-FX |
| B2 | in_progress | |
| B3 | done | GalleryView.vue (Mis obras wall by sala, filter, detail dialog; also /session/:id), TherapistSessionView.vue (+TherapistChat.vue), CalendarView on tokens. Old views at /legacy/... |
| F1 | done | VC1 must-fixes + patient sweep |
| R1 | pending | |
| VC1 | done | foundation vibecheck: somewhat vibecoded (generic dusk blobs/orb/centred card, card-everything, caps eyebrows, Sparkles on Crear); 9 must-fix in reviews/VC1_FOUNDATION.md |

## Log

- 2026-11-24 — Orchestrator: clean base branch created (main + welcome-screen content + PR #1 mocks, junk excluded); `vite build` passes. Plan written. Push blocked (403).
- 2026-11-24 — W2: project history written to `docs/redesign/02_PROJECT_HISTORY.md`. Status done.
- 2026-11-24 — W4: design research written to `docs/redesign/04_DESIGN_RESEARCH.md`. Status done.
- 2026-11-24 — W1: app inventory written to `docs/redesign/01_APP_INVENTORY.md` (roles, flows, routes, API/WS/data model, workflows, both demo modes, i18n, tech debt, open questions). Status done.
- 2026-11-24 — W3: current UI audit written to `docs/redesign/03_CURRENT_UI_AUDIT.md`, 63 screenshots in `screens/current/`. Status done.
- 2026-11-24 — I1: interview written to `docs/redesign/05_INTERVIEW.md` (facts, contradictions, triage, 4 rounds x 4 questions, defaults, empty answers table). Status done.
- 2026-11-24 — V1: visual direction board built at `docs/redesign/board/index.html` (+ `img/art1..6.jpg`, 204 KB). Checked at 1440/390/375, no horizontal scroll. Status done.
- 2026-11-24 — B0a: demo engine in `frontend/src/lib/demo/` + `lib/config.js`; `npm run build:demo`; verified patient+therapist flows with Playwright; report in `docs/redesign/DEMO_MODE.md`. Status done.
- 2026-11-24 — T1: typography exploration in `docs/redesign/06_TYPOGRAPHY.md` + specimen `docs/redesign/type/index.html` (4 pairings × dusk/dawn, 176 KB, checked 1440/390). Glyphs verified with fontTools; Atkinson Hyperlegible + Next and Ibarra Real Nova lack Ŀŀ (out). Recommend Castoro Titling/Castoro + Luciole. Status done.
- 2026-11-24 — L1: liminal 3D prototype at `docs/redesign/liminal/index.html` (3 presets Quiet/Dreaming/Liminal, Motion + 3D toggles, posters, ES/CA/EN); SMK public-domain scans (Venus de Milo, Apollo Belvedere heads, meshopt, 115 KB) + procedural columns; ≤ 42k tris; checked 1440/1024/768/390, no console errors; `ASSETS.md`, `NOTES.md`. Status done.
- 2026-11-24 — B0: design-system foundation done: tokens + atmosphere CSS (`style.css`), self-hosted Tenor Sans/Readex Pro, `useComfort`, sanctuary components + README, AppShell/DuskLayout, `/design` style guide (+ `/design/dusk` DuskLayout demo); both builds pass, screenshots at 1440/1024 checked. Status done.
- 2026-11-24 — B1: landing, login, signup, SanctuaryScene wrapper, SessionEndOverlay done; both builds pass; no console errors; 3D pending L2 module. Status done.
- 2026-11-24 — B3: Mis obras gallery wall, therapist live session (AppShell aside: chat + private notes, danger end dialog), calendar tokens; demo + normal builds pass, Playwright two-page live check (BroadcastChannel), no console errors. Status done.
- 2026-11-24 — F1: VC1 must-fixes applied to the foundation (dusk horizon, sun on the horizon, strata mist, dither, left-aligned DuskLayout, square hung ArtworkMount, flat SCard, Tenor caps only for wordmark/display/museum labels, SessionCard status on the date leaf, Comfort check + dusk panel, text-only nav, profile menu without role label) and the "patient" sweep of visible text; both builds pass.
- 2026-11-24 — L2: procedural Liminal scene (Quiet mood) with 3 abstract objects Ruina / Escultura abstracta / Estudio (no figures, no models), custom post-FX (1/3-res nearest pixels, light Bayer dither, static grain, optional vignette), module `frontend/src/components/sanctuary/scene/sanctuaryScene.js` (+ copy in `docs/redesign/liminal/scene/`), new posters in both places, old models/ and human-figure posters deleted; ≤ 30k tris per scene; lazy chunk 143 KB gzip; builds pass, no console errors. Status done.
