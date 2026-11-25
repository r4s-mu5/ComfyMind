<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useComfort } from '@/composables/useComfort'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import MuseumLabel from './MuseumLabel.vue'

/**
 * The Sanctuary scene (DESIGN.md §5.3): a thin, safe wrapper around the 3D module.
 *
 *   1. It ALWAYS renders the poster first (or nothing, so the CSS dusk sky of DuskLayout shows).
 *   2. Only if Comfort allows 3D (toggle on, desktop pointer) does it load the 3D code,
 *      with a dynamic import, so `three` never reaches screens that do not need it.
 *   3. Motion off  -> the scene renders ONE still frame (the module gets `motion: false`).
 *   4. Any error (missing module, no WebGL, lost context) -> back to the poster.
 *
 * The scene itself (objects, post-FX at 1/4 resolution with strong dithering, the generative sculpture,
 * DPR cap, pause when hidden) lives in `./scene/sanctuaryScene.js` and is framework-agnostic.
 * The scene is fully still; the only motion is a short dissolve when a new sculpture appears.
 *
 * Props
 *   object       'escultura' | 'ruina' | 'estudio'   which abstract object to show
 *   framing      'landing' | 'background' | 'small'  camera framing; 'background' also adds a veil
 *   fx           pixelated render + dithering + grain
 *   seed         which generated sculpture (0..9999); default: one random seed per visit (sessionStorage)
 *   interactive  a click on the scene shows another sculpture (the host must ALSO offer a real button)
 *   label        pin a museum label ("Escultura nº 0427") beside the plinth while the 3D scene is live
 *
 * Emits `sculpture(seed)` whenever a sculpture is shown. Exposes `regenerate(seed?)`, `live` and `seed`.
 */
interface Props {
  object?: 'escultura' | 'ruina' | 'estudio'
  framing?: 'landing' | 'background' | 'small'
  fx?: boolean
  seed?: number
  interactive?: boolean
  label?: boolean
}
const props = withDefaults(defineProps<Props>(), { object: 'escultura', framing: 'landing', fx: true, interactive: false, label: false })
const emit = defineEmits<{ sculpture: [seed: number] }>()

const { state, motionOff } = useComfort()
const { t } = usePrototypeLocale()

// One sculpture per visit: a random seed, remembered for the session, so a reload shows the same piece.
const SEED_KEY = 'comfymind.sculptureSeed'
const readSeed = (): number | null => {
  try { const v = sessionStorage.getItem(SEED_KEY); return v === null ? null : Number(v) } catch { return null }
}
const saveSeed = (v: number) => { try { sessionStorage.setItem(SEED_KEY, String(v)) } catch { /* private mode */ } }
const initialSeed = (): number => {
  const s = props.seed ?? readSeed()
  if (s !== null && Number.isFinite(s)) return s
  const fresh = Math.floor(Math.random() * 10000)
  saveSeed(fresh)
  return fresh
}
const seed = ref<number>(initialSeed())
const onSculpture = (s: number) => { seed.value = s; saveSeed(s); emit('sculpture', s) }

