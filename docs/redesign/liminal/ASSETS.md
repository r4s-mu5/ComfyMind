# Liminal Sanctuary: asset register

Every file in this folder that is not code, with its source, author, museum and licence.

## 3D models (`models/`)

| File | What it is | Original work | Scan source | Licence | Size, triangles |
|---|---|---|---|---|---|
| `venus-de-milo-head.glb` | Head, neck and shoulders, cut from a full-figure scan as a "fragment" | *Aphrodite of Melos* (Venus de Milo), attributed to Alexandros of Antioch, c. 150–125 BC, Musée du Louvre (Ma 399) | 3D scan of the **plaster cast KAS434** in the Royal Cast Collection, **Statens Museum for Kunst (SMK), Copenhagen**. Record: https://open.smk.dk/artwork/image/KAS434 | **Public Domain Mark 1.0** (SMK Open), https://creativecommons.org/publicdomain/mark/1.0/ | 66 KB, 14,004 |
| `apollo-belvedere-head.glb` | Head and the top of the chlamys, cut from a full-figure scan | *Apollo Belvedere*, Roman copy c. AD 120–140 after a Greek bronze (attributed to Leochares), Vatican Museums, Museo Pio-Clementino | 3D scan of the **plaster cast KAS353**, Royal Cast Collection, **SMK, Copenhagen**. Record: https://open.smk.dk/artwork/image/KAS353 | **Public Domain Mark 1.0** (SMK Open) | 49 KB, 10,013 |

Courtesy credit (not required by the licence, but please keep it):
"Sculpture scans: Statens Museum for Kunst, Royal Cast Collection (KAS434, KAS353), public domain, open.smk.dk."

### How the files were obtained

The hosts named in the brief were **all blocked** by this sandbox's network policy (connection refused at the proxy):
3d-api.si.edu and api.si.edu (Smithsonian), myminifactory.com (Scan the World), threedscans.com, sketchfab.com and api.sketchfab.com,
collectionapi.metmuseum.org, open.smk.dk and api.smk.dk, archive.org, polyhaven.com, huggingface.co, unpkg.com and cdn.jsdelivr.net.
GitHub and the npm registry were reachable, so I searched GitHub for museum scans mirrored there.

- The two SMK scans come from the public GitHub mirror **https://github.com/joonlab/museum-models**
  (commit `c407c90`, tag `v3`, files `models/venus-de-milo.glb` and `models/apollo-belvedere.glb`).
  Its `CREDITS.md` states that each file is the SMK `_small.stl` from SMK Open / the SMK API, released under the Public Domain Mark 1.0.
  The mirror had already simplified them to about 75k vertices and Draco-compressed them.
- **Not verified at the source.** Because open.smk.dk is blocked here, I could not open the two SMK records myself.
  Before anything ships in the product, open both record URLs above and confirm that the 3D download is marked "Public Domain".
  SMK Open publishes its public-domain works under PDM 1.0, so I expect it to match, but this step is still needed.

### Processing (reproducible)

Scripts were kept outside the repo (scratchpad). Steps:

1. `crop.mjs` (gltf-transform core + draco3dgltf): decode, keep only triangles whose three vertices lie above a height fraction
   (Venus: top 20 % of the figure; Apollo: top 17 %, within 0.22 m of the head axis, which removes the raised arm).
   Re-centre so the cut sits at y = 0, recompute area-weighted normals. The ragged lower edge is left as it is: it reads as a broken fragment.
2. `npx @gltf-transform/cli@4 simplify --ratio 0.62|0.38 --error 0.01`.
3. `npx @gltf-transform/cli@4 meshopt --level high` (EXT_meshopt_compression + quantization). The page decodes it with
   `three/addons/libs/meshopt_decoder.module.js`, so no WASM path is needed.

No textures. The pale-marble look and the pastel rim come from the page's material.

### Found but not used

| Candidate | Source | Licence | Why not |
|---|---|---|---|
| Plato herm, Hermes, Athena, "Column03" | threedscans.com via github.com/keijiro/ThreeDScans | No copyright (Three D Scans) | Good fallback set, but retopologised to 17–21k triangles and soft without their 2–10 MB normal maps. Plato is the best alternative bust. |
| Tennyson bust (Thomas Woolner, Usher Gallery, Lincoln) | threedscans.com via three.js `examples/models/gltf/tennyson-bust.glb` | No copyright | Victorian, not classical. |
| Bust of George Washington after Ceracchi (NPG.70.4) | Smithsonian via github.com/pyvista/vtk-data | CC0 | Neoclassical, but a specific political figure is a poor fit. |
| Nefertiti (two scans) | three.js examples; pyvista/vtk-data | CC BY-NC / CC BY-NC-SA | **Non-commercial: rejected.** |
| Antinous, Capitoline Venus and 12 other SMK casts | joonlab/museum-models | PDM 1.0 | Available as extra fragments later (the Belvedere Antinous head crops well). |

## Procedural geometry (in `index.html`, no licence needed)

Fluted Doric columns (16 flutes with entasis, an Attic-style lathe base, a lathe echinus capital and abacus), two levels of detail, instanced;
broken column drums with a seeded jagged top; plinths; entablature beams; an arcade wall (extruded shape with arched openings);
a lit doorway with a soft glow sprite; a sky-dome shader (gradient, sun disc, optional soft bands).

## Posters (`posters/`)

Rendered from this scene with `canvas.toDataURL('image/jpeg', 0.82)`, with motion off and the fragment at rest. Licence: same as the project.

| File | Viewport |
|---|---|
| `quiet.jpg`, `dreaming.jpg`, `liminal.jpg` | 1440×900 (landscape) |
| `quiet-portrait.jpg`, `dreaming-portrait.jpg`, `liminal-portrait.jpg` | 390×844 CSS px at 1.5× (portrait) |

## Code and fonts loaded at runtime

| What | From | Licence |
|---|---|---|
| three.js 0.160.0 (core, GLTFLoader, Reflector, BufferGeometryUtils, meshopt decoder) | cdn.jsdelivr.net/npm/three@0.160.0 | MIT |
| Atkinson Hyperlegible (body) | fonts.googleapis.com | SIL OFL 1.1 |
| Tenor Sans (display and wordmark, per DESIGN.md D8) | fonts.googleapis.com | SIL OFL 1.1 |
