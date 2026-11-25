import { shallowReactive, toRaw, watch } from 'vue'
import { useDevSettings } from './useDevSettings'

/**
 * Connects every live scene (landing, login, waiting, session end, gallery) to the dev settings.
 * SanctuaryScene.vue calls bindScene() in dev builds only. The panel reads `scenes` for the screenshot
 * and the frame counter.
 */
export interface DevScene {
  handle: any
  framing: string
  canvas: HTMLCanvasElement | null
}

export const scenes = shallowReactive(new Set<DevScene>())

export function bindScene(handle: any, info: { framing: string; canvas: HTMLCanvasElement | null }) {
  const { settings } = useDevSettings()
  const entry: DevScene = { handle, framing: info.framing, canvas: info.canvas }
  scenes.add(entry)
  // The seed is sent only when the panel changes it, so a later tweak never undoes "Otra escultura".
  let lastSeed: number | null = null
  const stop = watch(
    () => settings.tuning,
    (t) => {
      const next = JSON.parse(JSON.stringify(toRaw(t)))
      if (next.seed === lastSeed) delete next.seed
      else lastSeed = next.seed
      if (next.seed === null) delete next.seed
      try { handle.setTuning(next) } catch (e) { console.error('[dev] setTuning', e) }
    },
    { deep: true, immediate: true },
  )
  return () => { stop(); scenes.delete(entry) }
}

/** The biggest scene on screen (the one worth a screenshot). */
export function mainScene(): DevScene | null {
  let best: DevScene | null = null, area = 0
  for (const s of scenes) {
    const r = s.canvas?.getBoundingClientRect()
    const a = r ? r.width * r.height : 0
    if (a > area) { area = a; best = s }
  }
  return best
}
