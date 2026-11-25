# Liminal Sanctuary: prototype notes (L2)

`index.html` is a standalone prototype of the landing hero. It shows an empty colonnade at dusk, a pastel sky and light fog,
with **one generated marble sculpture** on a plinth, seen through a low-resolution, dithered "pixel" pass.
The landing copy is real (ES, CA, EN) and sits on a scrim. The scene code is `scene/sanctuaryScene.js`, a byte-identical copy of
the app module `frontend/src/components/sanctuary/scene/sanctuaryScene.js`, which is the source of truth.

The owner's decisions (2026-11-24):
- the object is **Escultura abstracta**, and it is **generative**;
- the scene is **fully still**: no camera drift, no pointer lean, no breathing, no turning;
- the FX use the strongest setting by default: 1/4 resolution and strong dithering.

Ruina and Estudio remain in the dock for comparison.

## The generative sculpture

- A seed (0–9999) drives a small PRNG (mulberry32). The PRNG sets the block size and its 1–3 chamfers, and the ellipse proportions, lean and offset.
  It also sets the position and size of the bite that opens the form, the twist, the thickness and taper, and the bow in plan.
  It decides whether there is an opening (0 or 1), with its size and position, and the yaw.
  `sculptureParams(seed)` → `sculptureSdf()` → marching cubes (`buildSculptureGeometry(seed, res = 60)`).
- **Speed:** about 53 ms median in Node and about 60 ms in the browser (SwiftShader), which is well under the 150 ms budget. Sculptures have 10k–13k triangles,
  and the whole scene has 20k–22k.
- **Never figurative.** I checked 3 × 40 seeds on contact sheets and tightened the ranges after each round:
  - Round 1: tall, edge-on teardrops with a hole high up (a "bird" or a "ghost with an eye"), and egg shapes with one hole. Fix: forms are always wider than tall (ry ≤ rx), the bite always cuts deep, and the hole sits in the lower body.
  - Round 2: a strong twist turned the top edge-on (a "flame with an eye"), and near-vertical bites left two even horns ("ears"). Fix: twist ≤ 0.5 rad, yaw −22° ± 12°, and the bite at least 0.34 rad off vertical, so the horns are always uneven.
  - Round 3: every seed reads as an abstract carved crescent or hook on a hewn block. There are never two holes, a head-on-shoulders silhouette or a face-like arrangement.
- **Seed per visit:** a random seed, kept in `sessionStorage`, so a reload shows the same piece. URL `?seed=` overrides it in the prototype.
  The posters use seed **0427**.

### Regenerating

- **Button:** "Otra escultura" / "Una altra escultura" / "Another sculpture", a quiet text button in the landing panel.
  It is a real `<button>`, so it works with the keyboard and screen readers. It only appears while the 3D scene is live.
- **Click on the scene:** does the same (module option `interactive`).
- **Transition:** an 800 ms dissolve in Bayer order. Each low-res pixel switches from the old sculpture to the new one when the progress passes its rank in the 4×4 matrix.
  The new scene is rendered once into a second render target; during the dissolve only the output pass runs. The camera does not move.
  With motion off, the new sculpture swaps in on the next frame.
- **Museum label:** an HTML overlay (Tenor caps), pinned with `scene.anchor('plinth')`. In landscape it sits just right of the plinth; in portrait it sits on the plinth's front face.
  It reads "ESCULTURA Nº 0427 / Mármol, generada para ti" (CA "Escultura núm. … / Marbre, generada per a tu"; EN "Sculpture no. … / Marble, made for you").
- **Announcement:** a polite `aria-live` region says "Escultura nº 3947. Mármol, generada para ti." after each regeneration the person asked for, but not on first load.

### Vibecheck: first idea → flags → what we did instead

- **Escultura:**
  - First idea: a smooth, glossy pebble with two holes, regenerated with a spin.
  - Flags: stock 3D blob; two holes read as eyes; spinning "reveal" motion.
  - Instead: matte marble carved out of a hewn block, at most one low opening, uneven horns, and a still camera with a dithered dissolve.
- **Ruina:**
  - First idea: egg-and-dart moulding.
  - Flag: it reads as teeth at low resolution.
  - Instead: a plain echinus, with the volutes carrying the detail.
- **Estudio:**
  - First idea: a chrome sphere and a glossy torus.
  - Flag: gradient orb / glossy blob.
  - Instead: honed marble, with Dürer's faceted solid as the focus.

## Post-FX (dock: "FX")

There is one custom output pass and no EffectComposer. The scene renders into a half-float target at reduced size, which is upscaled with nearest filtering in whole device-pixel blocks.
HTML text is never affected.

| Control | Options | Default |
|---|---|---|
| FX | on / off ("off" is the clean render with 4× MSAA) | **on** |
| Pixel size | 1/2, 1/3, 1/4 of CSS resolution | **1/4** |
| Dither | off / light / strong (4×4 Bayer, about 25 or 13 levels per channel) | **strong** |
| Film grain | on / off; **static** (fixed per pixel, never refreshed) | **on** |
| Vignette | on / off; soft | off |

The sky writes alpha 0, so the output pass skips tone mapping for it and keeps the exact pastel colours.

## Motion and rendering

- **Still.** A frame is rendered only on a change: resize, options, a new sculpture. During the dissolve it runs at about 30 fps for 0.8 s, and never while the tab is hidden.
- **Motion off** (Comfort or `prefers-reduced-motion`, dock toggle in the prototype): no dissolve, instant swap.
- DPR is capped at 1.5. There are no shadow maps (soft contact decals instead), no mirror floor, and the columns are instanced.

## Module API

```js
const s = await createSanctuaryScene(canvas, {
  object: 'escultura', fx: true, pixelScale: 4, motion: true, framing: 'landing', onReady,
  seed: 427, onSculpture: seed => {}, interactive: true,       // additions; all optional
  dither: 0.8, grain: 0.5, vignette: 0, onError,
});
s.regenerate();      // → new seed (random); s.regenerate(1203) → 1203
s.seed;              // current seed
s.anchor('plinth');  // {x, y} in CSS px from the canvas's top-left corner, for a label
s.setOptions({ seed: 88, fx: false }); s.resize(); s.snapshot('image/jpeg', 0.86); s.dispose();
```

`SanctuaryScene.vue` passes `pixelScale: 4, dither: 0.8`, the session seed, `interactive` and `label` props. It emits `sculpture(seed)` and
exposes `regenerate()`, `live` and `seed`. `WelcomeView` adds the button and the live region. Login, Signup and Session end use
`framing="background"` without `interactive`, so they show the same still sculpture of the visit.
In the app, the DuskLayout content layer covers the scene, so on those screens the button is the way to regenerate.

The lazy `sanctuaryScene` chunk is 543 KB raw / 144 KB gzip, and three is not in the main bundle.

### Possible saving for `small` (not built)

The output pass already knows which pixels are sky (alpha 0). It could draw the gradient and the sun from the view ray itself, so the small framing would not need the sky sphere or the colonnade.

## Regenerating the posters

1. Load `index.html?object=<name>&motion=0&seed=427` (the defaults are FX on, 1/4, strong).
2. Save `__liminal.snapshot('image/jpeg', 0.86)` at 1440×900 and at 390×844 (DPR 1.5) into `posters/`.
3. Copy them to `frontend/src/assets/sanctuary/poster-<name>[-portrait].jpg`.

Useful URL parameters: `object`, `seed`, `motion`, `fx`, `px`, `dither`, `grain`, `vignette`, `framing`, `lang`.
