# 01 - ComfyMind App Inventory (what the program does today)

Worker W1, 2026-11-24. Branch `claude/art-therapy-gui-redesign-8c2ik9` (HEAD `43772c2`).
Source of truth is the code; every place where docs and code disagree is marked **[DOC≠CODE]**.
Line references are `file:line` on this branch. Backend tests could not be executed in this sandbox (no `fastapi` installed); test statements are from reading them.

---

## 1. Summary

ComfyMind is an art-therapy web app for people with multiple sclerosis (MS) and their therapists. A **therapist** schedules timed sessions with a **patient** in a calendar. During the session window both join a live room: the patient creates artwork with SDXL image generation (text-to-image, image-to-image, sketch-to-image from an uploaded or hand-drawn sketch, or a blend of 2/3/4 images), submits images to the therapist in real time, and chats with them over a WebSocket; the therapist watches the latest submitted image, chats, and ends the session. Outside sessions a patient can create "free" artwork and browse galleries. The stack is Vue 3 + Vite + Tailwind 4 + Reka UI/shadcn-vue on the front, FastAPI + SQLAlchemy/SQLite + JWT + WebSocket on the back; the backend drives a locally installed ComfyUI (Windows paths assumed) via its `/prompt` HTTP API and a filesystem watcher. It began as a university final-degree project (TFG, `dianabenito/TFG_ArtTerapiaApp`). The branch also carries a newer "visual prototype" layer (welcome screen, translated login/signup/home/gallery, demo workspace) sitting on top of the older, untranslated functional screens.

---

## 2. Roles and permissions

Roles are the `type` column of `users` (`patient` | `therapist`), chosen freely at signup (no admin approval, no invitation) - `SignupView.vue`, `schemas/user.py`. The JWT carries `sub` (user id) and `user_type` but the server ignores `user_type` and reloads the user from DB (`dependencies.py`).

| Capability | Patient | Therapist | Enforced where |
|---|---|---|---|
| Sign up / log in | yes | yes | public endpoints |
| See Home (active/next session card) | yes (low-density, translated) | yes (same view; extra "create session" card + patient list) | `HomeView.vue` |
| Calendar of own sessions | route exists, **no nav link** for patient (Header.vue:49 only adds it for therapist) | yes | client only |
| Create a session | no (403 on `POST /sessions/session/{patient_id}`) | yes, for any patient | `api/sessions.py:38`, but see generic endpoint, sec. 9 |
| Reschedule a session (only if in future & not active) | UI: no; API: **yes, either participant** (`crud/session.py:9`) | yes | UI `CalendarView.vue canModify` |
| Cancel/delete a session | no | yes, own sessions only | `crud/session.py:28` |
| End a session early | no | yes, own sessions only | `api/sessions.py:242` |
| Join live session | `/session/:id/patient` (must be patient of session AND session must be the *active* one) | `/session/:id/therapist` (same checks) | client-side checks in views + WS close(1008) server-side |
| Generate images (all 5 modes), upload, draw | yes | **no** - every generation/upload endpoint returns 404 "Los terapeutas no pueden tener imágenes" for therapists (`crud/comfy.py`) | server |
| See live artwork/chat | own work + chat | latest submitted image + chat | WS relay |
| Free gallery (`/freeimages`) | yes | blocked ("unauthorized" dialog) | `SessionView.vue:88-93` |
| Past session gallery (`/session/:id`) | yes, if participant | yes, if participant | `SessionView.vue:77`, server 403 on session fetch |
| List all users (emails) | yes | yes | `GET /users/users/` is **unauthenticated** (see sec. 9) |

Roles are not used for route guards: the router has no `beforeEach`; each view self-checks after mount and shows an "Access denied" dialog.

---

## 3. User flows

### 3.1 Sign-up and login (both roles)
1. `/` Welcome (animated mist background, "Begin"/"Skip" - both just go to `/login`; `WelcomeView.vue:157-161`).
2. `/signup/`: email, full name, password + confirm, role select (Patient / Therapist). Client validates password (>=8 chars, uppercase, digit, special) and matches server rule in `crud/user.py:255`. `POST /users/users/` then redirect to `/login`.
3. `/login`: email + password (>=8 chars client-side) -> `POST /users/login/` (OAuth2 form) -> JWT stored in `localStorage['token']` (8 h expiry) -> `/home`. No role-based redirect; Header and Home branch on `user.type` after `GET /users/users/me`.
4. Any 401 on a non-login route opens a global "session expired" dialog (`plugins/axios.js`, `App.vue`) that logs out and returns to `/login`. Note it keys off `window.location.pathname` (axios.js:9), which breaks under hash routing.
5. Logout: ProfileDropdown removes the token (client-side only; token remains valid until expiry).

### 3.2 Therapist: create and manage sessions (calendar)
1. `/home`: therapist sees the active/next session card and a card "Añadir una nueva sesión" -> `CreateSessionModal` (hard-coded Spanish). `HomeView.vue:286-290`.
2. `/calendar` (FullCalendar month grid, Spanish locale, Monday first): therapist header has prev/next/today + "Crear nueva sesión". Event title = patient name; classes: `active-event`, `pending-event`, ended = none.
3. Create: pick patient (searchable combobox of all patients), date (shadcn Calendar), start/end time. Client-side overlap check against the therapist's own sessions -> "Sesión solapada" confirm dialog (overlap is only a warning; server has no overlap check). `POST /sessions/session/{patient_id}`; server validates start<end and fires a WS `new_session` push to the patient's `/ws/home` socket if connected (`api/sessions.py:68`).
4. Click an event: modal with patient, times, buttons: **Update** (only if future and not active -> date/time form, overlap check, `PUT`), **Cancel session** (confirm -> `DELETE`), **Enter session** (only if this is the active session) -> `/session/:id/therapist`, **View artwork** (if ended) -> `/session/:id`.
5. "Active" = `start_date <= now <= end_date` and `ended_at` null. Sessions past `end_date` are auto-marked ended lazily on read (`crud/session.finalize_expired_sessions`, called from `/my-sessions`, `/active`, `/next`, `/session/{id}`).

