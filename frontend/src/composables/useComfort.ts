import { computed, reactive, watch } from 'vue'

/**
 * Comfort settings (DESIGN.md §5.4): text size, motion, atmosphere, 3D scene.
 * Language lives in usePrototypeLocale. Everything persists per device in localStorage
 * (inside try/catch: storage can be blocked) and is applied as classes on <html>:
 *   text-125 | text-150, motion-off | motion-on, atmo-everywhere | atmo-plain, no-3d
 */

export type TextSize = 100 | 125 | 150
export type Motion = 'on' | 'off'
export type Atmosphere = 'thresholds' | 'everywhere' | 'plain'

interface ComfortState {
  textSize: TextSize
  /** null = follow prefers-reduced-motion until the person chooses */
  motion: Motion | null
  atmosphere: Atmosphere
  scene3d: boolean
}

const STORAGE_KEY = 'comfymind.comfort'
const defaults = (): ComfortState => ({ textSize: 100, motion: null, atmosphere: 'thresholds', scene3d: true })

const state = reactive<ComfortState>(defaults())
const system = reactive({ reducedMotion: false, desktop: true })
let started = false

const read = (): Partial<ComfortState> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const write = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable: the settings still apply for this visit */
  }
}

const motionOff = computed(() => (state.motion ?? (system.reducedMotion ? 'off' : 'on')) === 'off')

const apply = () => {
  if (typeof document === 'undefined') return
  const cl = document.documentElement.classList
  cl.toggle('text-125', state.textSize === 125)
  cl.toggle('text-150', state.textSize === 150)
  cl.toggle('motion-off', motionOff.value)
  cl.toggle('motion-on', state.motion === 'on')
  cl.toggle('atmo-everywhere', state.atmosphere === 'everywhere')
  cl.toggle('atmo-plain', state.atmosphere === 'plain')
  cl.toggle('no-3d', !state.scene3d)
}

/** Load saved settings and start applying them. Safe to call more than once (main.js calls it before mount). */
export const initComfort = () => {
  if (started || typeof window === 'undefined') return
  started = true

  const saved = read()
  if ([100, 125, 150].includes(saved.textSize as number)) state.textSize = saved.textSize as TextSize
  if (saved.motion === 'on' || saved.motion === 'off') state.motion = saved.motion
  if (saved.atmosphere === 'thresholds' || saved.atmosphere === 'everywhere' || saved.atmosphere === 'plain') {
    state.atmosphere = saved.atmosphere
  }
  if (typeof saved.scene3d === 'boolean') state.scene3d = saved.scene3d

  try {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    system.reducedMotion = reduced.matches
    reduced.addEventListener('change', (e) => { system.reducedMotion = e.matches })
    const desktop = window.matchMedia('(min-width: 1024px) and (hover: hover)')
    system.desktop = desktop.matches
    desktop.addEventListener('change', (e) => { system.desktop = e.matches })
  } catch {
    /* matchMedia unavailable: keep defaults */
  }

  watch(() => ({ ...state, reduced: system.reducedMotion }), () => { apply() }, { deep: true, immediate: true })
}

export const useComfort = () => {
  initComfort()

  const persist = () => write()
  const setTextSize = (value: TextSize) => { state.textSize = value; persist() }
  const setMotion = (value: Motion) => { state.motion = value; persist() }
  const setAtmosphere = (value: Atmosphere) => { state.atmosphere = value; persist() }
  const setScene3d = (value: boolean) => { state.scene3d = value; persist() }
  const reset = () => { Object.assign(state, defaults()); persist() }

  return {
    state,
    /** Effective motion setting (explicit choice, else the system preference). */
    motionOff,
    /** True when a 3D scene may upgrade from its poster: toggle on, motion on, desktop pointer. */
    scene3dAllowed: computed(() => state.scene3d && !motionOff.value && system.desktop),
    setTextSize,
    setMotion,
    setAtmosphere,
    setScene3d,
    reset,
  }
}
