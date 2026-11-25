import { reactive, watch } from 'vue'
// @ts-ignore: plain JS module
import { ASSETS, defaultTuning } from '@/components/sanctuary/scene/sanctuaryScene.js'
import { DEFAULT_PALETTE_ID, PALETTES } from '@/theme/palettes'

/**
 * Dev panel settings (dev builds only: VITE_DEV_PANEL=true). One reactive singleton shared by the panel
 * (DevPanel.vue), every live scene (sceneBridge.ts) and the plinth controls (DevPlinthControls.vue).
 * Persisted per browser in localStorage, so a reload or another page keeps the look being compared.
 *
 * `tuning` has the shape of sanctuaryScene.js's defaultTuning(); scenes receive it whole through setTuning().
 */

export type Tuning = ReturnType<typeof defaultTuning>
export interface Snapshot { name: string; savedAt: string; look: Look }
/** The part of the settings that defines a look (what snapshots, copy and paste carry). */
export interface Look { tuning: Tuning; paletteId: string; plinthControls: boolean }

export interface DevSettings extends Look {
  open: boolean
  hideUi: boolean
  /** which panel sections are open */
  sections: Record<string, boolean>
}

const KEY = 'comfymind.dev.settings'
const SNAP_KEY = 'comfymind.dev.snapshots'

export const ASSET_NAMES: string[] = ASSETS
export const paletteScene = (id: string) =>
  ({ ...(PALETTES.find(p => p.id === id) ?? PALETTES.find(p => p.id === DEFAULT_PALETTE_ID) ?? PALETTES[0]).scene })

export function defaultLook(): Look {
  const tuning = defaultTuning()
  tuning.palette = paletteScene(DEFAULT_PALETTE_ID)
  return { tuning, paletteId: DEFAULT_PALETTE_ID, plinthControls: true }
}

/** The "Clean (no FX)" preset: crisp pixels, no dither, no grain, no vignette. */
export function cleanFx(t: Tuning) {
  Object.assign(t, { pixelScale: 1, dither: false, grain: false, vignette: 0 })
}
/** The post-FX part of the defaults (the "Default" preset); leaves palette, assets and turntable alone. */
export function defaultFx(t: Tuning) {
  const d = defaultTuning()
  Object.assign(t, {
    pixelScale: d.pixelScale, dither: d.dither, ditherStrength: d.ditherStrength, ditherPattern: d.ditherPattern,
    levels: d.levels, grain: d.grain, grainAmount: d.grainAmount, vignette: d.vignette, fog: d.fog, exposure: d.exposure,
    light: { ...d.light },
  })
}

const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v)
/** Copies only keys the target already has, with the same type, so old or foreign JSON cannot break the scene. */
function mergeKnown(into: Record<string, any>, from: unknown) {
  if (!isObj(from)) return
  for (const k of Object.keys(into)) {
    const a = into[k], b = from[k]
    if (b === undefined) continue
    if (isObj(a)) mergeKnown(a, b)
    else if (a === null || typeof a === typeof b) into[k] = b
  }
}

function read<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null } catch { return null }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage blocked: this visit only */ }
}

function fresh(): DevSettings {
  return { ...defaultLook(), open: false, hideUi: false, sections: { fx: true, sculpture: true, plinth: true, assets: false, palette: true, comfort: false, settings: false } }
}

const settings = reactive<DevSettings>(fresh())
mergeKnown(settings, read(KEY))
const snapshots = reactive<Snapshot[]>(read<Snapshot[]>(SNAP_KEY) ?? [])

watch(settings, () => write(KEY, settings), { deep: true })
watch(snapshots, () => write(SNAP_KEY, snapshots), { deep: true })

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))

export function useDevSettings() {
  const look = (): Look => clone({ tuning: settings.tuning, paletteId: settings.paletteId, plinthControls: settings.plinthControls })
  /** Applies a look (from a snapshot or pasted JSON) over the defaults. Returns false for JSON that is not one. */
  const applyLook = (value: unknown): boolean => {
    if (!isObj(value) || !isObj(value.tuning)) return false
    const next = defaultLook()
    mergeKnown(next, value)
    Object.assign(settings, next)
    return true
  }
  const selectPalette = (id: string) => {
    settings.paletteId = id
    settings.tuning.palette = paletteScene(id)
  }
  const resetAll = () => Object.assign(settings, defaultLook())
  const resetAsset = (name: string) => {
    const d = defaultTuning().assets[name]
    if (d) Object.assign(settings.tuning.assets[name], d)
  }
  const saveSnapshot = () => {
    const used = new Set(snapshots.map(s => s.name))
    let i = 0, name = 'A'
    while (used.has(name)) { i++; name = i < 26 ? String.fromCharCode(65 + i) : `S${i - 25}` }
    snapshots.push({ name, savedAt: new Date().toISOString(), look: look() })
    return name
  }
  const loadSnapshot = (name: string) => { const s = snapshots.find(x => x.name === name); if (s) applyLook(s.look) }
  const deleteSnapshot = (name: string) => { const i = snapshots.findIndex(x => x.name === name); if (i >= 0) snapshots.splice(i, 1) }

  return { settings, snapshots, look, applyLook, selectPalette, resetAll, resetAsset, saveSnapshot, loadSnapshot, deleteSnapshot }
}
