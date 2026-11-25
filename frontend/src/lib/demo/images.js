// Bundled demo images (resized copies of src/assets/images/template_images, imported through Vite).
const files = import.meta.glob('./images/*.jpg', { eager: true, query: '?url', import: 'default' })

const urlByKey = {}
for (const [path, url] of Object.entries(files)) {
  urlByKey[path.split('/').pop().replace(/\.jpg$/, '')] = url
}

// Artwork-style images (used for templates and generation results). Abstract or near-abstract only:
// no faces, bodies, animals or anything figurative (DESIGN.md §5.3). The order matters: results are
// picked by hash, so the chips («Un lugar tranquilo» = 10, «Un recuerdo de verano» = 1,
// «Cómo me siento hoy» = 9, «El mar en calma» = 11; "Otra versión" = next index) land on calm pieces.
export const ARTWORK_KEYS = [
  'simple_test_00211_', 'ComfyUI_00158_', 'simple_test_00160_', 'simple_test_00178_',
  'simple_test_00208_b', 'ComfyUI_00015_', 'simple_test_00218_', 'simple_test_00199_b',
  'simple_test_00207_', 'ComfyUI_00129_', 'simple_test_00127_', 'simple_test_00145_',
]
// Abstract line sketches (used as drawn bocetos): a spiral, and horizon strokes.
export const SKETCH_KEYS = ['sketch_spiral', 'sketch_horizon']

export const templateFileNames = () => ARTWORK_KEYS.map((k) => `${k}.jpg`)

// Runtime-only URLs for uploads / canvas drawings (object URLs; they do not survive a reload).
const runtime = new Map()
export const registerRuntimeImage = (fileName, blobOrFile) => {
  try {
    runtime.set(fileName, URL.createObjectURL(blobOrFile))
  } catch { /* ignore */ }
}

export const hashString = (str) => {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Name for a generated image whose picture is `key` (`generated_<key>_<n>.jpg`). */
export const generatedName = (key, n) => `generated_${key}_${n}.jpg`

/** Resolve any file name used by the app to a displayable URL. The URL ends in `#/<fileName>` so
 *  views that do `url.split('/').pop()` still get the original file name. */
export const resolveDemoImage = (fileName) => {
  if (!fileName) return ''
  const name = String(fileName).split('/').pop().split('#').pop()
  let url = runtime.get(name)
  if (!url) {
    const key = Object.keys(urlByKey).find((k) => name.includes(k))
    if (key) url = urlByKey[key]
    else {
      const pool = name.startsWith('drawn') || name.startsWith('uploaded_drawn') ? SKETCH_KEYS : ARTWORK_KEYS
      url = urlByKey[pool[hashString(name) % pool.length]]
    }
  }
  return `${url}#/${name}`
}

export const artworkKeyFor = (seedText, offset = 0) =>
  ARTWORK_KEYS[(hashString(seedText || 'empty') + offset) % ARTWORK_KEYS.length]
