/**
 * Single source of truth for demo mode.
 *
 * Demo mode is ON when any of these is true:
 *  - VITE_DEMO=true at build time (the hosted build: `npm run build:demo`)
 *  - VITE_DEV_PREVIEW_MODE=true at build time (legacy alias)
 *  - ?demo=1 in the URL (also inside the hash: #/home?demo=1). Once seen it is
 *    remembered in sessionStorage, so it is global and survives navigation.
 */
const SS_KEY = 'comfymind.demo.flag'

const fromEnv =
  import.meta.env.VITE_DEMO === 'true' || import.meta.env.VITE_DEV_PREVIEW_MODE === 'true'

const fromUrl = () => {
  try {
    const search = new URLSearchParams(window.location.search)
    const hash = window.location.hash || ''
    const hashQuery = new URLSearchParams(hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '')
    return search.get('demo') === '1' || hashQuery.get('demo') === '1'
  } catch {
    return false
  }
}

const fromSession = () => {
  try {
    return sessionStorage.getItem(SS_KEY) === '1'
  } catch {
    return false
  }
}

const computeIsDemo = () => {
  if (fromEnv) return true
  if (fromUrl()) {
    try { sessionStorage.setItem(SS_KEY, '1') } catch { /* storage unavailable */ }
    return true
  }
  return fromSession()
}

export const isDemo = computeIsDemo()
export default isDemo
