/**
 * Palette presets for the dev palette selector (DESIGN.md §4.7).
 *
 * A preset is two things that must agree: the colours of the 3D scene (`scene`, applied by the
 * selector to sanctuaryScene.js) and the GUI tokens (light, night and dusk), which live in
 * src/style.css as `html.palette-<id>` blocks. The selector sets that class on <html>; the default,
 * 'atrio', needs no class. Contrast for every preset and mode is in DESIGN.md §4.7.
 *
 * Scene -> GUI. Colours sampled (median of 4x4-box-filtered regions, k-means k=2 for the columns)
 * from the posters in src/assets/sanctuary/ and the live landing at 1440 px, 'Quiet' mood:
 *   upper sky        #6A6791   (k2 #5F5784 / #6D6994)
 *   mid sky          #A793AB
 *   low sky          #CAABB6
 *   horizon haze     #D4BFB9   (k2 #DDBAB5 / #D3BFBB)
 *   sun              #FDD9D0   (core #FFE9D4, rim #F5D6C5)
 *   column, lit side #C0ADAB
 *   column, shadow   #5D4E62   (far columns #735F6C; entablature underside #675259)
 *   plinth           #9F8B8A
 *   floor            #6C567F
 * Atrio light: page #E9E2E3 = lit marble lifted into the horizon haze; top light #F3E9E5 = the haze.
 * Atrio night: page #221D24 = the column shadow deepened; text #F0E8E5 = lit marble; primary = the sun;
 * link #D2BEDD = the sky above the columns, lifted (teal was a lone cool neon note on mauve stone).
 *
 * `scene` fields map onto the scene's MOOD: skyTop/skyMid/skyLow/horizon = sky gradient, sun = sun
 * disc (and key light), marble = stone material, marbleShadow = hemisphere ground light (the colour
 * the shadow side of the stone takes), fog = fog colour. 'atrio' reproduces today's MOOD exactly.
 */

export interface ScenePalette {
  skyTop: string
  skyMid: string
  skyLow: string
  horizon: string
  sun: string
  marble: string
  marbleShadow: string
  fog: string
}

export interface Palette {
  id: string
  name: string
  description: string
  scene: ScenePalette
}

export const DEFAULT_PALETTE_ID = 'atrio'

export const PALETTES: Palette[] = [
  {
    id: 'atrio',
    name: 'Atrio',
    description: 'The approved dusk atrium. Light: lit marble and horizon haze. Night: the shadow side of the columns.',
    scene: {
      skyTop: '#1D2142',
      skyMid: '#5E5A8A',
      skyLow: '#B49AB4',
      horizon: '#D9B4AE',
      sun: '#FFE6CC',
      marble: '#E7E0E2',
      marbleShadow: '#5A4C72',
      fog: '#D9B4AE',
    },
  },
  {
    id: 'alba',
    name: 'Alba',
    description: 'Dawn: a pale pearl sky turning rose-gold at the horizon. Cooler and lighter than Atrio.',
    scene: {
      skyTop: '#46506A',
      skyMid: '#9AA2BA',
      skyLow: '#E2C8C6',
      horizon: '#F1D8C8',
      sun: '#FFF0DA',
      marble: '#EEEAE7',
      marbleShadow: '#7B7488',
      fog: '#E9D6CF',
    },
  },
  {
    id: 'piedra',
    name: 'Piedra',
    description: 'Warm limestone and ochre, low saturation: the atrium as quarried stone. No terracotta.',
    scene: {
      skyTop: '#3B3734',
      skyMid: '#8A8076',
      skyLow: '#C8B9A5',
      horizon: '#DCCAB0',
      sun: '#F6E4C6',
      marble: '#E7E0D6',
      marbleShadow: '#6F665B',
      fog: '#D7C8B3',
    },
  },
  {
    id: 'jardin',
    name: 'Jardín',
    description: 'A sage and olive dusk over a cloister garden, with verdigris accents.',
    scene: {
      skyTop: '#2D3631',
      skyMid: '#6F7B69',
      skyLow: '#B6B89B',
      horizon: '#D8CEA9',
      sun: '#F4E5C0',
      marble: '#E5E4DA',
      marbleShadow: '#5C6558',
      fog: '#CAC9AF',
    },
  },
  {
    id: 'noche-clara',
    name: 'Noche clara',
    description: 'Moonlit atrium: blue-grey stone under a clear night, a pale moon instead of the sun. Low saturation, never navy.',
    scene: {
      skyTop: '#2C3440',
      skyMid: '#6B7584',
      skyLow: '#A8AFB9',
      horizon: '#CCCFD2',
      sun: '#F1EFE6',
      marble: '#E2E4E5',
      marbleShadow: '#545B68',
      fog: '#BEC4CA',
    },
  },
]

/** The <html> class for a palette; the default has none. */
export const paletteClass = (id: string) => (id === DEFAULT_PALETTE_ID ? '' : `palette-${id}`)

/** The palette whose class is on <html> now (the default when none is). */
export const activePaletteId = (root: HTMLElement = document.documentElement) =>
  PALETTES.find((p) => paletteClass(p.id) && root.classList.contains(paletteClass(p.id)))?.id ?? DEFAULT_PALETTE_ID

/** Put one palette's class on <html> and remove the others. Only the GUI tokens: the scene is recoloured separately. */
export const applyPaletteClass = (id: string, root: HTMLElement = document.documentElement) => {
  for (const p of PALETTES) if (paletteClass(p.id)) root.classList.remove(paletteClass(p.id))
  if (paletteClass(id)) root.classList.add(paletteClass(id))
}
