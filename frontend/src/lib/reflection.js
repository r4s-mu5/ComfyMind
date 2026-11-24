/**
 * Reads the reflection note a patient wrote for an obra (file name), if any.
 * Demo mode: looks for the notes API of the demo store when present, then localStorage.
 * Returns '' when there is none. Never throws.
 */
import * as demoStore from '@/lib/demo/store'

export const getReflectionNote = async (fileName, imageId) => {
  try {
    const api = demoStore['demoNotes']
    if (api) {
      const fn = api.getForImage || api.get || api.getNote
      if (typeof fn === 'function') {
        const out = await fn.call(api, fileName, imageId)
        const text = typeof out === 'string' ? out : out?.text
        if (text) return String(text)
      }
    }
  } catch { /* fall through */ }
  try {
    return localStorage.getItem(`comfymind.reflection.${fileName}`) || ''
  } catch {
    return ''
  }
}
