# Liminal Sanctuary: prototype notes (L1)

`index.html` is a standalone prototype of the landing hero. It shows an empty colonnade at dusk with a pastel sky and a sculpture fragment on a plinth.
Three intensity presets let the owner feel how far to push the idea. The landing copy is real (ES, CA and EN) and sits on a scrim.

## The three presets

| | Quiet | Dreaming | Liminal |
|---|---|---|---|
| Feeling | The sanctuary first | Soft vaporwave | Empty, faintly uncanny (de Chirico) |
| Sky | Indigo to lilac to rose, small soft sun | More saturated violet, lilac and peach; a large sun with yellow-to-pink gradient and soft horizontal gaps | Slate to dusty mauve, a dim sun low on the left |
| Architecture | 2 × 6 columns with beams | 2 × 7 columns | 16 columns on the left, an arcade wall on the right, a fallen drum, a lit doorway far down the nave |
| Floor | Matte | Mirror (Reflector at half resolution) under a 58 % tint | Matte, with long shadows from a side light |
| Fragment | Venus de Milo head | Venus, plus a floating Apollo head and two floating drums | Apollo Belvedere head, off-centre |
| Motion amount (×) | 0.35 | 1.0 | 0.6 |
| Triangles | ≈ 30k | ≈ 42k | ≈ 29k |

All three stay under the 60k budget. The `renderer.info` count for Dreaming is about twice that, because the mirror renders the scene again.

## Motion rules as built

- **Default:** on, unless `prefers-reduced-motion: reduce` is set; then it is off and the canvas renders **once** (0 frames per second afterwards).
  The visible "Motion" toggle overrides the OS setting, and the choice is remembered (localStorage, try/catch).
- **Idle drift:** the camera moves at most 5 cm and 2.5 cm on sine waves with periods of 30–37 s. The fragment turns ±1.5° over about 48 s. Floaters bob 5 cm.
- **Pointer:** mouse and pen only, never touch. The camera leans at most about 1.2° of view, and the fragment turns at most 3° (yaw) and 2° (pitch). The easing takes about 1.2 s.
- **Tap or click** on the scene (outside the panel and controls): the fragment turns to face the viewer over 3.6 s with a sine ease. Tap again and it returns to rest.
  The tap does nothing when Motion is off. It is decorative and never needed to operate the page.
- Rendering is capped at about 30 fps, which is plenty for movement this slow. It stops entirely when nothing moves, when the tab is hidden or when 3D is off.
- Nothing flashes, there are no glitch, scan-line or VHS effects, and there is no zoom or dolly. A preset change swaps the scene in one frame, with no animated transition.
  The canvas fades in once, over 0.2 s, on first load, and not at all under reduced motion.

## Robustness

- devicePixelRatio is capped at 1.5. If frames stay above 50 ms, the page drops to 1× on its own.
- WebGL missing, or the context lost: the poster stays and a plain message appears inside the panel ("3D isn't available on this device…").
- The poster `<picture>` (landscape or portrait JPG for each preset) is visible from the first paint and hides only once the first 3D frame is ready. A slow CDN therefore never shows a blank page.
- "3D: off" hides the canvas (`display:none`), stops the loop and shows the poster of the current preset.
- No horizontal scroll at 390, 768 or 1440 (checked).

## Accessibility safeguards

- **Contrast** (computed). The text panel is `rgba(24,25,46,.88)`. Even over pure white, its composite gives: headline and body `#F4F3F7` **10.9:1**, secondary `#D8DAE6` **8.6:1**, link `#A9DCD6` **8.0:1**, focus ring **9.6:1**, button text on `#F0D5BF` **12.1:1**.
  Over the real sky, every value is higher. Every piece of text sits on a scrim, and none sits directly on the scene.
- **Targets:** primary button 56 px tall, language buttons 44×52 px, links 48 px tall, prototype controls 44 px. `touch-action: manipulation` is set everywhere.
- **Focus:** a 3 px `#FFE3A3` outline with a 2 px dark gap ring, so it reads on the peach button as well as on the dark panel.
- **Language:** `<html lang>` and the panel's `lang` follow the ES / CA / EN switch. The buttons carry full language names as `aria-label` and `aria-pressed`.
- **Diplopia and vertigo:** one focal object per screen. Text never moves. The parallax is tiny and mouse-only. There are no fine repeating patterns behind text.
  The sun bands are only five soft gaps, and only in Dreaming. The prototype dock is visually separate (dashed outline, labelled "Prototype").
- The canvas is `aria-hidden`. The page is complete as a still image.
- **Caveat for "Liminal":** the long repeating colonnade is a repeating pattern at the periphery. It is meant to be the most stimulating option, so test it with users before choosing it as the default.

## Turning it into a Vue component