// Posters are optional files: src/assets/sanctuary/poster-<object>.jpg (+ -portrait.jpg).
// A glob (instead of a plain import) means a missing file never breaks the build.
const posters = import.meta.glob('../../assets/sanctuary/poster-*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const posterFor = (suffix: string) =>
  Object.entries(posters).find(([path]) => path.endsWith(`poster-${props.object}${suffix}.jpg`))?.[1]
const poster = computed(() => posterFor(''))
const posterPortrait = computed(() => posterFor('-portrait'))

// The 3D module is also found by glob, so a missing file falls back to the poster.
const sceneModules = import.meta.glob('./scene/sanctuaryScene.js') as Record<string, () => Promise<any>>

interface SceneHandle {
  setOptions: (o: Record<string, unknown>) => void
  resize: () => void
  dispose: () => void
  regenerate: (seed?: number) => number
  anchor: (which?: 'plinth' | 'beside') => { x: number; y: number } | null
}

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const ready = ref(false) // true once the first 3D frame is on screen
let handle: SceneHandle | null = null
let resizeObserver: ResizeObserver | null = null
let starting = false
let gone = false

// 3D is for desktop pointers only (phones and tablets keep the poster).
const desktopQuery = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(min-width: 1024px) and (hover: hover)')
  : null
const desktop = ref(desktopQuery?.matches ?? false)
const onDesktopChange = (e: MediaQueryListEvent) => { desktop.value = e.matches }

const allowed = computed(() => state.scene3d && desktop.value)

const stop = () => {
  resizeObserver?.disconnect()
  resizeObserver = null
  try { handle?.dispose() } catch { /* nothing to clean up */ }
  handle = null
  ready.value = false
}

const start = async () => {
  if (handle || starting || gone || !canvas.value) return
  const load = sceneModules['./scene/sanctuaryScene.js']
  if (!load) return // module not there yet: the poster stays
  starting = true
  try {
    const mod = await load()
    if (gone || !allowed.value || !canvas.value) return
    const created: SceneHandle = await mod.createSanctuaryScene(canvas.value, {
      object: props.object,
      fx: props.fx,
      pixelScale: 4,
      dither: 0.8,
      grain: 0.5,
      motion: !motionOff.value,
      framing: props.framing,
      seed: seed.value,
      interactive: props.interactive,
      onSculpture,
      onReady: () => { ready.value = true; void nextTick(placeLabel) },
    })
    if (gone || !allowed.value) { created.dispose(); return }
    handle = created
    if (typeof ResizeObserver !== 'undefined' && root.value) {
      resizeObserver = new ResizeObserver(() => { handle?.resize(); placeLabel() })
      resizeObserver.observe(root.value)
    }
  } catch (error) {
    console.warn('[SanctuaryScene] falling back to the poster:', error)
    stop()
  } finally {
    starting = false
  }
}

// Comfort: 3D toggle / screen size -> start or stop. Motion -> live or still frame.
watch(allowed, (on) => { if (on) void start(); else stop() })
watch(motionOff, (off) => handle?.setOptions({ motion: !off }))
watch(() => [props.object, props.fx, props.framing] as const, ([object, fx, framing]) => { handle?.setOptions({ object, fx, framing }); placeLabel() })
watch(() => props.seed, (s) => { if (s !== undefined && s !== seed.value) handle?.regenerate(s) })

// Museum label pinned to the plinth (landscape: beside it; portrait: on its front face).
const labelEl = ref<HTMLElement | null>(null)
const labelPos = ref<{ x: number; y: number } | null>(null)
function placeLabel() {
  if (!props.label || !handle || !ready.value || !root.value) { labelPos.value = null; return }
  const a = handle.anchor('plinth')
  if (!a) { labelPos.value = null; return }
  const W = root.value.clientWidth, H = root.value.clientHeight
  const w = labelEl.value?.offsetWidth ?? 220, h = labelEl.value?.offsetHeight ?? 60
  const portrait = W / H < 0.95
  labelPos.value = {
    x: Math.round(Math.min(W - w - 16, Math.max(16, portrait ? a.x - w - 10 : a.x + 14))),
    y: Math.round(Math.min(H - h - 16, Math.max(72, portrait ? a.y + 12 : a.y + 6))),
  }
}
const pad = (n: number) => String(n).padStart(4, '0')
const live = computed(() => ready.value && props.object === 'escultura')

/** Show another sculpture. Returns the new seed, or null while only the poster is shown. */
function regenerate(next?: number): number | null {
  if (!handle || !ready.value) return null
  return handle.regenerate(next)
}
defineExpose({ regenerate, live, seed })

// Pause when the tab is hidden (a still frame costs nothing), resume afterwards.
const onVisibility = () => handle?.setOptions({ motion: !document.hidden && !motionOff.value })
// A lost WebGL context cannot be trusted: drop to the poster.
const onContextLost = (event: Event) => { event.preventDefault(); stop() }

onMounted(() => {
  desktopQuery?.addEventListener('change', onDesktopChange)
  document.addEventListener('visibilitychange', onVisibility)
  canvas.value?.addEventListener('webglcontextlost', onContextLost)
  if (allowed.value) void start()
})

onBeforeUnmount(() => {
  gone = true
  desktopQuery?.removeEventListener('change', onDesktopChange)
  document.removeEventListener('visibilitychange', onVisibility)
  canvas.value?.removeEventListener('webglcontextlost', onContextLost)
  stop()
})
</script>

<template>
  <!-- Decorative: the scene never carries information, so it is hidden from assistive tech. -->
  <div ref="root" :class="['sanctuary-scene', `is-${framing}`]" aria-hidden="true">
    <picture v-if="poster" class="sanctuary-poster">
      <source v-if="posterPortrait" media="(max-width: 700px)" :srcset="posterPortrait" />
      <img :src="poster" alt="" decoding="async" />
    </picture>
    <canvas ref="canvas" :class="['sanctuary-canvas', ready && 'is-ready']" />
    <!-- The host page announces new sculptures in its own live region; this label is the visual twin. -->
    <div
      v-if="label && live"
      ref="labelEl"
      class="sanctuary-label scrim rounded-control px-4 py-3"
      :style="labelPos ? { transform: `translate(${labelPos.x}px, ${labelPos.y}px)` } : { visibility: 'hidden' }"
    >
      <MuseumLabel :title="`${t('landing.sculptureLabel')} ${pad(seed)}`" :technique="t('landing.sculptureTechnique')" />
    </div>
    <div v-if="framing === 'background'" class="sanctuary-veil" />
  </div>
</template>

<style scoped>
.sanctuary-scene { position: absolute; inset: 0; overflow: hidden; }
.sanctuary-poster, .sanctuary-poster img, .sanctuary-canvas {
  position: absolute; inset: 0; width: 100%; height: 100%; display: block;
}
.sanctuary-poster img { object-fit: cover; object-position: 62% 50%; }
.is-small .sanctuary-poster img { object-position: 50% 50%; }
.sanctuary-canvas { opacity: 0; transition: opacity 0.2s linear; touch-action: manipulation; }
.sanctuary-canvas.is-ready { opacity: 1; }
.sanctuary-label { position: absolute; left: 0; top: 0; max-width: 16rem; pointer-events: none; }
/* Heavy veil so a form card on top always reads well (login). */
.sanctuary-veil {
  position: absolute; inset: 0;
  background: color-mix(in srgb, var(--dusk-sky-deep) 62%, transparent);
}
@media (prefers-reduced-motion: reduce) { .sanctuary-canvas { transition: none; } }
</style>