### 3.3 Patient: see and join a live session
1. `/home` shows "Your session is ready" (with therapist name, time, date, "Continue session") if one is active, else the next upcoming session, else "no session scheduled". Also "Free creation" and "My artwork" cards. A `/ws/home` socket refreshes the card when the therapist creates a session (`HomeView.vue:63-75`).
2. "Continue session" -> `/session/:id/patient` (`GenerationView.vue` with a session id). On mount it checks: user is a patient, is the session's patient, and `GET /sessions/active` returns this session; else access-denied dialog. Then opens the WebSocket, loads the galleries, shows a first-time instruction dialog (flag in `localStorage gen_instr_<id>`), and arms a timer that closes modals and shows "session ended" at `end_date` (`GenerationView.vue:238-263`).
3. Patient overlap rule on the server: if the same therapist has an earlier-starting active session, the later patient's `/active` returns 404 (queue-like behaviour, `api/sessions.py:~135-151`).

### 3.4 Real-time sync and chat (WebSocket)
- Endpoint `ws://<api>/ws/{session_id}/{role}?token=<JWT>`; server verifies token, session exists, not ended, and (for `patient`/`therapist`) that the user is that participant, then keeps **one socket per role per session** in an in-memory dict. It relays every received text frame to the other role if connected; there is no persistence of messages.
- Chat: `{event:'chat_message', sender, text}`; plain text is wrapped into the same shape. Patient UI has a slide-in chat panel (hidden after "confirm artwork" -> chat becomes the main panel); therapist has `ChatPanel` next to the latest image. History is kept only in each browser's `localStorage` (`gen_state_<id>` / `tgen_state_<id>`); a message sent while the other side is offline is lost.
- Image sync: patient emits `{event:'submit_image', fileName}` after confirming an image in any modal; therapist maps filename prefix to a URL and shows it as "latest image". `{event:'confirm_artwork', fileName}` marks the final piece (therapist banner; patient switches to final view).
- End: therapist `POST /sessions/end/{id}` -> server sets `ended_at`, sends the literal string `session_ended` to both sockets and closes them. Patient view clears local state and shows an "session ended -> Home" alert; Canvas view does the same.
- Home/Calendar push: `/ws/home?token=` (patient only) receives `{event:'new_session', sessionId}`.

### 3.5 Image generation modes (patient, `GenerationView.vue`, 1578 lines)
The workspace shows the current image (the one submitted to the therapist) and four entry cards (lines ~1280-1315 of the template):

| Mode | UI entry | Frontend call | Backend path | ComfyUI workflow |
|---|---|---|---|---|
| **Text -> image** ("Refine"/describe modal, `RefineModal.vue`) | card 1 | `comfyService.createImage({promptText, seed:null})` | `POST /comfy/users/{id}/images` | txt2img |
| **Image -> image** (`ImagesModal.vue`): tab "upload" (file -> `POST .../images/upload`, then generate) or tab "gallery" (pick existing; options "use without transforming" -> `link` endpoint, or "transform with text") | card 2 | `createImage({promptText, inputImage:<url>})` | same endpoint, `inputImage` set | img2img |
| **Sketch -> image** (`DrawModal.vue`): tab upload sketch, tab **draw** (navigates to `/canvas` or `/session/:id/patient/canvas`, then returns with `?image=<drawn file>`), tab sketch gallery (`DrawnGallery.vue`) | card 3 | `convertirBoceto({sketchImage:<url>, sketchText})` | `POST .../sketch-images/` | sketch2img (ControlNet scribble) |
| **Combine 2/3/4 images** (`GalleryDialog.vue` multi-select + `MultiImageModal.vue`) | card 4 | `generateImageByMultiple({data:[{fileName}], count})` | `POST .../multiple-images/` | twoimgs / threeimgs / fourimgs |

Details:
- "Refine" is really "regenerate from text"; the comment says it keeps the same seed but `seedToUse = null` (GenerationView.vue:540), so every regeneration is random. **[DOC≠CODE]** (`docs/frontend/services.md` and commit messages talk about keeping seeds).
- All modes: show loading, preview in the modal, "Confirm image" -> becomes the main image -> `submit_image` WS event. Confirmed images are stored in `images` with `session_id` when generated inside a session.
- Canvas (`CanvasView.vue`, 473 lines): HTML canvas, colour picker, brush-size slider, eraser, clear, undo (button + Ctrl/Cmd+Z, 50 states), then "Transform" -> uploads PNG via `POST .../images/drawn` -> back to generation with the file name. **Mouse events only** (`@mousedown/@mousemove/@mouseup`, CanvasView.vue:414-417): no touch/pointer events, so it does not work on tablets/styluses.
- Free creation: `/generation` (no session id) runs the same view without WS, chat, access checks or end-timer; images are saved with `session_id = null`. The "final artwork" button only appears with a session (`v-if="sessionId"`).
- Instructions dialog and "session details" dialog (times, therapist) are available in session mode.

### 3.6 Galleries
- **In-workspace picker** (`loadGallery`, GenerationView.vue:801): all of the user's images split by filename prefix into `generated`, `uploaded_image_*`, `uploaded_drawn_*`, `drawn_*` plus 60 server-side **template images** (`GET /comfy/template-images`; files committed under `frontend/src/assets/images/template_images`). Used for image-to-image, multi-image, and (drawn + uploaded sketches) for sketch mode.
- **Session gallery** `/session/:id` (`SessionView.vue`): images of that session; **only `generated*` files are shown** (line 79) - uploaded/drawn images in a session are hidden. Dialog with session info, lightbox-style detail.
- **Free gallery** `/freeimages` (`SessionView.vue` with no id; patient only): `GET /users/users/{id}/free-images`, again generated only.
- **Drawn gallery** `DrawnGallery.vue`: picker for `drawn_*` and `uploaded_drawn_*` sketches inside the sketch modal.
- "My artwork" in the patient nav = `/freeimages`; there is no cross-session "all my artwork" page (the endpoint `GET /comfy/users/{id}/images` returns everything but is only used by the picker).

### 3.7 Ending a session
- Therapist view (`TherapistGenerationView.vue`): "End session" button -> confirm dialog -> `POST /sessions/end/{id}` -> success dialog -> Home. Error dialog on failure.
- Automatic end: when `end_date` passes, both views show "session already ended" via a client `setTimeout`; the server marks `ended_at = end_date` lazily on next read. Server rejects new images (400) and WS connections once `ended_at` is set.
- The patient cannot end a session.