```vue
<!-- WelcomeView.vue -->
<SanctuaryScene :preset="comfort.scenePreset" :motion="comfort.motion" :enabled="comfort.scene3d" class="absolute inset-0" />
```

- **`src/components/sanctuary/SanctuaryScene.vue`**: a thin wrapper. It renders the `<picture>` poster immediately, then `defineAsyncComponent` / dynamic `import('./sanctuaryEngine')` only when `enabled && hasWebGL()`.
  three.js then stays out of the main bundle (roughly 150–200 KB gzip with the loaders; measure it), and the login and app routes never pay for it.
- **`sanctuaryEngine.ts`**: the scene code from this file, almost unchanged, exposing `mount(canvas, opts)`, `setPreset`, `setMotion`, `snapshot` and `dispose`.
  Pointer and visibility listeners live inside the engine, not as Vue reactive state (no re-render per pointer event, as the Welcome brief asks).
  `onBeforeUnmount` calls `dispose()` (geometries, materials, render targets, `renderer.forceContextLoss()`).
- **Assets:** `src/assets/sanctuary/*.glb` and the posters via Vite `?url` imports, or `public/sanctuary/`. Self-host three instead of the CDN (`npm i three@0.160`).
  Self-host the fonts with Fontsource: research §4 notes patient IP addresses and GDPR.
- **Comfort panel:** add "Background: Still image / Moving scene / Off (plain)" plus the existing "Reduce motion". Store both per user in Pinia and persist them.
  The default for patients is `motion = !prefersReducedMotion` and preset `quiet`. Never default to `liminal`.
- **Props:** `preset: 'quiet' | 'dreaming' | 'liminal'`, `motion: boolean`, `enabled: boolean`, `fragment?: 'venus' | 'apollo'`, `framing?: 'hero-right' | 'centre' | 'top'` (for reuse below).
- Keep the poster JPGs in the repo as the no-JS / no-WebGL / 3D-off fallback, and regenerate them with `snapshot()` whenever the scene changes.

## Where else it could appear (dusk screens)

| Screen | How |
|---|---|
| **Login / session code** | The same scene in `quiet`, still image by default (the poster), with the form on the same scrim. The fragment framed `top` so the keypad has room. |
| **Generation waiting state** | The fragment slowly turns to face you over the full wait, once, then rests. This replaces a spinner and is a progress cue without numbers. Under reduced motion: the poster plus a text line "Creating your image…". |
| **Session end / goodbye** | The doorway from `liminal`, warm and lit, framed centrally, with "See you next time". This is the only place the doorway carries meaning: a calm exit. |
| **Empty gallery** | An empty plinth (no fragment) and the line "Your first piece will stand here." It is a gentle invitation, and the absence reads as space, not as failure. |
| **Therapist screens** | No 3D. Only the palette and the column motif in the header. |

## How the dawn (light) working screens can echo it without 3D

- **Column motif:** a thin fluted-column divider (an SVG of 3–4 vertical strokes with a capital) as a section separator, or a column silhouette at 4–6 % opacity at the edge of the patient home. Never behind text.
- **Sun disc:** a flat soft-peach circle as the "Create" card's accent, with the same `#F0D5BF`. In dawn it sits *above* the horizon (morning), echoing the dusk sun below it.
- **Marble-white mats for artwork:** the patient's images sit on an off-white "mat" `#F6F2EE` with a 1 px warm line and generous margins, as if on a plinth.
  Artwork labels in Tenor Sans caps, like museum labels (DESIGN.md). This keeps "the patient's work is the only strong colour" from the research.
- **Plinth cards:** cards with a slightly heavier bottom edge (a 4 px darker band), so items "stand" rather than float.
- **Palette continuity:** dusk lilac `#C9BFEA` and peach `#F0D5BF` become dawn tints (`#EEEAF8`, `#FBEFE5`) for selected and hover states.
- **Fragments as illustrations:** the posters, or one still render of a head on a plinth (for example the empty-state art), used as static images on light screens, so there is no WebGL in the working app.

## Open points for the owner

1. Pick an intensity. My recommendation: **Quiet** as the default landing, with **Dreaming** behind the Comfort panel as "a more playful sky". **Liminal** would be a striking session-end screen, but it is the most unsettling as a front door.
2. Which fragment: Venus (soft, calm and famously a "fragment") or Apollo (more dramatic). Both are public domain, from SMK casts.
3. Type: the display and wordmark already use **Tenor Sans** caps, following DESIGN.md D8. The body is still **Atkinson Hyperlegible**, as the brief asked, but D8 picked **Readex Pro**, and T1 found that Atkinson lacks `Ŀ ŀ`.
   Switching to Readex Pro is one change to `--font-body` plus the Google Fonts URL. The product should self-host both fonts (DESIGN.md).
