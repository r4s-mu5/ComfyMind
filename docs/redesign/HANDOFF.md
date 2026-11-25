# Handoff: ComfyMind redesign (start here in a new session)

**Last updated:** 2026-11-25 09:15 (Madrid). Branch `claude/art-therapy-gui-redesign-8c2ik9` on `r4s-mu5/ComfyMind`, pushed.

Read in this order: this file → `PLAN.md` (decisions D1–D13, status, log) → `DESIGN.md` (the spec) → `VIBECHECK.md` (mandatory rule) → the latest review, `reviews/VC3_FINAL.md`.

## Where things are

| What | Where |
|---|---|
| Hosted demo (v3, backend-free) | https://claude.ai/artifact/1JnhnL9FhtVgXJHqCHmLdx |
| Meeting brief (editable doc) | https://claude.ai/artifact/9AhJMojAZ6ZGE9FBKMxAbX |
| 3D sanctuary prototype | https://claude.ai/artifact/2efWmyWRY4mnQnYfQTuoog (shows v2 of the scene; the app has the newer generator) |
| Visual direction board / type specimen | https://claude.ai/artifact/CPY4K8H1nrjrqshtdf8S8p · https://claude.ai/artifact/N7sHLPNswVTVgihCCdzFaN |
| Design spec | `docs/redesign/DESIGN.md` |
| Discovery reports | `docs/redesign/01_APP_INVENTORY.md` … `06_TYPOGRAPHY.md`, `05_INTERVIEW.md` (all owner answers) |
| Reviews | `docs/redesign/reviews/VC1_FOUNDATION.md`, `VC2_SCREENS.md`, `VC3_FINAL.md` |
| Demo mode | `docs/redesign/DEMO_MODE.md`; `cd frontend && npm run dev -- --mode demo` |
| Components and tokens | `frontend/src/components/sanctuary/` (+ README), `frontend/src/style.css`, `/design` route |
| 3D scene module | `frontend/src/components/sanctuary/scene/sanctuaryScene.js` (procedural, no models) |

All artifacts are private until shared from their Share menu.

## State at handoff

- **Done:** discovery, interview, design spec, foundation and components, the demo engine, every meeting-scope screen (landing, login, home, Taller, waiting, result, reflection, Mis obras, therapist live session, session end), three vibecheck rounds with fixes, and the hosted demo.
- **VC3 verdict:** "does not look vibecoded" overall. Three corners are still "somewhat": the way-in cards, the session-end card, and the therapist calendar plus its "ended" modal.
- **Interrupted at the usage limit, partly applied (they build cleanly and the landing and Taller were checked visually):**
  - **L2 (sculpture variety):** new form families are in (e.g. a soft pebble on a block), and "Otra escultura" sits under the museum label. To finish: confirm on a contact sheet of about 40 seeds that the drilled hole is gone and that nothing reads as a bird, animal or face; re-copy the module into `docs/redesign/liminal/scene/` and republish the prototype.
  - **F3 (VC3 must-fixes):** fixed: the Taller panel opens at its top, and Dibujo's paper is visible. **Verify or finish each remaining VC3 must-fix in `reviews/VC3_FINAL.md`:** "Volver al inicio" always visible at session end; dusk scrim at 97%; therapist "ended" wording; login lede order; the way-in redesign ("doorways"); the session-end layout; the calendar and modal tone-down; the full ES rehearsal from a fresh browser profile.

## How to work (lessons from this session)

- **Autosave:** containers restart and wipe uncommitted work. Start `nohup setsid tools/autosave.sh >/dev/null 2>&1 </dev/null &` at the beginning of a session (it commits and pushes every 3 minutes). Update its `Claude-Session` trailer first.
- **Workers:** give each one exclusive files; shared files (`usePrototypeLocale.ts`, `style.css`, `router`) get small exact edits only. Each builds into its own `--outDir`, never `dist/`.
- **Hosted demo:** `python3 tools/build-artifact.py` builds to `/tmp/comfymind-artifact/artifact-dist`. Publish `index.html` there with the listed files to the SAME artifact URL. Pass `null` for files from the previous version, because files left out stay. The host does not serve `.glb`, which is why the 3D is procedural.
- **Checking in the real viewer:** the artifact-emulator skill. Its headless browser reports no fine pointer, so the landing falls back to the poster, which is expected. Check "Otra escultura" with local Playwright instead.
- **Hard rules** (DESIGN.md §1, §8, VIBECHECK.md): no human or figurative shapes anywhere; never "paciente / pacient / patient" in visible text; demo images abstract only; scene camera never moves; 56px targets, 18px body, no auto-dismiss.

## Suggested next steps (after the meeting)

1. Record the meeting's decisions in `PLAN.md` and update the open questions in DESIGN.md §11 and the brief.
2. Finish the F3 and L2 items above, then run a fresh vibecheck (VC4).
3. Share the clean repository with the TFG students. The branch history is clean; create an empty repository and push the branch as its `main`.
4. Redesign the calendar and signup with the sanctuary components.
5. Backend backlog (`01_APP_INVENTORY.md` §9): security, non-blocking generation, prompt translation for CA and EN.
