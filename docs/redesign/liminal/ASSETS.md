# Liminal Sanctuary: asset register

**Everything in the scene is procedural.** There are no 3D models, no textures, no scans and no third-party
art assets. The earlier museum-scan heads (Venus de Milo, Apollo Belvedere) and their `models/` folder were
removed on purpose: the owner asked for **no human or figurative shapes** (DESIGN.md, VIBECHECK.md §3.4).

## Code (the only source of the images)

| File | What it is |
|---|---|
| `frontend/src/components/sanctuary/scene/sanctuaryScene.js` | **Source of truth.** The scene module used by the Vue app (`SanctuaryScene.vue`). |
| `docs/redesign/liminal/scene/sanctuaryScene.js` | Byte-identical copy so the standalone prototype can load it relatively. After editing the source, copy it here again (`cp`) and regenerate the posters. |

What the module builds, all from three.js primitives (licence: same as the project):

| Part | How |
|---|---|
| Sky | Shader on a sphere: dusk gradient, low soft sun disc, horizon haze |
| Colonnade | Fluted Doric columns (16 flutes with entasis, lathe base and echinus, abacus), 2 × 6, instanced in two levels of detail; two beams |
| Floor | One plane in fog; soft contact shadows are radial-gradient decals (a 64 px canvas texture drawn at runtime), no shadow maps |
| **Ruina** | Ionic capital: lathe echinus and astragal, an extruded volute bolster, spiral scrolls as tubes on both faces, balteus bands, abacus. Two broken fluted drums (seeded jagged break) lying on the floor |
| **Escultura abstracta** | Generative: a seeded signed-distance field (an open, twisted crescent form with at most one opening, rising out of a hewn block) meshed with `MarchingCubes` from three/addons |
| **Estudio** | Dürer's truncated rhombohedron (72° rhombi, both apexes cut; *Melencolia I*, 1514, public domain as a geometric idea) built with `ConvexGeometry`; a sphere; a torus; three plinths |
| Post-FX | One custom fullscreen pass: nearest-neighbour upscale from a 1/2, 1/3 or 1/4 resolution render target, a Bayer-order dissolve between two sculptures, tone mapping, static film grain, 4×4 Bayer ordered dithering, optional soft vignette |

## Posters (`posters/`)

Rendered from the scene itself with `snapshot()` (`canvas.toDataURL('image/jpeg', 0.86)`), motion off, objects at rest,
with the default post-FX (1/4 resolution, strong dithering, static grain); the Escultura posters show seed 0427. Licence: same as the project.
The same six files are copied into the app as `frontend/src/assets/sanctuary/poster-<object>[-portrait].jpg`.

| File | Viewport |
|---|---|
| `ruina.jpg`, `escultura.jpg`, `estudio.jpg` | 1440×900 (landscape) |
| `ruina-portrait.jpg`, `escultura-portrait.jpg`, `estudio-portrait.jpg` | 390×844 CSS px at 1.5× (portrait) |

## Code and fonts loaded at runtime (prototype only)

| What | From | Licence |
|---|---|---|
| three.js 0.160.0 (core; addons `BufferGeometryUtils`, `ConvexGeometry`, `MarchingCubes`) | cdn.jsdelivr.net/npm/three@0.160.0 (the app bundles `three@0.160.0` from npm instead) | MIT |
| Readex Pro (body), Tenor Sans (display) | fonts.googleapis.com (the app self-hosts both via Fontsource) | SIL OFL 1.1 |
