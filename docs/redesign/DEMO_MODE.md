# Demo mode (backend-free)

One switch makes the whole app run without FastAPI or ComfyUI, from a static host.

## Switch
Demo is ON when any of these is true (`frontend/src/lib/demo/isDemo.js`):
- `VITE_DEMO=true` at build time (used by `npm run build:demo`, via `frontend/.env.demo`)
- `VITE_DEV_PREVIEW_MODE=true` (legacy alias)
- `?demo=1` in the URL (also `#/route?demo=1`); remembered in sessionStorage for that tab

`usePrototypeDemo().isDemo` reads the same flag, so it is global and no longer lost on `router.push`.

## Run / build
```
cd frontend
VITE_DEMO=true npm run dev          # dev server in demo mode (or open any URL with ?demo=1)
npm run build:demo                  # static build in dist/ (base './', hash routing)
npx vite preview --mode demo --port 5198
```
`dist/` can be hosted in any folder of any static host (no server rewrites needed: hash routing, relative asset URLs).
A normal `npx vite build` is unchanged (history routing, real API).

## Personas
- Login screen shows "Entrar como paciente (Alex)" / "Entrar como terapeuta (Marta)" in demo mode.
- Typing credentials also works: an email containing `terap`, `therap` or `marta` logs in as therapist Marta Soler, anything else as patient Alex. Signup succeeds and logs the new user in (type chosen in the form).
- Data (relative to now, in `lib/demo/store.js`): live session 101 (started 10 min ago, ends in 50), later today 102, tomorrow 107, past sessions 103-106 with images, a second patient (Jordi Puig) with sessions for the therapist calendar, free-gallery images and two drawn sketches.

## What is simulated
- `userService`, `sessionsService`, `comfyService` call `lib/demo/store.js` (stateful, same response shapes as the backend: `{message,file,fullPath,seed}`, `{data,count}`, `{images:[...]}` for templates, etc.). State lives in sessionStorage (per tab, survives reload; reseeded after 45 min so "live" stays live).
- Generation (txt2img, img2img, sketch2img, multi 2/3/4, refine): 2.5-4 s delay, image picked by hashing the prompt (same prompt gives the same first image; regenerating the same prompt cycles to the next image). Result is added to the session or free gallery. `lib/demo/progress.js` exposes a reactive `demoProgress` for a calm waiting state.
- Images: 14 resized JPEG copies of `template_images` in `lib/demo/images/` (12 artworks + 2 line-art sketches), imported through Vite. `imageUrl(folder, file)` in `lib/config.js` resolves any file name; the URL ends in `#/<fileName>` so views doing `url.split('/').pop()` still work. Uploads and canvas drawings use object URLs.
- WebSockets: `createSocket()` (`lib/config.js`) returns `FakeSocket` (`lib/demo/fakeSocket.js`): same surface (`onopen/onmessage/onclose/send/close/readyState`), backed by BroadcastChannel, so a patient tab and a therapist tab chat and share submitted images live; `session_ended` and `new_session` are delivered too. With only one tab open, scripted counterparts keep it alive: "Marta" greets and answers chat / submitted images with open supportive questions after 3-5 s (ES/CA/EN following the UI language); a lone therapist tab gets a scripted "Alex" message and image submission.
- Router: hash history in demo mode; guard sends users without a demo login to `/login`. 401 interceptor reads the hash path. Canvas uses Pointer Events (touch/stylus).
- Config: API/WS URLs, image URLs and sockets are centralised in `src/lib/config.js` (non-demo behaviour unchanged).
- Reflection notes and "kept" marks (B2): `state.notes` in `lib/demo/store.js`, one entry per image file name: `{ fileName, text, kept, ownerId, sessionId, updatedAt }`, broadcast to other tabs with the rest of the state. Use the service, not the store: `notesService` in `src/api/notesService.js`:
  - `saveNote(fileName, text, { userId, sessionId })`: the ReflectionPrompt note
  - `keepArtwork(fileName, { userId, sessionId })`: set by "Guardar en mis obras"
  - `getNote(fileName)`, `getNotesForUser(userId)`, `getNotesForSession(sessionId)`: for the gallery detail and the therapist view
  - Real backend: CONCEPT, kept in this browser's `localStorage` (`comfymind.notes.v1`) until the API has a notes endpoint. (Store-level functions: `demoNotes.*` with the same names.)

## Verified (Playwright against `build:demo` + `vite preview`)
- Landing, login as patient (role button), home shows live session, join session, text-to-image (about 4 s wait), confirm/submit, gallery picker with 12 templates, free gallery, past session gallery.
- Second tab as therapist: home, calendar (all sessions), live session shows the patient's submitted image and chat in real time; therapist chat reaches the patient; end session shows the success dialog.
- Lone patient tab: scripted greeting from Marta; lone therapist tab: scripted Alex chat and image; reload keeps login and route; canvas drawing works; `?demo=1` alias on a normal build; normal `vite build` compiles. No console errors in any flow.

## Known limits
- Each tab has its own state (sessionStorage); the second tab only learns about changes (new/ended/deleted sessions, images) via broadcast after both are open. Tabs must each log in.
- Object URLs (uploads, drawings) do not survive reload and are not visible in the other tab (fallback picture is shown).
- Sketch-to-image and 2/3/4-image combine were exercised through the same generator but not clicked through end to end; patients cannot see their own scripted-chat unless the chat panel is open.
- Old prototype stub (`DemoCreationWorkspace.vue`) is no longer used. Backend tests were not run (fastapi not installed here; backend untouched).
- The `#/` fragment trick on image URLs is demo-only; views that need the plain file name from a URL must keep using `split('/').pop()`.
