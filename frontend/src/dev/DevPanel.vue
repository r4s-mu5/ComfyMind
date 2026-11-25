<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Router } from 'vue-router'
import { useComfort, type TextSize } from '@/composables/useComfort'
import { usePrototypeLocale, type PrototypeLocale } from '@/composables/usePrototypeLocale'
import { PALETTES } from '@/theme/palettes'
import DevRange from './DevRange.vue'
import { mainScene, scenes } from './sceneBridge'
import { ASSET_NAMES, cleanFx, defaultFx, paletteScene, useDevSettings } from './useDevSettings'

/**
 * The dev panel (dev builds only, `--mode demodev`): live post-FX, 3D assets, palette, comfort shortcuts and
 * look snapshots, so the owner can adjust the scene in a meeting and screenshot each preference.
 * Not user-facing: it looks like a plain tool on purpose (system monospace, neutral greys, outside the
 * design tokens). Toggle with the "Dev" tab or Shift+D.
 */
const props = defineProps<{ router: Router }>()

const dev = useDevSettings()
const { settings, snapshots } = dev
const tuning = computed(() => settings.tuning)
const comfort = useComfort()
const { locale, setLocale } = usePrototypeLocale()

/* open / close: the tab, Shift+D (not while typing), Escape inside the panel */
const panel = ref<HTMLElement | null>(null)
const tab = ref<HTMLButtonElement | null>(null)
const typing = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
function toggle(focus = true) {
  settings.open = !settings.open
  if (focus) requestAnimationFrame(() => (settings.open ? panel.value?.focus() : tab.value?.focus()))
}
function onKey(e: KeyboardEvent) {
  if (e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && e.code === 'KeyD' && !typing(e.target)) { e.preventDefault(); toggle() }
}

/* status line: route, viewport, FPS (page and scene) */
const route = computed(() => props.router.currentRoute.value.fullPath)
const viewport = ref('')
const fps = ref(0)
const sceneFps = ref(0)
const seed = ref<number | null>(null)
let raf = 0, count = 0, t0 = 0, lastFrames = 0
function loop(now: number) {
  count++
  if (now - t0 >= 1000) {
    const s = mainScene()
    const frames = s?.handle?.frames ?? 0
    fps.value = Math.round((count * 1000) / (now - t0))
    sceneFps.value = Math.max(0, Math.round(((frames - lastFrames) * 1000) / (now - t0)))
    seed.value = s?.handle?.seed ?? null
    lastFrames = frames; count = 0; t0 = now
  }
  raf = requestAnimationFrame(loop)
}
const onResize = () => { viewport.value = `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x` }
watch(() => settings.open, (o) => { cancelAnimationFrame(raf); if (o) { t0 = performance.now(); raf = requestAnimationFrame(loop) } }, { immediate: true })

/* <html> classes: the GUI palette (D2's CSS) and "Hide UI" */
watch(() => settings.paletteId, (id) => {
  const cl = document.documentElement.classList
  ;[...cl].filter(c => c.startsWith('palette-')).forEach(c => cl.remove(c))
  cl.add(`palette-${id}`)
}, { immediate: true })
watch(() => settings.hideUi, (h) => document.documentElement.classList.toggle('dev-hide-ui', h), { immediate: true })

/* sculpture */
const seedInput = ref<number | null>(null)
function showSeed(s: number | null) {
  if (s === null || !Number.isFinite(s)) return
  settings.tuning.seed = s
  for (const sc of scenes) sc.handle?.regenerate?.(s)
}
const randomSeed = () => showSeed(Math.floor(Math.random() * 10000))
function unpinSeed() { settings.tuning.seed = null }

/* screenshot of the scene canvas (no DOM text: html-to-image is not in the project) */
const status = ref('')
function screenshot() {
  const s = mainScene()
  if (!s) { status.value = 'No 3D scene on this page.'; return }
  const url = s.handle.snapshot('image/png')
  if (!url) { status.value = 'The scene could not be captured.'; return }
  const a = document.createElement('a')
  const name = route.value.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'landing'
  a.href = url; a.download = `comfymind-${name}-${settings.paletteId}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '')}.png`
  a.click()
  status.value = `Saved ${a.download}`
}

