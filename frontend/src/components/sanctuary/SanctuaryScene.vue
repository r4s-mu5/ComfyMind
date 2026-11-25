<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useComfort } from '@/composables/useComfort'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import SButton from './SButton.vue'

/**
 * The Sanctuary scene (DESIGN.md §5.3): a thin, safe wrapper around the 3D module.
 *
 *   1. It ALWAYS renders the poster first (or nothing, so the CSS dusk sky of DuskLayout shows).
 *   2. Only if Comfort allows 3D (toggle on, desktop pointer) does it load the 3D code,
 *      with a dynamic import, so `three` never reaches screens that do not need it.
 *   3. Motion off  -> the scene renders ONE still frame (the module gets `motion: false`).
 *      Motion on   -> on the landing the sculpture turns on its plinth (D14, one turn in 75 s), with a text
 *      control to stop it (WCAG 2.2.2). The control goes into the host's label card (`controlsTo`) when it
 *      exists, else it sits at the scene's bottom-right corner. Stopping holds the angle for the session.
 *   4. Any error (missing module, no WebGL, lost context) -> back to the poster.
 *
 * The scene itself (objects, post-FX at 1/4 resolution with strong dithering, the generative sculpture,
 * DPR cap, pause when hidden) lives in `./scene/sanctuaryScene.js` and is framework-agnostic.
 * The camera never moves; the only motion is the turntable and a short dissolve when a new sculpture appears.
 *
 * Props
 *   object       'escultura' | 'ruina' | 'estudio'   which abstract object to show
 *   framing      'landing' | 'background' | 'small'  camera framing; 'background' also adds a veil
 *   fx           pixelated render + dithering + grain
 *   seed         which generated sculpture (0..9999); default: one random seed per visit (sessionStorage)
 *   interactive  a click on the scene shows another sculpture (the host must ALSO offer a real button)
 *   turn         the sculpture turns on its plinth (default: landing framing only; never with motion off)
 *   controlsTo   CSS selector of the host's museum label card, where the stop/resume control is placed
 *
 * Emits `sculpture(seed)` whenever a sculpture is shown and `layout` when the scene is resized or reframed.
 * Exposes `regenerate(seed?)`, `live`, `seed` and `anchor()`: the plinth's front-right top corner in viewport
 * px, so the host can pin a museum label (and its "Otra escultura" button) beside the sculpture.
 */
interface Props {
  object?: 'escultura' | 'ruina' | 'estudio'
  framing?: 'landing' | 'background' | 'small'
  fx?: boolean
  seed?: number
  interactive?: boolean
  turn?: boolean
  controlsTo?: string
}
const props = withDefaults(defineProps<Props>(), {
  object: 'escultura', framing: 'landing', fx: true, interactive: false, turn: undefined, controlsTo: '.sculpture-card',
})
const emit = defineEmits<{ sculpture: [seed: number]; layout: [] }>()

const { state, motionOff } = useComfort()
const { t } = usePrototypeLocale()

// The turntable. Behind forms (background) and in small spots the sculpture stays still: motion there would
// pull the eye from the task. "Stopped" is remembered for the session, like the seed.
const TURN_KEY = 'comfymind.sculptureTurn'
const turnWanted = computed(() => (props.turn ?? props.framing === 'landing') && props.object === 'escultura')
const stopped = ref((() => { try { return sessionStorage.getItem(TURN_KEY) === 'stopped' } catch { return false } })())
const turning = computed(() => turnWanted.value && !stopped.value && !motionOff.value)
function toggleTurn() {
  stopped.value = !stopped.value
  try { sessionStorage.setItem(TURN_KEY, stopped.value ? 'stopped' : 'turning') } catch { /* private mode */ }
}

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
      turn: turnWanted.value && !stopped.value,
      onSculpture,
      onReady: () => { ready.value = true; void nextTick(() => { findControls(); emit('layout') }) },
    })
    if (gone || !allowed.value) { created.dispose(); return }
    handle = created
    if (typeof ResizeObserver !== 'undefined' && root.value) {
      resizeObserver = new ResizeObserver(() => { handle?.resize(); emit('layout') })
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
watch(() => turnWanted.value && !stopped.value, (turn) => handle?.setOptions({ turn }))
watch(() => [props.object, props.fx, props.framing] as const, ([object, fx, framing]) => { handle?.setOptions({ object, fx, framing }); emit('layout') })
watch(() => props.seed, (s) => { if (s !== undefined && s !== seed.value) handle?.regenerate(s) })

/** The plinth's front-right top corner in viewport px, or null while only the poster is shown. */
function anchor(): { x: number; y: number } | null {
  if (!handle || !ready.value || !root.value) return null
  const a = handle.anchor('plinth')
  if (!a) return null
  const r = root.value.getBoundingClientRect()
  return { x: r.left + a.x, y: r.top + a.y }
}
const live = computed(() => ready.value && props.object === 'escultura')

// Where the stop/resume control goes: into the host's label card once it is on screen, else in place.
const controlsHost = ref<HTMLElement | null>(null)
function findControls() {
  const el = props.controlsTo ? document.querySelector<HTMLElement>(props.controlsTo) : null
  if (el !== controlsHost.value) controlsHost.value = el
}
const showTurnControl = computed(() => live.value && turnWanted.value && !motionOff.value)
watch(showTurnControl, () => void nextTick(() => emit('layout')))

/** Show another sculpture. Returns the new seed, or null while only the poster is shown. */
function regenerate(next?: number): number | null {
  if (!handle || !ready.value) return null
  return handle.regenerate(next)
}
defineExpose({ regenerate, live, seed, anchor, turning, toggleTurn })

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
    <div v-if="framing === 'background'" class="sanctuary-veil" />
  </div>
  <!-- Stop/resume for the turntable (WCAG 2.2.2): words, not a media-player icon. Outside the aria-hidden layer. -->
  <Teleport v-if="showTurnControl" :to="controlsHost ?? 'body'" :disabled="!controlsHost">
    <div :class="['sanctuary-turn', !controlsHost && 'is-free scrim rounded-none px-3']">
      <SButton variant="quiet" size="compact" class="!min-h-14 !px-0 text-link underline" @click="toggleTurn">
        {{ turning ? t('landing.turnStop') : t('landing.turnResume') }}
      </SButton>
    </div>
  </Teleport>
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
/* Heavy veil so a form card on top always reads well (login). */
.sanctuary-veil {
  position: absolute; inset: 0;
  background: color-mix(in srgb, var(--dusk-sky-deep) 62%, transparent);
}
/* In the host's label card the control sits on its own line, under "Otra escultura", in the same quiet style
   but with the full 56px target. */
.sanctuary-turn { display: block; }
.sanctuary-turn.is-free { position: absolute; right: 1rem; bottom: 1rem; z-index: 20; }
@media (prefers-reduced-motion: reduce) { .sanctuary-canvas { transition: none; } }
</style>
