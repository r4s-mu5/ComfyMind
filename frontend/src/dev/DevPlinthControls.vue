<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { useDevSettings } from './useDevSettings'

/**
 * Dev builds only: the nameplate and the two buttons set into the plinth (owner, meeting 2026-11-25).
 * The scene draws them (sanctuaryScene.js setPlinthControls); this layer keeps them usable without a mouse:
 * real <button>s, transparent, laid exactly over the 3D buttons, so keyboard and screen readers work and the
 * focus outline is drawn around the 3D button. While it is on, the landing's DOM label card is hidden
 * (html.dev-plinth-on, dev.css): the nameplate replaces it.
 */
const props = defineProps<{ scene: any; canvas: HTMLCanvasElement | null; turning: boolean; canTurn: boolean }>()
const emit = defineEmits<{ regenerate: []; toggleTurn: [] }>()

const { t, locale } = usePrototypeLocale()
const { settings } = useDevSettings()
const on = computed(() => settings.plinthControls)

type Name = 'regenerate' | 'pause'
interface Box { left: string; top: string; width: string; height: string }
const boxes = ref<Partial<Record<Name, Box>>>({})
const seed = ref<number | null>(null)
const announcement = ref('')
const pad = (n: number) => String(n).padStart(4, '0')
const title = computed(() => (seed.value === null ? '' : `${t('landing.sculptureLabel')} ${pad(seed.value)}`))

function push() {
  props.scene?.setPlinthControls({
    on: on.value,
    label: t('landing.sculptureLabel'),
    technique: t('landing.sculptureTechnique'),
    pause: props.canTurn ? (props.turning ? 'pause' : 'play') : null,
  })
  document.documentElement.classList.toggle('dev-plinth-on', on.value)
  measure()
}

// The 3D buttons only move when the window, the framing or the tuning changes; a light poll catches all three.
function measure() {
  const rects = on.value ? props.scene?.controlRects() : null
  seed.value = props.scene?.seed ?? null
  if (!rects || !props.canvas) { boxes.value = {}; return }
  const c = props.canvas.getBoundingClientRect()
  const next: Partial<Record<Name, Box>> = {}
  for (const name of ['regenerate', 'pause'] as Name[]) {
    const r = rects[name]
    if (!r) continue
    const size = Math.max(56, r.w, r.h) // the full 56 px target even where the stone button is smaller
    next[name] = {
      left: `${Math.round(c.left + r.x + r.w / 2 - size / 2)}px`,
      top: `${Math.round(c.top + r.y + r.h / 2 - size / 2)}px`,
      width: `${Math.round(size)}px`,
      height: `${Math.round(size)}px`,
    }
  }
  boxes.value = next
}

const state = (o: Record<string, Name | null>) => props.scene?.setControlState(o)
let pressTimer: ReturnType<typeof setTimeout> | undefined
function activate(name: Name, e: MouseEvent) {
  // keyboard activation still shows the stone button going in
  if (e.detail === 0) { state({ press: name }); clearTimeout(pressTimer); pressTimer = setTimeout(() => state({ press: null }), 160) }
  if (name === 'regenerate') {
    emit('regenerate')
    void nextTick(() => {
      seed.value = props.scene?.seed ?? null
      if (seed.value !== null) announcement.value = `${title.value}. ${t('landing.sculptureTechnique')}.`
    })
  } else emit('toggleTurn')
}

watch(() => [on.value, locale.value, props.turning, props.canTurn, props.scene], () => push())
let poll: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  push()
  poll = setInterval(measure, 250)
  window.addEventListener('resize', measure)
})
onBeforeUnmount(() => {
  clearInterval(poll); clearTimeout(pressTimer)
  window.removeEventListener('resize', measure)
  props.scene?.setPlinthControls({ on: false })
  document.documentElement.classList.remove('dev-plinth-on')
})
</script>

<template>
  <Teleport to="body">
    <div v-if="on" class="dev-plinth-layer">
      <p class="sr-only">{{ title }}. {{ t('landing.sculptureTechnique') }}.</p>
      <button
        v-for="name in (['regenerate', 'pause'] as const)"
        v-show="boxes[name]"
        :key="name"
        type="button"
        class="dev-plinth-btn"
        :style="boxes[name]"
        :title="name === 'regenerate' ? t('landing.another') : turning ? t('landing.turnStop') : t('landing.turnResume')"
        @pointerenter="state({ hover: name })"
        @pointerleave="state({ hover: null, press: null })"
        @pointerdown="state({ press: name })"
        @pointerup="state({ press: null })"
        @focus="state({ focus: name })"
        @blur="state({ focus: null })"
        @click="activate(name, $event)"
      >
        <span class="sr-only">{{ name === 'regenerate' ? t('landing.another') : turning ? t('landing.turnStop') : t('landing.turnResume') }}</span>
      </button>
      <p class="sr-only" aria-live="polite">{{ announcement }}</p>
    </div>
  </Teleport>
</template>

<style>
.dev-plinth-layer { position: fixed; inset: 0; z-index: 15; pointer-events: none; }
.dev-plinth-btn {
  position: fixed; pointer-events: auto; cursor: pointer;
  background: transparent; border: 0; padding: 0; border-radius: 50%;
}
.dev-plinth-btn:focus-visible { outline: 3px solid var(--dusk-focus, #FFE3A3); outline-offset: 2px; }
/* The nameplate replaces the DOM museum label card on the landing. */
html.dev-plinth-on .sculpture-card { display: none !important; }
</style>