/* copy / paste / reset / snapshots */
const pasteText = ref('')
async function copyJson() {
  const text = JSON.stringify(dev.look(), null, 2)
  try { await navigator.clipboard.writeText(text); status.value = 'Settings copied as JSON.' } catch {
    pasteText.value = text; status.value = 'Clipboard blocked: the JSON is in the box below.'
  }
}
function pasteJson() {
  try { status.value = dev.applyLook(JSON.parse(pasteText.value)) ? 'Settings applied.' : 'That JSON is not a dev look.' } catch { status.value = 'That is not valid JSON.' }
}
function resetAll() { if (window.confirm('Reset every dev setting to today\'s look?')) { dev.resetAll(); status.value = 'Reset to defaults.' } }
const save = () => { status.value = `Saved snapshot ${dev.saveSnapshot()}.` }

const PATTERNS = [['bayer4', 'Bayer 4×4'], ['bayer8', 'Bayer 8×8'], ['none', 'None (posterise)']]
const PIXELS = [1, 2, 3, 4, 5, 6, 8]
const ASSET_LABELS: Record<string, string> = {
  object: 'Object (plinth + sculpture)', sculpture: 'Sculpture', plinth: 'Plinth', shadow: 'Contact shadow',
  colonnadeLeft: 'Colonnade left', colonnadeRight: 'Colonnade right', floor: 'Floor', sky: 'Sky', sun: 'Sun disc',
}
const PALETTE_KEYS = ['skyTop', 'skyMid', 'skyLow', 'horizon', 'sun', 'marble', 'marbleShadow', 'fog'] as const
const sun = (n: string) => n === 'sun'
const resetPaletteColours = () => { settings.tuning.palette = paletteScene(settings.paletteId) }

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  onResize()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="dev-root">
    <button v-if="!settings.open" ref="tab" type="button" class="dev-tab" title="Dev panel (Shift+D)" @click="toggle()">Dev</button>

    <aside v-else ref="panel" class="dev-panel" tabindex="-1" aria-label="Dev panel" @keydown.esc="toggle()">
      <header class="dev-head">
        <strong>Dev panel</strong>
        <span class="dev-muted">Shift+D</span>
        <button type="button" class="dev-btn dev-close" @click="toggle()">Close</button>
      </header>
      <dl class="dev-status">
        <div><dt>Route</dt><dd>{{ route }}</dd></div>
        <div><dt>Viewport</dt><dd>{{ viewport }}</dd></div>
        <div><dt>FPS</dt><dd>page {{ fps }} · scene {{ sceneFps }} ({{ scenes.size }} live)</dd></div>
        <div><dt>Seed</dt><dd>{{ seed ?? '–' }}</dd></div>
      </dl>
      <div class="dev-actions">
        <label class="dev-check"><input v-model="settings.hideUi" type="checkbox" /> Hide UI</label>
        <button type="button" class="dev-btn" @click="screenshot">Screenshot</button>
        <button type="button" class="dev-btn" @click="save">Save snapshot</button>
      </div>
      <p v-if="status" class="dev-muted dev-status-msg" role="status">{{ status }}</p>

      <details :open="settings.sections.fx" @toggle="settings.sections.fx = ($event.target as HTMLDetailsElement).open">
        <summary>Post-FX</summary>
        <div class="dev-actions">
          <button type="button" class="dev-btn" @click="defaultFx(settings.tuning)">Default</button>
          <button type="button" class="dev-btn" @click="cleanFx(settings.tuning)">Clean (no FX)</button>
        </div>
        <div class="dev-row">
          <label for="dev-px">Pixel scale</label>
          <select id="dev-px" v-model.number="settings.tuning.pixelScale">
            <option v-for="p in PIXELS" :key="p" :value="p">{{ p === 1 ? '1/1 (full res)' : `1/${p}` }}</option>
          </select>
        </div>
        <label class="dev-check"><input v-model="settings.tuning.dither" type="checkbox" /> Dither / quantise</label>
        <div class="dev-row">
          <label for="dev-pat">Pattern</label>
          <select id="dev-pat" v-model="settings.tuning.ditherPattern" :disabled="!tuning.dither">
            <option v-for="[v, l] in PATTERNS" :key="v" :value="v">{{ l }}</option>
          </select>
        </div>
        <DevRange v-model="settings.tuning.ditherStrength" label="Dither strength" :min="0" :max="1" :disabled="!tuning.dither" />
        <DevRange v-model="settings.tuning.levels" label="Colour levels" :min="2" :max="32" :step="1" :disabled="!tuning.dither" />
        <label class="dev-check"><input v-model="settings.tuning.grain" type="checkbox" /> Grain</label>
        <DevRange v-model="settings.tuning.grainAmount" label="Grain amount" :min="0" :max="3" :disabled="!tuning.grain" />
        <DevRange v-model="settings.tuning.vignette" label="Vignette" :min="0" :max="1" />
        <DevRange v-model="settings.tuning.fog" label="Fog / haze" :min="0" :max="4" />
        <DevRange v-model="settings.tuning.exposure" label="Exposure" :min="0.3" :max="2" />
        <DevRange v-model="settings.tuning.light.key" label="Key light" :min="0" :max="3" />
        <DevRange v-model="settings.tuning.light.fill" label="Fill (sky) light" :min="0" :max="3" />
        <DevRange v-model="settings.tuning.light.back" label="Back light" :min="0" :max="3" />
      </details>

      <details :open="settings.sections.sculpture" @toggle="settings.sections.sculpture = ($event.target as HTMLDetailsElement).open">
        <summary>Sculpture and turntable</summary>
        <div class="dev-row">
          <label for="dev-seed">Seed</label>
          <input id="dev-seed" v-model.number="seedInput" type="number" min="0" max="9999" :placeholder="String(seed ?? '')" @keydown.enter="showSeed(seedInput)" />
          <button type="button" class="dev-btn" @click="showSeed(seedInput)">Show</button>
        </div>
        <div class="dev-actions">
          <button type="button" class="dev-btn" @click="randomSeed">Random</button>
          <button v-if="tuning.seed !== null" type="button" class="dev-btn" @click="unpinSeed">Unpin {{ tuning.seed }}</button>
          <span class="dev-muted">{{ tuning.seed !== null ? 'Pinned on every page' : 'Not pinned' }}</span>
        </div>
        <label class="dev-check"><input v-model="settings.tuning.turntable" type="checkbox" /> Turntable</label>
        <DevRange v-model="settings.tuning.turnSeconds" label="Seconds per turn" :min="10" :max="240" :step="1" :disabled="!tuning.turntable" />
      </details>

      <details :open="settings.sections.plinth" @toggle="settings.sections.plinth = ($event.target as HTMLDetailsElement).open">
        <summary>Plinth controls</summary>
        <label class="dev-check"><input v-model="settings.plinthControls" type="checkbox" /> Nameplate and buttons on the plinth (landing)</label>
        <p class="dev-muted">Replaces the museum label card. Off: the card and its text buttons come back.</p>
      </details>

      <details :open="settings.sections.assets" @toggle="settings.sections.assets = ($event.target as HTMLDetailsElement).open">
        <summary>3D assets</summary>
        <p class="dev-muted">Offsets from each asset's place, in metres and degrees.</p>
        <details v-for="n in ASSET_NAMES" :key="n" class="dev-sub">
          <summary>
            {{ ASSET_LABELS[n] ?? n }}
            <span v-if="!tuning.assets[n].visible" class="dev-muted">(hidden)</span>
          </summary>
          <div class="dev-actions">
            <label class="dev-check"><input v-model="settings.tuning.assets[n].visible" type="checkbox" /> Visible</label>
            <button type="button" class="dev-btn" @click="dev.resetAsset(n)">Reset</button>
          </div>
          <template v-if="n !== 'sky'">
            <DevRange v-model="settings.tuning.assets[n].x" :label="sun(n) ? 'Direction x' : 'Position x'" :min="sun(n) ? -1 : -3" :max="sun(n) ? 1 : 3" />
            <DevRange v-model="settings.tuning.assets[n].y" :label="sun(n) ? 'Direction y' : 'Position y'" :min="sun(n) ? -0.3 : -2" :max="sun(n) ? 1 : 2" />
            <template v-if="!sun(n)">
              <DevRange v-model="settings.tuning.assets[n].z" label="Position z" :min="-4" :max="3" />
              <DevRange v-model="settings.tuning.assets[n].rotY" label="Rotation y°" :min="-180" :max="180" :step="1" />
            </template>
            <DevRange v-model="settings.tuning.assets[n].scale" :label="sun(n) ? 'Size' : 'Scale'" :min="0.2" :max="3" />
          </template>
        </details>
      </details>

      <details :open="settings.sections.palette" @toggle="settings.sections.palette = ($event.target as HTMLDetailsElement).open">
        <summary>Palette</summary>
        <fieldset class="dev-fieldset">
          <legend class="sr-only">Palette</legend>
          <label v-for="p in PALETTES" :key="p.id" class="dev-palette" :title="p.description">
            <input type="radio" name="dev-palette" :value="p.id" :checked="settings.paletteId === p.id" @change="dev.selectPalette(p.id)" />
            <span class="dev-swatches" aria-hidden="true">
              <i v-for="k in ['skyTop', 'skyMid', 'skyLow', 'horizon', 'marble', 'marbleShadow'] as const" :key="k" :style="{ background: p.scene[k] }" />
            </span>
            {{ p.name }}
          </label>
        </fieldset>
        <fieldset class="dev-fieldset dev-inline">
          <legend>Screen (Comfort → Pantalla)</legend>
          <label class="dev-check"><input type="radio" name="dev-theme" :checked="!comfort.dark.value" @change="comfort.setTheme('light')" /> Light</label>
          <label class="dev-check"><input type="radio" name="dev-theme" :checked="comfort.dark.value" @change="comfort.setTheme('dark')" /> Dark</label>
        </fieldset>
        <details class="dev-sub">
          <summary>Scene colours (this palette, edited)</summary>
          <div v-for="k in PALETTE_KEYS" :key="k" class="dev-row">
            <label :for="`dev-c-${k}`">{{ k }}</label>
            <input :id="`dev-c-${k}`" v-model="settings.tuning.palette[k]" type="color" />
            <code>{{ settings.tuning.palette[k] }}</code>
          </div>
          <button type="button" class="dev-btn" @click="resetPaletteColours">Reset colours</button>
        </details>
      </details>

      <details :open="settings.sections.comfort" @toggle="settings.sections.comfort = ($event.target as HTMLDetailsElement).open">
        <summary>Comfort shortcuts</summary>
        <div class="dev-row">
          <label for="dev-text">Text size</label>
          <select id="dev-text" :value="comfort.state.textSize" @change="comfort.setTextSize(Number(($event.target as HTMLSelectElement).value) as TextSize)">
            <option :value="100">100 %</option><option :value="125">125 %</option><option :value="150">150 %</option>
          </select>
        </div>
        <label class="dev-check"><input type="checkbox" :checked="!comfort.motionOff.value" @change="comfort.setMotion(($event.target as HTMLInputElement).checked ? 'on' : 'off')" /> Motion</label>
        <label class="dev-check"><input type="checkbox" :checked="comfort.state.scene3d" @change="comfort.setScene3d(($event.target as HTMLInputElement).checked)" /> 3D scene</label>
        <div class="dev-row">
          <label for="dev-lang">Language</label>
          <select id="dev-lang" :value="locale" @change="setLocale(($event.target as HTMLSelectElement).value as PrototypeLocale)">
            <option value="es">ES</option><option value="ca">CA</option><option value="en">EN</option>
          </select>
        </div>
      </details>

      <details :open="settings.sections.settings" @toggle="settings.sections.settings = ($event.target as HTMLDetailsElement).open">
        <summary>Snapshots and JSON</summary>
        <div class="dev-actions">
          <button type="button" class="dev-btn" @click="save">Save snapshot</button>
          <button type="button" class="dev-btn" @click="copyJson">Copy settings JSON</button>
          <button type="button" class="dev-btn" @click="resetAll">Reset all</button>
        </div>
        <ul v-if="snapshots.length" class="dev-snaps">
          <li v-for="s in snapshots" :key="s.name">
            <strong>{{ s.name }}</strong>
            <span class="dev-muted">{{ s.look.paletteId }} · 1/{{ s.look.tuning.pixelScale }} · {{ s.savedAt.slice(11, 16) }}</span>
            <button type="button" class="dev-btn" @click="dev.loadSnapshot(s.name)">Apply</button>
            <button type="button" class="dev-btn" :aria-label="`Delete snapshot ${s.name}`" @click="dev.deleteSnapshot(s.name)">Delete</button>
          </li>
        </ul>
        <p v-else class="dev-muted">No snapshots yet.</p>
        <label for="dev-paste" class="dev-muted">Paste settings JSON</label>
        <textarea id="dev-paste" v-model="pasteText" rows="4" spellcheck="false" />
        <button type="button" class="dev-btn" @click="pasteJson">Apply JSON</button>
      </details>
    </aside>
  </div>
