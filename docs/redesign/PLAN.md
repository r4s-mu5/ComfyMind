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

### Phase 4 — Deliver
- Static demo build → hosted link.
- Clean repo ready to share (push once access is fixed).
- Meeting notes: what changed, why, what's next (chatbot, etc.).

## Status Board

| ID | Status | Notes |
|----|--------|-------|
| W1 | pending | |
| W2 | in_progress | |
| W3 | pending | |
| W4 | pending | |
| I1 | pending | |
| V1 | pending | |
| B0 | pending | |
| B1 | pending | |
| B2 | pending | |
| B3 | pending | |
| R1 | pending | |

## Log

- 2026-11-24 — Orchestrator: clean base branch created (main + welcome-screen content + PR #1 mocks, junk excluded); `vite build` passes. Plan written. Push blocked (403).