### 3.7b Past sessions
There is no "past sessions" list. Ended sessions appear in the Calendar (no colour class); clicking opens the modal, whose "View artwork" button routes to `/session/:id` (the session gallery). Patients have no calendar link, so in practice they reach past artwork only via the free gallery (not session-scoped) or a direct URL.

---

## 4. Route map

`createWebHistory()` (router/index.js:29); no guards, no `base`, no 404 route. Header is hidden on routes with `meta.hideHeader`.

| Path | View file | Role | Purpose | Main components |
|---|---|---|---|---|
| `/` | `views/WelcomeView.vue` (404 lines) | public | animated welcome, Begin/Skip -> login | `LanguageSelector`, `ui/button` |
| `/login` | `LoginView.vue` | public | login | `LanguageSelector`, ui alert/button/card/input/label |
| `/signup/` | `SignupView.vue` (358) | public | register, pick role | ui select/input/etc, password-requirements list |
| `/home/` | `HomeView.vue` (303) | both | active/next session card; therapist adds sessions; free-creation shortcuts | `CreateSessionModal`, ui card/alert/button |
| `/calendar` | `CalendarView.vue` (753) | both (therapist full, patient read-only; no nav link for patient) | month calendar, create/update/cancel/enter/view | FullCalendar, `CreateSessionModal`, ui dialog/popover/calendar/alert-dialog |
| `/generation/` | `GenerationView.vue` (1578) | patient | **free creation** (no session); with `?demo=1` renders `DemoCreationWorkspace` | `ChatPanel`(session only), `RefineModal`, `ImagesModal`, `DrawModal`, `DrawnGallery`, `GalleryDialog`, `MultiImageModal` |
| `/session/:sessionId/patient` | `GenerationView.vue` | patient (of that session, active) | live session creation workspace + chat | same as above + `ChatPanel` |
| `/session/:sessionId/patient/canvas`, `/canvas/` | `CanvasView.vue` (473) | patient | drawing canvas -> returns to generation with `?image=` | ui slider/textarea/dialog/alert-dialog |
| `/session/:sessionId/therapist` | `TherapistGenerationView.vue` (437) | therapist (of that session, active) | live monitor: latest image, chat, patient info, end session | `ChatPanel`, ui dialog/alert-dialog |
| `/session/:sessionId` | `SessionView.vue` (220) | participant | session artwork gallery (past/ended) | ui dialog/alert-dialog/card |
| `/freeimages/` | `SessionView.vue` | patient | free (out-of-session) gallery | same |

Note: `/session/:id/patient` and `/generation` render the same component, so a hosted demo's `?demo=1` also turns session routes into the demo workspace.

---

## 5. Component map

### 5.1 Non-ui components (`src/components`)
| Component | Lines | What it does |
|---|---|---|
| `Header.vue` | 132 | App shell: sticky header, logo, role-dependent nav (patient: Home / My session `/generation` / My artwork `/freeimages`; therapist: Home / **hard-coded "Calendario"** (line 49)), mobile `Sheet` menu, `LanguageSelector`, `ProfileDropdown`. Loads current user itself. |
| `ProfileDropdown.vue` | 74 | Avatar menu: name/email/role + logout. Role label is always `t('profile.role')` = "Patient" even for therapists (line 63). |
| `LanguageSelector.vue` | 28 | Native `<select>` CA/ES/EN bound to `usePrototypeLocale`. |
| `ChatPanel.vue` | 133 | Presentational chat (messages, input, tone colours, `send` emit); hard-coded Spanish; used by both live views. |
| `CreateSessionModal.vue` | 302 | Therapist dialog: patient combobox, date picker, start/end time, overlap confirm, calls `sessionsService.createSession`. Spanish only. |
| `RefineModal.vue` | 92 | Text-to-image dialog (prompt, Generate, preview, Confirm). |
| `ImagesModal.vue` | 135 | Image-to-image dialog (tabs upload/gallery, prompt, "use without transforming", preview, confirm). |
| `DrawModal.vue` | 166 | Sketch-to-image dialog (tabs: upload sketch, draw -> canvas, sketch gallery). |
| `DrawnGallery.vue` | 95 | Sketch picker (drawn + uploaded sketches). |
| `GalleryDialog.vue` | 110 | Image picker with single or multi-select (2-4) over templates/generated/uploaded. |
| `MultiImageModal.vue` | 245 | Combine-images dialog: shows 2-4 selected images (with upload-more), Generate, preview, confirm. |
| `prototype/DemoCreationWorkspace.vue` | 147 | Mock creation screen for `?demo=1`: prompt -> 800 ms fake loading -> fixed artwork -> save -> demo gallery. Method buttons (image/sketch/combine) are disabled stubs. |

Not components but shared: `lib/useDateHelpers.ts` (UTC/local conversions; exists because SQLite drops time zones), `plugins/axios.js` (401 interceptor), `stores/toastStore.js` (**unused**; the app uses `vue-sonner`).

### 5.2 shadcn/Reka `ui/` primitives
Present (25 folders): alert, alert-dialog, avatar, breadcrumb, button, calendar, card, carousel, command, dialog, dropdown-menu, input, label, native-select, popover, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, tabs, textarea, tooltip.
**Actually imported by app code** (views/components/App, not by other ui files): alert, alert-dialog, avatar, button, calendar, card, command, dialog, dropdown-menu, input, label, popover, select (SignupView only), sheet, slider, sonner, spinner, tabs, textarea.
**Unused scaffolding**: breadcrumb, carousel (and dep `embla-carousel-vue`), native-select, separator, sidebar, skeleton, tooltip.

---

## 6. Backend

Run: `uvicorn app.main:app` from `backend/` (relative paths depend on cwd). No Alembic; `Base.metadata.create_all` at import (`main.py:21`).

### 6.1 REST endpoints (prefixes: `/users`, `/comfy`, `/sessions`)
"Auth" = JWT bearer via `OAuth2PasswordBearer(tokenUrl="/users/login")`. Paths are literally doubled (`/users/users/...`, `/sessions/session/...`, `/sessions/sessions/{id}/images`) because routers repeat the resource name.

