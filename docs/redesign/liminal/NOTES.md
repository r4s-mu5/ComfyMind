# Liminal Sanctuary: prototype notes (L2)

`index.html` is a standalone prototype of the landing hero: an empty colonnade at dusk, a pastel sky, light fog and
**one abstract object** on a plinth, seen through a low-resolution, dithered "pixel" pass. The landing copy is real
(ES, CA, EN) and sits on a scrim. The scene code is `scene/sanctuaryScene.js`, a copy of the app module
`frontend/src/components/sanctuary/scene/sanctuaryScene.js` (the source of truth).

The mood is the approved **Quiet** preset from L1 (pastel dusk, light fog, 2 × 6 columns, near-still).
The Dreaming and Liminal presets and the classical heads are gone: the owner ruled out human or figurative forms,
and generated artworks will be abstract, so the scene now speaks about *making* (architecture, carving, geometry).

## The three objects (dock: "Object")

| | Ruina | Escultura abstracta (default) | Estudio |
|---|---|---|---|
| What | An Ionic capital with spiral volutes on the plinth; two broken fluted drums on the floor | A twisted, open cradle form drilled through once, carved out of a still-rough block ("non finito") | The sculptor's study: Dürer's solid (from *Melencolia I*), a sphere and a ring on three plinths of different heights |
| Tap | Turns slowly by 90° (4.6 s, eased) | Turns slowly by 90° | The key light moves round (3 positions) and the solid and ring turn 60° |
| Object triangles | ≈ 14.7k | ≈ 20.0k | ≈ 3.6k |
| Scene triangles | ≈ 24.6k | ≈ 29.8k | ≈ 13.5k |

The architecture (instanced columns, beams, floor) is about 9.9k triangles. No shadow maps, no mirror floor, no models.

### Vibecheck (VIBECHECK.md): first idea → flags → what we did instead

- **Escultura:** first idea, a smooth glossy pebble with two holes → flags: "stock 3D blob", glossy orb, and two holes read as eyes (figurative) →
  instead, matte marble, one drilled opening, an open asymmetric cradle with a twist, and a hewn block left rough underneath (the carving process is visible).
- **Ruina:** first idea, a capital with an egg-and-dart moulding → flags: at low resolution the eggs read as a row of teeth (figurative) →
  instead, a plain ovolo echinus; the volutes carry the detail, and the drums lie further back so the group reads as a quiet ruin.
- **Estudio:** first idea, a polished chrome sphere with a glossy torus → flags: gradient orb / glossy blob, generic 3D-render still life →
  instead, honed (satin) marble, a faceted Dürer solid as the focus, and a tap that moves the *light*, as in a drawing class.

## Post-FX (dock: "FX")

One custom fullscreen pass (no EffectComposer): the scene renders into a half-float target at reduced size and is upscaled
with NEAREST filtering in whole device-pixel blocks, so the pixels are crisp and evenly sized. HTML text is never affected.

| Control | Options | Default |
|---|---|---|
| FX | on / off ("off" is the clean render with 4× MSAA) | **on** |
| Pixel size | 1/2, 1/3, 1/4 of CSS resolution | **1/3** |
| Dither | off / light / strong (4×4 Bayer, quantising each channel to about 25 or 13 levels) | **light** |
| Film grain | on / off; **static** (a fixed hash per pixel, never refreshed) | **on** |
| Vignette | on / off; soft | off |

- **Stable pixel grid:** the camera never translates. Its lean and idle drift are rotations snapped to whole low-res pixels,
  so the background moves in single, rare steps and nothing shimmers.
- Grain and dither are computed per low-res pixel, so they form part of the pixel art rather than a screen-door overlay.
- The sky writes alpha 0, so the output pass skips tone mapping for it and keeps the exact pastel colours.

## Motion rules as built

- Motion follows `prefers-reduced-motion` unless the dock toggle overrides it (remembered in localStorage, try/catch).
  Motion off: the canvas renders still frames only, on change or resize.
- Idle: the camera drifts at most ±0.1° and the object "breathes" ±0.4° over about 48 s. Pointer (mouse and pen only, never touch):
  the camera leans ≤ 0.55°, the object ≤ 3° (yaw) and ≤ 1.5° (pitch), eased over about 1.2 s.
- About 30 fps while something moves; no frames when still or when the tab is hidden. DPR capped at 1.5, dropping to 1 if frames stay slow.
- Nothing flashes, no glitch, scan lines or VHS. The grain is static. Object changes swap in one frame.

## Module API (used by `SanctuaryScene.vue`)

```js
const s = await createSanctuaryScene(canvas, { object: 'escultura', fx: true, pixelScale: 3, motion: true, framing: 'landing', onReady });
s.setOptions({ object: 'ruina', fx: false, motion: false, framing: 'background', dither: 0.8, grain: 0, vignette: 1 });
s.resize(); s.snapshot('image/jpeg', 0.86); s.dispose();
```

Extra options: `dither` (0–1, default 0.35), `grain` (0–1, default 0.5), `vignette` (0–1, default 0), `onError(err)` for a lost
WebGL context (without it the handler throws). `triangles('scene' | 'object')` is a debugging helper.
Framings: `landing` (object at two thirds in landscape, top band in portrait), `background` (centred, smaller, high),
`small` (tight, centred, for a small canvas such as the waiting state).

Verified in Chromium (SwiftShader): 1440×900 and 390×844 for each object with FX on and off, no console errors, no horizontal
scroll, lean, tap, keyboard access to the FX panel, 3D off shows the poster. The lazy `sanctuaryScene` chunk in the app build is
542 KB raw / 143 KB gzip (three core + MarchingCubes + ConvexGeometry); three is not in the main bundle.

### Possible saving for `small` (not built)

For the small framing, the sky sphere and the colonnade could be skipped: the output pass already knows which pixels are sky
(alpha 0), so it could draw the gradient and sun itself from the view ray (inverse projection), with no sky geometry at all.

## Regenerating the posters

Load `index.html?object=<name>&motion=0&fx=1`, then save `__liminal.snapshot('image/jpeg', 0.86)` at 1440×900 and at
390×844 (DPR 1.5) into `posters/`, and copy them to `frontend/src/assets/sanctuary/poster-<name>[-portrait].jpg`.
Useful URL parameters: `object`, `motion`, `fx`, `px` (2, 3, 4), `dither` (off, light, strong), `grain`, `vignette`, `framing`, `lang`.
