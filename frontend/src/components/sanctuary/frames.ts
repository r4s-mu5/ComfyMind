import { reactive } from 'vue'

/**
 * The frame a person chose for an obra (ArtworkMount `frame`), remembered per file name.
 * Client-side only for now (localStorage, demo and real backend alike): the backend has no field
 * for it yet. Backend TODO: store it with the image and read it back here.
 */
export type FrameShape = 'arch' | 'square' | 'pediment' | 'oculus' | 'columns' | 'none'
export const FRAME_SHAPES: FrameShape[] = ['arch', 'square', 'pediment', 'oculus', 'columns', 'none']

const PREFIX = 'comfymind.frame.'
const isShape = (v: unknown): v is FrameShape => FRAME_SHAPES.includes(v as FrameShape)
const keyOf = (fileName?: string) => String(fileName || '').split('/').pop()!.split('#').pop() || ''

const chosen = reactive<Record<string, FrameShape>>({})
try {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    const v = k?.startsWith(PREFIX) ? localStorage.getItem(k) : null
    if (k && isShape(v)) chosen[k.slice(PREFIX.length)] = v
  }
} catch { /* storage blocked: frames are remembered for this visit only */ }

/** The frame the person chose for this obra, if any. */
export const savedFrame = (fileName?: string): FrameShape | undefined => chosen[keyOf(fileName)]

/** The saved frame for this obra, or `fallback` (arch for a featured piece, square on the wall). */
export const frameFor = (fileName: string | undefined, fallback: FrameShape): FrameShape =>
  savedFrame(fileName) ?? fallback

export const setFrameFor = (fileName: string | undefined, shape: FrameShape) => {
  const key = keyOf(fileName)
  if (!key) return
  chosen[key] = shape
  try { localStorage.setItem(PREFIX + key, shape) } catch { /* storage blocked */ }
}