| Method | Path | Auth | Purpose / notes |
|---|---|---|---|
| GET | `/` | none | "Hello World" |
| GET | `/users/users/` | **none** | list all users (id, email, name, type) (`api/users.py:18`) |
| GET | `/users/users/me` | JWT | current user |
| GET | `/users/users/{user_id}` | JWT | any user by id (no relationship check) |
| POST | `/users/users/` | none | register (`email`, `full_name`, `password`, `type`); 400 on duplicate/weak password |
| POST | `/users/login/` | none | OAuth2 form (`username`=email) -> `{access_token, token_type}` |
| GET | `/users/users/{user_id}/free-images` | JWT (no ownership check) | images with `session_id` null |
| POST | `/sessions/session/{patient_id}` | JWT, therapist only | create session; 404 patient, 400 dates; pushes WS `new_session` |
| POST | `/sessions/session/{patient_id}/{therapist_id}` | JWT, **no role check** | generic create (`api/sessions.py:22`) |
| PUT | `/sessions/session/{session_id}` | JWT, patient or therapist of session | change start/end |
| GET | `/sessions/my-sessions` | JWT | all own sessions `{data,count}`; auto-ends expired |
| GET | `/sessions/active` | JWT | active session (patient first, then therapist) or 404 |
| GET | `/sessions/next` | JWT | active else next future, or 404 |
| GET | `/sessions/session/{session_id}` | JWT, participant (403) | session |
| POST | `/sessions/end/{session_id}` | JWT, that session's therapist | sets `ended_at`, broadcasts `session_ended` |
| DELETE | `/sessions/session/{session_id}` | JWT, that session's therapist | delete (images keep dangling `session_id`) |
| GET | `/sessions/sessions/{session_id}/images` | JWT, **no participant check** | images of a session |
| POST | `/comfy/users/{user_id}/images?session_id=` | JWT, **no `user_id == current_user` check** | txt2img (or img2img if `inputImage`) |
| POST | `/comfy/users/{user_id}/sketch-images/?session_id=` | same | sketch2img `{sketchImage, sketchText}` |
| POST | `/comfy/users/{user_id}/multiple-images/?session_id=` | same | combine `{data:[{fileName}], count}` (2-4) |
| POST | `/comfy/users/{user_id}/images/upload?isDrawn=` | same | upload (png/jpg/jpeg/webp, <=10 MB) -> `uploaded_image_*` / `uploaded_drawn_*` |
| POST | `/comfy/users/{user_id}/images/drawn` | same | save canvas drawing -> `drawn_*` |
| POST | `/comfy/users/{user_id}/session-images/link?image_file_name=&session_id=` | same | attach an existing file to a session (creates a new `images` row, same file) |
| GET | `/comfy/users/{user_id}/images` | same | all images of the user |
| GET | `/comfy/template-images` | **none** | filenames in `template_images` |
| static | `/images/*` | **none** | serves `../frontend/src/assets/images` (generated, uploaded, drawn, template) |

Responses for generation: `{message, file, fullPath, seed}`; `fullPath` leaks the server's absolute path.

### 6.2 WebSocket
| Endpoint | Direction | Messages |
|---|---|---|
| `/ws/{session_id}/{role}?token=` | both | relay of any JSON/plain text to the opposite role. Frontend-defined events: `chat_message {sender,text}`, `submit_image {fileName}`, `confirm_artwork {fileName}`. Server->client plain strings: `session_ended`. Legacy frontend branch `new_image:<file>` (therapist) never sent by the backend. Close code 1008 on missing/invalid token, unknown session, ended session, or participant mismatch. |
| `/ws/home?token=` | server->client | `{event:'new_session', sessionId}` to the patient created for; any client text is treated as heartbeat. |

Docstring claims "notifications of session state" (ws.py:35) **[DOC≠CODE]** - the server originates only `session_ended` and `new_session`.

### 6.3 Data model (SQLite file `../artTerapia_app.db`, hard-coded in `database.py:21`)
- `users`: `id` PK, `email` unique+index, `full_name`, `hashed_password` (SHA-256 prehash + bcrypt), `is_active` (never checked at login), `created_at`, `type` discriminator (`user|patient|therapist`) - single-table inheritance: `Patient`, `Therapist`.
- `sessions`: `id`, `patient_id` FK users, `therapist_id` FK users, `created_at`, `start_date`, `end_date`, `ended_at` (nullable; null = not ended). Relationships: `patient`, `therapist`, `images`.
- `images`: `id`, `fileName`, `seed` (nullable), `owner_id` FK users (patient), `session_id` FK sessions (nullable). Same file can appear in several rows (link-to-session duplicates the row).
- No tables for chat, no therapist notes, no patient-therapist assignment, no mood/feedback, no audit log. Therapists can schedule with any patient.
- Passwords: >=8 chars, uppercase, digit, special (`crud/user.py:255-277`).

