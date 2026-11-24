// Bundled demo images (resized copies of src/assets/images/template_images, imported through Vite).
const files = import.meta.glob('./images/*.jpg', { eager: true, query: '?url', import: 'default' })

const urlByKey = {}
for (const [path, url] of Object.entries(files)) {
  urlByKey[path.split('/').pop().replace(/\.jpg$/, '')] = url
}

// Artwork-style images (used for templates and generation results).
export const ARTWORK_KEYS = [
  'ComfyUI_00015_', 'ComfyUI_00094_', 'ComfyUI_00105_', 'simple_test_00127_',
  'simple_test_00145_', 'simple_test_00147_', 'simple_test_00160_', 'simple_test_00201_b',
  'simple_test_00203_b', 'simple_test_00209_b', 'simple_test_00221_', 'simple_test_00223_',
]
// Line-art images (used as drawn sketches).
export const SKETCH_KEYS = ['simple_test_00180_', 'simple_test_00185_']

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