</template>

<style>
/* Dev tool only: deliberately outside the design tokens, so it never reads as part of the product. */
.dev-root { font: 12.5px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: #e4e4e7; }
.dev-tab {
  position: fixed; right: 0; bottom: 12px; z-index: 1000; padding: 6px 10px;
  font: inherit; color: #e4e4e7; background: #27272a; border: 1px solid #52525b; border-right: 0; cursor: pointer;
}
.dev-panel {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 1000; width: min(360px, 100vw); overflow-y: auto;
  padding: 10px 12px 24px; background: #18181b; border-left: 1px solid #3f3f46; box-shadow: -2px 0 12px rgb(0 0 0 / 0.35);
  font: inherit; color: #e4e4e7; text-align: left;
}
.dev-panel:focus { outline: none; }
.dev-root :focus-visible { outline: 2px solid #fde68a; outline-offset: 1px; }
.dev-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.dev-close { margin-left: auto; }
.dev-muted { color: #a1a1aa; }
.dev-status { display: grid; gap: 1px; margin: 0 0 8px; }
.dev-status div { display: flex; gap: 8px; }
.dev-status dt { width: 64px; color: #a1a1aa; flex: none; }
.dev-status dd { margin: 0; overflow-wrap: anywhere; }
.dev-status-msg { margin: 4px 0 8px; }
.dev-panel details { border-top: 1px solid #3f3f46; padding: 6px 0; }
.dev-panel summary { cursor: pointer; font-weight: 700; padding: 2px 0; }
.dev-panel .dev-sub { border-top: 1px dashed #3f3f46; margin-left: 8px; }
.dev-panel .dev-sub summary { font-weight: 400; }
.dev-row { display: grid; grid-template-columns: 112px 1fr 64px; align-items: center; gap: 6px; margin: 3px 0; }
.dev-row input[type='range'] { width: 100%; accent-color: #d4d4d8; }
.dev-row select, .dev-row input[type='number'], .dev-row input[type='color'], .dev-panel textarea {
  font: inherit; color: #e4e4e7; background: #27272a; border: 1px solid #52525b; padding: 2px 4px; min-width: 0;
}
.dev-row select { grid-column: span 2; }
.dev-num { width: 64px; }
.dev-row code { font: inherit; color: #a1a1aa; }
.dev-check { display: flex; align-items: center; gap: 6px; margin: 3px 0; cursor: pointer; }
.dev-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 4px 0; }
.dev-btn { font: inherit; color: #e4e4e7; background: #27272a; border: 1px solid #52525b; padding: 3px 8px; cursor: pointer; }
.dev-btn:hover { background: #3f3f46; }
.dev-fieldset { border: 0; padding: 0; margin: 4px 0; }
.dev-fieldset legend { color: #a1a1aa; padding: 0; }
.dev-inline { display: flex; gap: 12px; flex-wrap: wrap; }
.dev-palette { display: flex; align-items: center; gap: 8px; margin: 3px 0; cursor: pointer; }
.dev-swatches { display: inline-flex; border: 1px solid #52525b; }
.dev-swatches i { width: 14px; height: 14px; display: block; }
.dev-snaps { list-style: none; padding: 0; margin: 4px 0; display: grid; gap: 4px; }
.dev-snaps li { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.dev-panel textarea { width: 100%; margin: 4px 0; resize: vertical; }

/* "Hide UI": only the 3D scene stays (for clean screenshots). */
html.dev-hide-ui #app * { visibility: hidden !important; }
html.dev-hide-ui #app .scene-3d, html.dev-hide-ui #app .scene-3d * { visibility: visible !important; }
html.dev-hide-ui .sanctuary-turn { visibility: hidden !important; }
</style>