### 6.4 How ComfyUI is called (`services/image_generation.py`)
1. Config from env: `COMFY_UI_URL` (default `http://localhost:8188`), `COMFY_OUTPUT_DIR`, `COMFY_INPUT_DIR` (defaults are the original developer's Windows paths, lines 41-42).
2. Load the API-format workflow JSON, patch node inputs (prompt, seed, image filename, `filename_prefix = "generated<user_id>"`).
3. For image inputs: map the URL path to `frontend/src/assets/<path>` and copy the file into ComfyUI's `input/` folder.
4. `requests.post(<COMFY>/prompt, json={"prompt": workflow}, timeout=300)` -> 503 on failure.
5. **Not** polling ComfyUI's history/WebSocket: a `watchdog` observer watches ComfyUI's `output/` for a new file starting with the prefix (up to 500 s), waits for the size to stabilise, copies it to `frontend/src/assets/images/generated_images/`, returns the name. Everything runs synchronously inside `async def` endpoints (see sec. 9).
6. Seed: random 0..2^63-1 unless the caller gives one (only txt2img/img2img accept `seed`; the UI always sends null).

**Prompt translation**: `generar_imagen` and `convertir_boceto_imagen` run the user's text through the `translate` package (`Translator(from_lang="es", to_lang="en")`, lines 156 and 265), i.e. an **online** machine-translation call (MyMemory by default), assuming Spanish input even though the UI is also Catalan/English. The English text is prepended to the workflow's fixed style prompt. Failure -> uncaught exception -> HTTP 500. Multi-image workflows take no text.

### 6.5 Workflows (`backend/workflows/*.json`, 6 files)
All use checkpoint `juggernautXL_ragnarokBy.safetensors` (SDXL), KSampler `steps 30, cfg 6, sampler dpmpp_2m_sde, scheduler karras`, a 512x512 output, and an `iToolsPromptStyler` node (`style_file basic.yaml`, template "Digital Painting"; custom node pack "iTools") carrying the fixed prompts:
- positive base: `digital painting, expressive illustration, dreamlike atmosphere, emotional, calm mood, gentle details, artistic illustration, concept art style, not photorealistic, stylized`
- negative base: `ugly, photorealistic, hyperrealistic, ultra realistic, real photo, creepy, uncanny, watermark, horror, gore, sexualized, NSFW, epic, anxiety`

| Workflow (node ids patched) | Inputs required | Key parameters | Extra models/custom nodes |
|---|---|---|---|
| **txt2img** - patches `11.text_positive`, `3.seed`, `9.filename_prefix` | translated text, seed | empty latent 512x512, denoise 1 | none beyond iTools |
| **img2img** - `17.text_positive`, `10.image`, `3.seed`, `9.filename_prefix` | text + one image (any: template/generated/uploaded) | image scaled to 512 (lanczos) -> VAEEncode, **denoise 0.6** | none beyond iTools |
| **sketch2img** - `199.text_positive`, `138.image`, `128.seed`, `132.filename_prefix` | text + sketch image | ControlNet (`diffusion_pytorch_model_promax.safetensors`) with `ScribblePreprocessor` (res 1024), strength 0.9, end 0.8; latent 1024x1024 (`FluxResolutionNode`), output downscaled to 512 | comfyui_controlnet_aux (`AIO_Preprocessor`), ControlNet promax, easy-use, rgthree, FluxResolution node. AGENTS.md notes some nodes are missing in the dev setup. |
| **twoimgs2img** - `1.image`, `2.image`, `16.seed`, `17.filename_prefix` | 2 images, **no text** | IPAdapterAdvanced (`ip-adapter-plus_sdxl_vit-h`, CLIP-ViT-H-14), weight 1, `combine_embeds: concat`, each image scaled 512 and batched; empty latent 512 | IPAdapter-plus |
| **threeimgs2img** - image nodes `1, 2, 5` | 3 images, no text | same | same |
| **fourimgs2img** - image nodes `1, 2, 28, 29` | 4 images, no text | same | same |

Backend picks the workflow by `len(images)`; any count other than 2/3/4 leaves `workflow` unbound (500; client limits 2-4). Template workflows ship with example input images that are overwritten at runtime.

**Regression on this branch**: `backend/workflows/sdxl txt2img api workflow.json` is in ComfyUI **UI/graph export format** (`nodes`/`links`, no node `"11"`), not API format. It was rewritten by commit `64e2f37` ("consolidate landing page..."), whereas `main` (and `d574702`) have the correct API format. `generar_imagen` does `workflow["11"]["inputs"]...` (image_generation.py:166) -> `KeyError` -> HTTP 500 for text-to-image (and the UI file also lost the prompt styler node). Restore the file from `main` before any live demo.

---

## 7. Backend-free modes

Two independent mechanisms exist; neither alone gives a coherent demo.

### 7a. `VITE_DEV_PREVIEW_MODE=true` (build-time env)
Files: `lib/devPreviewMode.js` (flag + `withMockDelay`), `lib/devPreviewMocks.js` (24 lines), branches at the top of every method in `api/userService.js`, `sessionsService.js`, `comfyService.js`. Documented in README (Catalan) lines 213-230; not in `frontend/.env.example`.

Mock data: one fixed current user - **a therapist** (`id 1001`) - two patients, and one session (`id 9001`, patient 2001, therapist 1001, starting 30 minutes after page load, ending +90). `login` accepts any credentials and stores `dev-preview-token`.

| Flow | Result in preview mode |
|---|---|
| Welcome -> Login -> Home | works (any credentials) |
| Signup | works (returns a fake user, redirects to login) |
| Home (as therapist) | works: shows "next session" (mock), patient list, create-session modal; creation "succeeds" but nothing is stored, so the list never changes |
| Calendar | shows the single mock event; update/delete/create toasts succeed but state is static; "Enter session" never appears because `getActiveSession` returns `null` |
| Therapist live view `/session/9001/therapist` | **blocked**: active-session check fails -> "access denied" dialog; WebSocket is never opened |
| Patient flows (Home as patient, `/generation`, canvas, session room, free gallery) | **unreachable**: the mock user is a therapist, so `GenerationView`/`CanvasView` show access-denied and `/freeimages` shows the unauthorized dialog |
| Image generation | **breaks even if reachable**: mocks return `{fileName: 'preview-image.png'}` but the views read `response.file`/`response.seed`; `getTemplateImages` returns an array but the views read `.images`; `getImagesForUser`/`getImagesForSession` return empty lists; no real image URLs exist |
| WebSocket | not mocked; views that would open one are blocked beforehand; `HomeView` only opens `/ws/home` for patients. In a hosted build with no backend an attempt would fail silently (`console.warn`) |
| Static `/images/*` | not served (backend serves them) |
| Session-expired dialog | n/a |

Verdict: a "service stub" that lets the shell render for a therapist; it cannot show the patient journey or any artwork. Only 3 of ~10 views are meaningfully exercisable.

### 7b. `?demo=1` query flag (runtime)
Files: `composables/usePrototypeDemo.ts` (12 lines: `isDemo` from `route.query.demo`, `locationWithDemo(path)` that appends the flag), consumed in 10 files. Because the flag lives only in the URL, it is carried only where code calls `locationWithDemo`/`query`; any plain `router.push('/x')` or `<a href>` drops it.

| Flow | Result in `?demo=1` |
|---|---|
| Welcome -> Login | Welcome works. **Login breaks**: `LoginView` never checks `isDemo`; it calls the real `POST /users/login/` and shows an error without a backend (LoginView.vue:50). Same for Signup. Works only when combined with 7a. |
| Header, Profile menu | demo user "Alex" (patient), patient nav; logout returns to `/login?demo=1` |
| `/home?demo=1` | works: fixed patient data, therapist "Marta Soler", session `2026-07-16T14:30Z` (a past date, hard-coded), "Continue session" -> `/generation?demo=1` |
| `/generation?demo=1` (and `/session/:id/patient?demo=1`) | `DemoCreationWorkspace`: prompt -> 800 ms spinner -> one fixed image (`template_images/ComfyUI_00105_.png`) -> "Save" -> gallery. From-image / from-sketch / combine buttons are disabled. No chat, no therapist side, no WebSocket (explicitly skipped, GenerationView.vue:266) |
| `/freeimages?demo=1` and `/session/:id?demo=1` | works: 3 bundled images (imported via Vite, so they ship in the static build) + info dialog |
| `/calendar`, `/canvas`, `/session/:id/therapist` | **not demo-aware**: they call the API; without a backend they fail/redirect. Header in demo mode hides the therapist nav, so the therapist screen is unreachable |
| Language switching | works (all demo screens are translated) |
| WebSocket / ComfyUI | never touched in demo screens |

Verdict: a good, self-contained patient happy path (Home -> Create -> Gallery) but cut off from login and with a hard-coded, stale date and the therapist/calendar side missing.

### 7c. Recommendation: one reliable demo mode for a static hosted build
1. **One switch, build-time, with an in-app fallback**: `VITE_DEMO=true` (replaces both) read once in a single `src/demo/index.ts`; a visible "Demo" ribbon and a way to switch role (Patient/Therapist) on the login screen. Drop `?demo=1` from URLs (no flag propagation, no lost query).
2. **Make the service layer the only seam**: keep the `api/*.js` structure but swap the whole module (`api/index` exports real or `demoApi`) rather than `if (isDevPreviewMode)` on 25 methods. The demo adapter owns a small **stateful in-memory store** (users, sessions, images; persisted to `sessionStorage`) so create/cancel/confirm actually change what the next screen shows, and `login` returns patient or therapist by choice.
3. **Fake the realtime**: a `demoSocket` object with the same `send/onmessage/close` surface backed by `BroadcastChannel` (two tabs: patient + therapist really chat and "submit image") plus a scripted fake therapist reply so a single-tab presenter still sees it. Replace direct `new WebSocket(...)` in 5 files with a `createSessionSocket()` factory.
4. **Generation returns real-looking images**: the mock `createImage/convertirBoceto/generateImageByMultiple` return `{file, seed, message}` pointing at a curated set of bundled images (match the response shape the views read; 60 template images already exist, plus 3 "generated" ones) chosen by keyword or round-robin, after a 1.5-3 s realistic delay. Mock `getTemplateImages` as `{images:[...]}`; make `getImageUrl` use bundled Vite asset URLs instead of `API_URL/images/...` in demo.
5. **Time must be relative**: build demo sessions as now+/-N minutes (past, active, upcoming) so Home/Calendar/session room always show an active session; never hard-code 2026-07-16.
6. **Static-hosting prerequisites**: `createWebHashHistory()` (or host SPA fallback + `base`), switch absolute `/logo_comfymind.svg` etc. to base-relative, make the 401 interceptor use the router rather than `window.location.pathname`, and add a global router guard for roles so the demo cannot land on access-denied dialogs.
7. Fix the canvas to use pointer events so the draw flow can be shown on a tablet.

---

## 8. i18n

- `composables/usePrototypeLocale.ts` (442 lines): module-level `ref` locale (`ca|es|en`, default **es**, persisted to `localStorage['comfymind.prototype.locale']`), sets `document.documentElement.lang`. One flat dictionary per locale (`ca`, `es`, `en`; 131 keys each, full parity, no missing keys) and `t(key, {name: value})` with `{name}` replacement; fallback chain locale -> `es` -> the key itself. No pluralisation, no date/number formatting (HomeView/SessionView do their own via `Intl` with a locale map), not wired to Vue's `provide`/devtools.
- Key groups: `language`, `nav`, `profile`, `global`, `welcome`, `signup`, `login`, `home`, `workspace` (demo only), `gallery`. Unused keys: `nav.help`, `workspace.confirm`.
- **Translated** (use `t()`): `App.vue` (session-expired dialog), `WelcomeView`, `LoginView`, `SignupView` (validation messages use keys), `HomeView` (except 3 strings), `SessionView` (except one dialog button), `Header`, `ProfileDropdown`, `LanguageSelector`, `DemoCreationWorkspace`.
- **Hard-coded Spanish** (zero `t()` calls): `GenerationView` (largest, ~60 lines of copy plus toasts), `CalendarView` (FullCalendar `locale:'es'`, button texts, `DateFormatter('es-ES')`, toasts), `CanvasView`, `TherapistGenerationView`, `CreateSessionModal`, `DrawModal`, `ImagesModal`, `RefineModal`, `MultiImageModal`, `GalleryDialog`, `DrawnGallery`, `ChatPanel`. Specific stragglers in translated files: `HomeView.vue:286-290` (therapist card), `SessionView.vue:216` ("Volver al inicio"), `Header.vue:49` ("Calendario").
- Backend error messages (Spanish) are surfaced verbatim to the UI (`error.response.data.detail`) in all locales; the prompt translator assumes Spanish input.
- `index.html` has `lang="en"` and `<title>frontend</title>` (App.vue overrides the title at runtime to "ComfyMind").
- Catalan appears as hard-coded text only in README and CA dictionary; commit messages are Catalan.

---

## 9. Tech debt and code-quality findings (ranked by impact on the redesign)

### P0 - blocks a reliable demo or the redesign architecture
1. **Giant, unthemed, untranslated functional screens.** `views/GenerationView.vue` is 1578 lines (script lines 1-1039 + template 1041-1578: 5 modals, chat, 4 workflows, WS, gallery, local persistence, session timers). `CalendarView.vue` 753, `CanvasView.vue` 473, `TherapistGenerationView.vue` 437. All hard-coded Spanish, old styling (`bg-slate-300/30`, `green-600`, ad-hoc palettes) next to the new "prototype" screens. This is where the redesign effort concentrates; extract per-mode composables (`useTextToImage`, `useSketchFlow`, `useSessionSocket`, `useGalleryPicker`) before restyling.
2. **Two demo mechanisms, neither complete** (sec. 7); both baked into views (`isDemo` branches in HomeView:41,68,117,135,150, SessionView:90, GenerationView:266/1042, Header:28, ProfileDropdown:23) and 25 service methods. Replace with a service adapter + socket factory.
3. **Routing not static-host ready**: `createWebHistory()` (router/index.js:29), absolute asset paths (`/logo_comfymind.svg` in Header.vue:185,206, `/vite.svg`), no `base` in `vite.config.js`, no 404/redirect route, `window.location.pathname` in `plugins/axios.js:9`. Also `index.html` pulls Nunito from Google Fonts (line 8) while `style.css:120` declares Inter - font mismatch and an external runtime dependency.
4. **txt2img workflow is corrupt on this branch** (sec. 6.5, `backend/workflows/sdxl txt2img api workflow.json`): live text-to-image returns HTTP 500. Restore from `main`.
5. **Blocking I/O in async endpoints**: `async def` handlers in `api/comfy.py:32-114` call `crud.comfy.*` -> `services/image_generation.py` which does `requests.post(timeout=300)` (lines 208/279/511) and a watchdog wait of up to 500 s (`esperar_imagen`, line 110) on the event loop. While anyone generates, the whole API **and every WebSocket (chat) freezes**. Concurrent generations by the same user can also collide on the `generated<id>` filename prefix.

### P1 - correctness / security (must fix before real use; low demo impact)
6. **Authorisation gaps**: `GET /users/users/` returns all users unauthenticated (`api/users.py:18`; the tests depend on this, `tests/test_sessions_ws.py:72`); `POST /sessions/session/{patient_id}/{therapist_id}` (`api/sessions.py:22`) has no role/ownership check - any logged-in user can create sessions between any two users; comfy endpoints never compare `user_id` with `current_user.id` (`api/comfy.py:15-128`), so any user can generate/list/link images as any patient; `GET /sessions/sessions/{id}/images` has no participant check (`api/sessions.py:308`); `PUT /sessions/session/{id}` lets the patient reschedule (`crud/session.py:14`); `GET /users/users/{id}` exposes any user.
7. **WebSocket role bypass**: `role` is a free path segment; only `patient`/`therapist` are validated (`api/ws.py:87-92`). Any authenticated user can connect to any session with `role="x"`, receive the patient's messages (relay target is `"patient"` when `role != "patient"`, ws.py:112) and inject messages. Also JWT travels in the URL query string (logged by proxies), and registry is in-process memory (single worker only; a second tab silently replaces the first socket).
8. **Secrets and config**: `SECRET_KEY` defaults to `"changeme"` (`security.py:26`) and `.env.example` ships the same value; CORS `allow_origins=["*"]` with `allow_credentials=True` (`main.py:38`); JWT in `localStorage` (all `*Service.js`, ~25 places) with no refresh/revocation; `datetime.utcnow()` deprecated; no rate limiting on login/signup; anyone can self-register as therapist; `is_active` never checked.
9. **File handling**: `urlparse(input_img).path` is joined onto `frontend/src/assets/` without normalisation (`image_generation.py:177,245,483`) - `..` segments can copy arbitrary files into ComfyUI's input folder (path traversal); multi-image `fileName` also used verbatim as destination name (line 495); `drawn_*` files are not mapped in the multi-image resolver (falls through to `template_images`, lines 485-490) and `TherapistGenerationView.vue:70-77` has the same gap (drawn/unknown -> `template_images`); generated/uploaded user art is written **inside the frontend source tree** (`frontend/src/assets/images/*`, `image_generation.py:45-48`, `main.py:30`) and served from the same folder; `fullPath` in responses reveals server paths.
10. **Hard-coded environment**: Windows paths for developer "diana" as defaults (`image_generation.py:41-42`, `.env.example:12-13`, `start_backend.ps1:2`), `http://localhost:8000` fallback repeated in 9 frontend files (`comfyService.js:11`, `sessionsService.js:11`, `userService.js:11`, `CalendarView.vue:194`, `CanvasView.vue:28`, `GenerationView.vue:53`, `HomeView.vue:15`, `SessionView.vue:41`, `TherapistGenerationView.vue:31`), SQLite path relative to cwd (`database.py:21`), `vite.config.js` proxy `/api` is configured but never used (all calls go straight to `API_URL`).

### P2 - duplication, dead code, hygiene
11. **Duplicated logic**: session-end watcher copy-pasted in 3 views (Generation 238-263, Therapist, Canvas with a slightly different date parser); WS connect/reconnect code in 5 files with no reconnect/backoff; image URL-by-prefix mapping in GenerationView:843, SessionView:61, TherapistGenerationView:70; overlap-check + confirm dialog duplicated in `CalendarView.vue` and `CreateSessionModal.vue`; "validate session belongs to user and not ended" block repeated 4x in `crud/comfy.py` (lines 14-22, 47-55, 156-164, 190-197); `generar_imagen`, `convertir_boceto_imagen`, `generate_image_by_mult_images` share ~30 identical lines (post, wait, response); `get_images_for_user` is defined twice (`crud/comfy.py:124,140`); `publicar_imagen`/`publicar_dibujo` near-identical; four near-identical modal components.
12. **Dead/unused code**: `stores/toastStore.js` (never imported); `pinia` dependency and "Estado: Pinia" in docs while no store exists **[DOC≠CODE]**; `embla-carousel-vue` + 7 unused `ui/` folders; `@internationalized/date` imported (`useDateHelpers.ts:2`, CalendarView, CreateSessionModal) but absent from `package.json` (works only as a transitive dep of reka-ui); `schemas.UserLogin`, `ImageGenerationError`, `UploadedFile`; unused imports (`fileinput.filename` at `image_generation.py:19`, `HttpUrl, re, Optional` in `main.py:12-14`, large commented block in `App.vue:74-111`); `db_user = crud.user.get_user(...)` result unused in comfy endpoints (it only acts as a 404 check); therapist-branch in session checks is dead since therapists cannot own images; `new_image:` WS branch; root `fill_bd.ps1`+`backend/fill_bd_testing.py` docstring says `seed.py`.
13. **Mixed JS/TS and typing**: `main.js`, `router/index.js`, `api/*.js`, `plugins/axios.js`, `stores/*.js` are JS while views are `<script setup lang="ts">` with pervasive `any` and untyped `ref(null)`; `tsconfig` present but no `vue-tsc` in scripts; ESLint config exists but no `lint` script; `package.json` has only `dev/build/preview`.
14. **Pydantic v1 idioms** (`class Config: orm_mode`) with Pydantic >=2 (`schemas/session.py:23`, `schemas/user.py`) - deprecation warnings; `declarative_base` from `sqlalchemy.ext` (deprecated); no migrations; datetimes stored UTC-naive in SQLite so the frontend re-adds `Z` (`useDateHelpers.ensureUTCString`).
15. **Accessibility defects in legacy screens** (relevant to MS users): canvas is mouse-only (CanvasView.vue:414-417; no touch/pointer/keyboard); header profile role always "Patient" (ProfileDropdown.vue:63); patient has no nav link to Calendar (Header.vue:47-49); heavy reliance on colour classes for state (calendar events, chat bubbles).
16. **UX/logic oddities**: session gallery hides non-`generated` images (SessionView.vue:79,86); "refine" does not keep the seed (GenerationView.vue:540); no past-sessions list; no overlap validation server-side; deleting a session leaves orphan image rows; `mock` preview user is a therapist so patient UI can't be previewed.

### Test coverage
- **Backend**: `backend/tests` (pytest, in-memory SQLite via `StaticPool`, `TestClient`): `test_users.py` (4 tests: register/login/me, list/get, wrong password, duplicate), `test_sessions_ws.py` (11: session CRUD, role/participant 403s, WS token errors, chat JSON/plain text, other-side offline), `test_comfy.py` (21: all generation endpoints with `services.image_generation.*` **monkey-patched**, upload validation, therapist 403, seed persistence). Not covered: any real workflow patching (so the corrupt txt2img JSON is invisible), file/path handling, ComfyUI watcher, translation, `/sessions/active|next` queue logic, `finalize_expired_sessions`, `/ws/home`, link-to-session, auth gaps in sec. 9. No coverage measurement.
- **CI**: `.github/workflows/tests.yml` runs `pytest -q` in `backend/` on push/PR to any branch (Python 3.11.3, installs `requirements.txt` which also pulls mkdocs). Action versions `checkout@v3`, `setup-python@v4`. Heavy-ish: installs docs deps. No frontend job (no lint, type-check, build or tests), no mkdocs build.
- **Frontend**: zero tests, no test runner configured. `vite build` is the only check (per PLAN, currently passes).
- **Docs**: mkdocs (Spanish, mkdocstrings) generates API reference from Google-style docstrings (good), but `docs/frontend/componentes.md` and `vistas.md` are 5-line stubs and `services.md` has inaccuracies.

### Doc vs code disagreements (collected)
- `docs/index.md`: "SQLite (dev) / PostgreSQL (prod)" - code is SQLite-only with a hard-coded URL; "State: Pinia" - Pinia is not used.
- `docs/frontend/services.md`: `convertirBoceto` described as "img2img" - it is sketch2img (ControlNet scribble); img2img goes through `createImage` with `inputImage`. `getTemplateImages` is documented as a list; backend returns `{images:[...]}`.
- `docs/backend` pages are mkdocstrings stubs; `ws.py` docstring promises "session-state notifications" the server never sends; `main.py` root endpoint docs fine but the app title says "App ArtTerapia".
- README: install steps use `passlib` and a folder named `TFG_ArtTerapiaApp - copia`; code uses `bcrypt` directly (passlib is dead weight in `requirements.txt`); README documents `VITE_DEV_PREVIEW_MODE` but not `?demo=1`; "DB created in root" is true only if uvicorn is started from `backend/`.
- `AGENTS.md` says generation "does not need to work" and the dev setup lacks ComfyUI nodes - consistent with the prototype, but contradicts the app being demoed as functional.
- `backend/fill_bd_testing.py` header says `python seed.py`.
- Code comments vs behaviour: "keep the same seed" (GenerationView.vue:539) vs `seedToUse = null`.

---

## 10. Open questions for the product owner

1. **Meeting scope**: is a live generation ever going to be shown (needs a GPU box with ComfyUI + custom nodes + models), or is the hosted demo strictly canned images? Which of the four creation modes must appear in the demo (the current demo workspace only simulates text-to-image)?
2. **Who is the demo audience's persona?** Do you want to click through as patient only, therapist only, or switch both in one sitting (the real product needs two people/tabs for the live room)?
3. **Therapist value**: today a therapist only watches the latest submitted image and chats; there are no notes, history timeline, per-patient overview, or export. Is that intended for the redesign, or should the therapist screen be a richer dashboard (patients list, past sessions, artwork review)?
4. **Patient-therapist relationship**: can any therapist schedule any patient? Should a patient be linked to specific therapists, or invited by code? Should signup allow choosing "therapist" freely?
5. **Past sessions**: should patients and therapists get an explicit "past sessions" list with artwork per session? (Today only reachable via calendar/direct URL, and the session gallery hides uploaded/drawn images.)
6. **Chat persistence & privacy**: chat/images submitted to the therapist are not stored server-side. Is that deliberate (privacy) or a gap? What are the data-protection requirements for health-related art (GDPR, retention, deletion)?
7. **Languages**: default UI language is Spanish; Catalan and English exist for the new screens only. Is full ES/CA/EN coverage required for the legacy screens (calendar, generation, canvas, therapist) in this iteration? Should typed prompts be accepted in Catalan/English (the translator assumes Spanish)?
8. **Prompt model**: the fixed style prompt ("digital painting... calm mood") and negative prompt ("anxiety", "epic"...) are clinical-feeling choices baked into the workflows. Who owns them? Should styles be selectable per session/therapist, or hidden from the patient as now? Is multi-image blending (no text) meant to have a text prompt too?
9. **Image sizes & time**: output is 512x512 and takes an unknown time on the target hardware; is a "wait" UX of ~10-60 s acceptable, and should there be cancellation or a queue indicator?
10. **Accessibility target**: tablets and styluses are likely for MS patients (tremor, fatigue). Is touch/pointer drawing and larger hit areas a must for the canvas, and is a formal WCAG level (AA?) the goal beyond `docs/ACCESSIBILITY_REQUIREMENTS_DRAFT.md`?
11. **Session timing**: should the therapist be allowed to join before the patient, extend a session, or schedule overlapping sessions (server currently allows overlap; client only warns)? What time zone model is intended (UTC-naive in DB today)?
12. **Roadmap items in `PLAN.md` ("chatbot, etc.")**: what is the chatbot's role (patient companion, therapist assistant) and does it need any data this inventory shows is missing (e.g. stored chat, emotions, session notes)?
13. **Hosting**: will the hosted demo live at a sub-path (`/ComfyMind/`) or a root domain, and must it work offline/without Google Fonts (current `index.html` loads Nunito remotely)?
14. **Repo hygiene**: may the generated/uploaded image folders be moved out of `frontend/src/assets/images` and the Windows-specific defaults removed from the shared repo (clean-repo goal D4)? Is it OK to ship the 60 template images and the three bundled "demo" artworks publicly?
