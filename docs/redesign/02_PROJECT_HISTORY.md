# ComfyMind — Project History and Context

Worker W2 output for the ComfyMind redesign. Written from repository evidence only
(local git history, `origin` branch heads, PR #1 branch, docs and config files).
No source code was changed. Commit messages written in Catalan or Spanish are
translated in the text. Dates are commit dates (`YYYY-MM-DD`).
Sections 2 and 3 use `git log --all`; the three `claude/...` commits are local only.

## 1. Origin

**What the evidence shows**

- The upstream GitHub repository is `dianabenito/...`. The name `TFG_ArtTerapiaApp` appears in
  `mkdocs.yml` (`site_url: https://dianabenito.github.io/TFG_ArtTerapiaApp/`) and in the
  install guide (`cd TFG_ArtTerapiaApp\ -\ copia`). The first commit is `3d96448` (2025-10-29,
  author `dianabenito`).
- Almost all upstream commits are authored by `diana`, `dianabenito` or `Diana Benito Reyes`. These
  look like one person under three git identities. The GitHub login `dianabenito` is the
  owner of the PR branches (`feature/eN_...`, `bugfixing/...`, `extension/...`).
- `TFG` is the Catalan abbreviation for *Treball de Fi de Grau* (final-degree project). The
  repository does not name a university, and the word "TFG" is only in the URL and
  path. The "final-degree project" reading is an inference from that name.
- The project is an art-therapy app for people with multiple sclerosis (MS). Users are
  patients and therapists (`docs/DESIGN_SYSTEM_BRIEF_DRAFT.md`, `AGENTS.md`).
- Upstream work ended on 2026-01-15 with merges of `feature/e8_finalChanges`, `dev`
  and then PR #76 (`dev` into `main`). The `gh-pages` branch has an MkDocs deploy from the same day.
- The fork is `r4s-mu5/ComfyMind` (the `origin` remote). Its commits are by `r4s-mu5`
  (2026-07-13 and 2026-07-15), and by `ras.mus` for the PR #1 commit (2026-05-06). Commits
  made in this session are by `Claude` (2026-11-24) and exist only locally.

**What is not in the evidence:** the university, the degree, the supervisor, and the
exact relationship between the upstream author and the fork owner.

## 2. Timeline

Epics are named after their branches (`feature/eN_<name>-tM_<task>`). Each epic is
a set of task branches merged by PR into the epic branch, and then the epic goes to `main`
(or to `dev` for the last epic).

| Epic / phase | Period | What was delivered | Key commits and PRs |
|---|---|---|---|
| Initial commit | 2025-10-29 | Repository created | `3d96448` |
| **e0 baseSetup** | 2025-11-01 – 11-02 | FastAPI backend skeleton; DB schemas and CRUD classes; Vite + Vue frontend; user creation from the frontend. Included a SQLite DB file, later removed. | `11b15be`, `93536d3`, `b282d5d`, `dc4e859`, `2fcbfd5`, `39563e9`. PRs #3, #4, #7, #8 |
| **e1 imageGeneration** | 2025-11-02 – 11-11 | Connection to ComfyUI for a text-to-image workflow. Generated images are received and saved to `assets`, shown in the frontend, and saved to the DB for each user. Patient and Therapist as subclasses of User. WebSocket channel for a patient and therapist in one session. | `1a511c9`, `f52fc8a`, `7397a08`, `7944e48`, `e49aa2f`, `f216ea2`. PRs #9, #10, #11, #13, #14 |
| **e2 signUpLogIn** | 2025-11-11 – 11-14 | Login endpoint with password hashing; login and sign-up views with auth in the frontend; user-session traceability; WebSocket detects the logged-in user; therapist can end a session. Integration tests. Many "updated yml" commits on 11-14 for CI tests. | `61db80e`, `f761745`, `b599fd6`, `3319c58`, `728bc4d`, `19aecbe`, `9c31b32`. PRs #15, #16, #21, #22, #24, #26 (bugfix) |
| **e3 advancedImageGeneration** | 2025-11-21 – 12-02 | txt2img + img2img workflows; reuse of the previous seed; any input image; user uploads to the gallery; gallery of template images; IP-Adapter workflows that combine images; tests. | `ad55924`, `730392d`, `3155a8a`, `94f8e18`, `b5f49e8`. PRs #27, #28, #29, #33 |
| **e4 sketchesRedisign** | 2025-12-02 – 12-04 | Sketch-to-image workflow; manual sketch/canvas editor (not saved by default); sketch converted to Comfy images; Spanish-to-English translation of prompts for sketch2img. | `29b0b8f`, `9f8df46`, `af1d4fc`, `b0172da`. PRs #34, #35, #39, #40 |
| **e5 sessionManager** | 2025-12-04 – 12-10 | Pages linked to a session; session calendar; therapist creates, changes and cancels scheduled sessions; overlap warning that the user can confirm; integration tests; date/timezone fixes (ISO, UTC, local). | `a66dbaf`, `18cc91c`, `6135f04`, `b70d44a`, `478575a`, `bdd06d0`, `d27f868`. PRs #41–#51, #54 (bugfix) |
| **e6 realTimeChat** | 2025-12-09 – 12-11 | Chat between patient and therapist during a session (backend and frontend). Integration tests. | `67808dc`, `bb81072`. PRs #52, #53, #55, #58 |
| **e7 frontendRedesign** | 2025-12-11 – 12-18 | shadcn-vue setup; redesigned login, sign-up, home, calendar, creation modals, generation page and canvas view; header and navigation; popups and toasts. | `9e3f931`, `a191c67`, `0f82b70`, `0f12b3c`, `fbf196f`, `492d774`, `1edb89f`. PRs #59–#61, #67, #68 |
| **e8 finalChanges** | 2025-12-19 – 2026-01-15 | Session summary page with its images; free generation and gallery outside a session; better positive and negative prompts; translated error messages; route protection; IP set through env; logo; MkDocs documentation; changes after user tests; send images without conversion. Merged to `main` as PR #76. | `d2851b9`, `cac1378`, `a155cc3`, `67d0bf6`, `da0cf4c`, `82a5392`, `b4a34fa`, `c5ac365`, `8707ed2`, `dcda085`. PRs #72–#76 |
| Gap | 2026-01-15 – 05-06 | No commits. | — |
| **PR #1 (fork)** | 2026-05-06 | "Add frontend preview mode with mocked API services" (`ras.mus`). Frontend-only preview with mocked services; 6 files, +80 lines, on top of `main`. Open. | `ff8d36d` (branch `codex/add-interface-access-without-backend-startup`) |
| **Redesign start (fork)** | 2026-07-13 | Snapshot of the working app, then the Codex visual prototype scope and the patient prototype. | `e0007e2` (chore: preserve working app), `2be8f9b`, `6aa0993` (feat: patient visual prototype), `de5bfe8` (branch `redesign/foundation`) |
| **Welcome screen (fork)** | 2026-07-15 | Welcome/intro screen before login: visual direction doc, then a multilingual atmospheric welcome screen. | `7859c0d`, `2840034` (branches `feature/welcome-screen` and `feature/welcome-scroll-experience`, same sha) |
| **Redesign plan (local)** | 2026-11-24 | Clean base: `main` + landing content + PR #1 mocks, junk excluded; then a master plan in `docs/redesign/`. Local branch `claude/art-therapy-gui-redesign-8c2ik9`. Not on origin at the time of this check. | `aa38d64`, `64e2f37`, `2218004` |

Branch naming. Task branches follow `feature/eN_<epic>-tM_<task>`. Fixes use `bugfixing/...`
and one early branch uses `extension/...`. The `dev` branch was used to collect the last
epic before `main`.

## 3. The fork's redesign work

Starting point: `main` (upstream tip `814e79e`, 2026-01-15).

### 3.1 `codex/add-interface-access-without-backend-startup` (PR #1, open)

- One commit on top of `main`: `ff8d36d` (2026-05-06, `ras.mus`).
- Adds a frontend-only preview mode with mocked API services, so the UI can run without
  the backend or ComfyUI. Per `PLAN.md` it uses `VITE_DEV_PREVIEW_MODE=true` and
  `src/lib/devPreview*.js`.
- Docs in this branch: `docs/` is unchanged from `main`. The branch only adds frontend code.

### 3.2 `redesign/foundation` (head `de5bfe8`, 2026-07-13)

Four commits on top of `main`:

1. `e0007e2` — "chore: preserve working application before UI redesign". Snapshot of the
   working app. **Adds about 12,100 files, including `frontend/node_modules`, a DB file,
   `.env` files and `__pycache__`** (see section 4).
2. `2be8f9b` — "docs: define Codex visual prototype scope". Adds the design-brief docs
   and `AGENTS.md`. Removes the `.env`, `frontend/.env` and DB files.
3. `6aa0993` — "feat: add patient visual prototype". 12 frontend files
   (`Header.vue`, `HomeView.vue`, `LoginView.vue`, `SessionView.vue`, `GenerationView.vue`,
   `LanguageSelector.vue`, `prototype/DemoCreationWorkspace.vue`,
   `composables/usePrototypeLocale.ts`, `composables/usePrototypeDemo.ts`, `style.css`).
   Adds a demo mode, ES/CA/EN locale switching and a patient-first look.
4. `de5bfe8` — "docs: refine visual prototype implementation task".

`AGENTS.md` (added here) sets the prototype scope: patient screens first (login, patient
home, creation workspace, result/gallery), an optional therapist preview, minimal
interactivity, and work kept inside `frontend/`.

### 3.3 `feature/welcome-screen` (head `2840034`, 2026-07-15)

Builds on `redesign/foundation`:

1. `7859c0d` — "docs: define welcome screen visual direction".
2. `2840034` — "feat: add multilingual atmospheric welcome screen" (7 files, +611/−52).

`feature/welcome-scroll-experience` points to the same commit (`2840034`).

### 3.4 Docs introduced by the redesign branches

Files under `docs/` added on the fork. `redesign/foundation` has the first five rows
(ACCESSIBILITY, DESIGN_SYSTEM, UI_TERMINOLOGY, PROTOTYPE_REVIEW_CHECKLIST, CODEX_VISUAL_PROTOTYPE_TASK).
`feature/welcome-screen` adds the rest:

| File | Summary |
|---|---|
| `docs/ACCESSIBILITY_REQUIREMENTS_DRAFT.md` | Minimum accessibility requirements for the first visual prototype. Explicitly not the final accessibility spec. |
| `docs/DESIGN_SYSTEM_BRIEF_DRAFT.md` | Design-system brief: ComfyMind context (MS, patient and therapist roles) and visual constraints for the prototype. |
| `docs/UI_TERMINOLOGY_ES_CA_EN_DRAFT.md` | Proposed ES / CA / EN terminology table for interface labels, to review before applying. |
| `docs/PROTOTYPE_REVIEW_CHECKLIST.md` | Pre-meeting checklist: ComfyUI on port 8188, backend on 8000 (`/docs`), frontend on 5173, prototype branch active. |
| `docs/CODEX_VISUAL_PROTOTYPE_TASK.md` | Task brief for implementing the patient-focused visual prototype, with a read-first list. |
| `docs/CODEX_HANDOFF_VISUAL_PROTOTYPE.md` | Handoff for the next agent (14 Jul 2026): approved decisions, screens built, validation, incomplete items, next steps. |
| `docs/CODEX_HANDOFF_WELCOME_SCREEN_ADDENDUM.md` | Addendum making a welcome screen before login the next priority. |
| `docs/WELCOME_SCREEN_TASK.md` | Task brief for the welcome / introduction screen. |
| `docs/WELCOME_SCREEN_VISUAL_ART_DIRECTION.md` | Art direction for the welcome screen: calm, safe, minimal, atmospheric; first place to set the visual identity. |

Also present but not read in detail: `docs/CAMBIOS_INTERFAZ_PROTOTIPO_VISUAL_ES.txt` and
`docs/INTERFACE_CHANGES_VISUAL_PROTOTYPE.txt` (interface change logs, `.txt` not `.md`), and
the PDF below.

**`docs/INFORME_ACCESIBILIDAD_PROTOTIPO_VISUAL_ES.pdf`** (on `feature/welcome-screen`). Title from
page 1: "Informe de accesibilidad — Prototipo visual · Experiencia de paciente", ComfyMind.
Version 1.0, dated 14 July 2026. Scope: access, patient home, creation space and artwork gallery.

**Docs on `main` (upstream MkDocs site, `mkdocs.yml`):**

| File | Summary |
|---|---|
| `README.md` | Catalan install manual for Windows: ComfyUI setup (port 8188), backend and frontend setup. |
| `docs/index.md` | MkDocs home (Spanish): project description, stack (FastAPI, SQLAlchemy, JWT, Vue 3, Vite, shadcn/ui, Pinia). |
| `docs/backend/models.md` | Auto-generated (mkdocstrings) ORM model reference. |
| `docs/backend/schemas.md` | Auto-generated Pydantic schema reference. |
| `docs/backend/crud.md` | Auto-generated CRUD reference. |
| `docs/backend/endpoints.md` | Auto-generated REST endpoint reference. |
| `docs/frontend/services.md` | Hand-written list of frontend HTTP services (for example `userService`). |
| `docs/frontend/componentes.md` | Vue component docs; marked "En desarrollo" (in development). |
| `docs/frontend/vistas.md` | Vue view docs; marked "En desarrollo". |

`AGENTS.md` (on the redesign branches) is the working agreement for coding agents.
`main` has no `AGENTS.md`.

## 4. Repository hygiene problems

Checked with `git ls-tree` on the branch heads and `git log --all -- <path>`. Only file
names and counts are given here. No secret values were read or printed.

1. **`frontend/node_modules` is tracked** on `redesign/foundation`, `feature/welcome-screen` and
   `feature/welcome-scroll-experience`: about 12,088 files at the tip. It was added in `e0007e2`
   (chore: preserve working app). `main` does not track it.
2. **Python bytecode is tracked**: 21 `.pyc` files under `backend/app/__pycache__/`
   (`cpython-311`) on the same three branches. Also in history.
3. **Environment and DB files are in history**: `.env`, `frontend/.env` and root
   `artTerapia_app.db` were added in `e0007e2` and deleted in `2be8f9b`. None is at a branch tip. They
   should be checked for secrets before any history is shared. Separately,
   `backend/artTerapia_app.db` was committed in `b282d5d` and removed in `dc4e859`
   (both on the upstream e0 DB work, 2025-11-01).
4. **No `.gitignore` on `main`** (`git show origin/main:.gitignore` fails). This is why the
   junk above could be added. `main` tracks only `.env.example` and `frontend/.env.example`.
5. **Duplicate branch**: `feature/welcome-screen` and `feature/welcome-scroll-experience` both
   point to `2840034`.
6. **Branch prefixes are inconsistent upstream**: `extension/`, `feature/` and `bugfixing/` are all
   used for task branches. `dev` (`86f605a`, PR #75 merge) is one merge behind `main` (`814e79e`, PR #76).
7. **Local-only history**: `claude/art-therapy-gui-redesign-8c2ik9` (three commits from 2026-11-24)
   is not on `origin`. Push is blocked (403), per `PLAN.md`.
8. **Noisy messages**: upstream has "updated yml" (x10, 2025-11-14), "bugs fixing",
   "minor changes", "cleaned code". One author appears as three identities (`diana`, `dianabenito`,
   `Diana Benito Reyes`).
9. **Mixed languages in commit messages**: Catalan (2025-11 to 12), then Spanish (from about 12-02),
   and English on the fork.

## 5. Glossary (Catalan / Spanish terms in code and commits)

Terms are from commit messages and `origin/main` code/docs. Catalan forms are marked (ca),
Spanish (es). Some words are in both.

| Term | Language | English meaning / where it appears |
|---|---|---|
| sessió / sesión | ca / es | Session. Core entity: a therapy session between a patient and a therapist. `sessions.py`, `SessionView.vue`. |
| sessió agendada | es | Scheduled session (calendar entry). "cancelar sesiones agendadas". |
| terapeuta | ca / es | Therapist. A user role. Used in code and docs. |
| paciente / pacient | es / ca | Patient. The other user role. |
| usuari / usuario | ca / es | User. |
| inici de sessió | ca | Login (sign-in). |
| registre | ca | Registration or sign-up (for example "redirecció a registre de sessió"). |
| contrasenya / contraseña | ca / es | Password. Passwords are hashed in the login endpoint. |
| calendari / calendario | ca / es | Calendar. The session calendar page. |
| solapament / solapamiento | ca / es | Overlap. Warning when a new session clashes with another. |
| finalitzar / finalizar | ca / es | End (a session). |
| próximas / finalizadas | es | Upcoming / finished (session lists in `sessions.py`). |
| boceto / esbós / esbozo | es / ca | Sketch. The `boceto` term is used in code (about 67 mentions); `esbossos` in commits. |
| galeria / galería | ca / es | Gallery. Gallery of user, template and drawn images. |
| plantilla | es | Template. Template image gallery. |
| pujar | ca | Upload. "usuari pot pujar imatges de la galeria". |
| imatge | ca | Image. Commit messages only; the code uses `imagen` (es). |
| generació / generación | ca / es | Generation (image generation through ComfyUI). |
| tornar a generar | ca | Regenerate. |
| semilla / seed | es / en | Seed. "mantenint la seed" = keeping the seed. |
| imatge de referència | ca | Reference image (input for img2img). |
| prompt positiu / negatiu | ca / es | Positive / negative prompt. |
| esbós → imatge | ca | Sketch converted to image (sketch2img). |
| creació / creacio | ca | Creation (for example "creació de la base de dades" = creating the DB). |
| redisseny / rediseño | ca / es | Redesign. Epic e7 "frontendRedesign". |
| estructura | ca / es | Structure or layout. |
| canvis | ca | Changes. |
| millores | ca | Improvements. |
| afegit / afegida | ca | Added. |
| documentació | ca | Documentation. |
| proves | ca | Tests or trials. "canvis posteriors a les proves amb usuaris" = changes after user tests. |
| gestió d'errors | ca | Error handling. |
| traducció | ca | Translation. |
| redirecció | ca | Redirect. |
| proteccion de los endpoints | es | Protecting API endpoints (auth). |
| plantilla de imagenes / utils | es | Template images and utility files (uploaded to GitHub, e8). |
| sense convertir | ca | Unconverted (send an image without converting). |
| dates | ca | Dates. "solucionat problema de conversió de dates" = date conversion fix. |
| usuario / nombre completo | es | User / full name (field added in `b074b62`). |
| cancelar | es | Cancel. "cancelar sesiones agendadas" (commit `bc4c315`). |

Other words in `main` code (es): `Crea` (create), `Obtiene` (get), `Envía` (send),
`Solo los terapeutas pueden` (only therapists can), `Paciente no encontrado` (patient not found).
