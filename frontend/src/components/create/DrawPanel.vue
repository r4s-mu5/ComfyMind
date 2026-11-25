<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { Brush, Check, Eraser } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { SButton } from '@/components/sanctuary'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * Way in "Dibujo": an inline paper canvas with large tools (brush / eraser, three sizes,
 * eight calm colours, undo, clear with a confirmation). Pointer Events: mouse, touch and stylus.
 * Strokes are kept as vectors, so undo simply redraws. Emits `create` with a PNG Blob.
 * Paint colours and the paper colour are CSS tokens (`--paint-*`, `--paper`, style.css B2 block).
 */
defineProps<{ busy?: boolean }>()
const emit = defineEmits<{ create: [blob: Blob] }>()
const description = defineModel<string>('description', { default: '' })
const { t } = usePrototypeLocale()
const descId = useId()

const W = 1200
const H = 900
const SIZES = { s: 6, m: 14, l: 30 } as const
type SizeKey = keyof typeof SIZES
const COLOURS = ['ink', 'blue', 'teal', 'sage', 'ochre', 'coral', 'rose', 'lilac'] as const
type ColourKey = (typeof COLOURS)[number]

interface Stroke { colour: string; size: number; erase: boolean; points: [number, number][] }

const canvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
const strokes = ref<Stroke[]>([])
let current: Stroke | null = null
const tool = ref<'brush' | 'eraser'>('brush')
const size = ref<SizeKey>('m')
const colour = ref<ColourKey>('ink')
const confirmClear = ref(false)
const hasDrawing = computed(() => strokes.value.some((s) => !s.erase))

const cssVar = (name: string, fallback: string) => {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  } catch {
    return fallback
  }
}
const paper = () => cssVar('--paper', 'white')
const paint = (key: ColourKey) => cssVar(`--paint-${key}`, 'black')

const drawStroke = (s: Stroke) => {
  if (!ctx || !s.points.length) return
  ctx.strokeStyle = s.erase ? paper() : s.colour
  ctx.fillStyle = ctx.strokeStyle
  ctx.lineWidth = s.size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (s.points.length === 1) {
    const [x, y] = s.points[0]
    ctx.beginPath()
    ctx.arc(x, y, s.size / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  ctx.beginPath()
  ctx.moveTo(...s.points[0])
  for (let i = 1; i < s.points.length; i++) ctx.lineTo(...s.points[i])
  ctx.stroke()
}

const redraw = () => {
  if (!ctx) return
  ctx.fillStyle = paper()
  ctx.fillRect(0, 0, W, H)
  strokes.value.forEach(drawStroke)
}

const pos = (e: PointerEvent): [number, number] => {
  const el = canvas.value!
  const r = el.getBoundingClientRect()
  return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height]
}

const down = (e: PointerEvent) => {
  if (e.button !== undefined && e.button > 0) return
  try { canvas.value?.setPointerCapture(e.pointerId) } catch { /* not supported */ }
  const erase = tool.value === 'eraser'
  current = { colour: paint(colour.value), size: SIZES[size.value] * (erase ? 1.6 : 1), erase, points: [pos(e)] }
  drawStroke(current)
}

const move = (e: PointerEvent) => {
  if (!current || !ctx) return
  const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e]
  const last = current.points[current.points.length - 1]
  ctx.strokeStyle = current.erase ? paper() : current.colour
  ctx.lineWidth = current.size
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(...last)
  for (const ev of events.length ? events : [e]) {
    const p = pos(ev)
    current.points.push(p)
    ctx.lineTo(...p)
  }
  ctx.stroke()
}

const up = () => {
  if (!current) return
  strokes.value = [...strokes.value, current]
  current = null
}

const undo = () => {
  if (!strokes.value.length) return
  strokes.value = strokes.value.slice(0, -1)
  redraw()
}

const clearAll = () => {
  strokes.value = []
  confirmClear.value = false
  redraw()
}

const onKey = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !(e.target as HTMLElement)?.closest('textarea,input')) {
    e.preventDefault()
    undo()
  }
}

// Size the paper so that, with the panel's top under the sticky header (where CreateView scrolls it),
// the whole sheet sits above the docked Crear row. Never smaller than 15rem.
const root = ref<HTMLElement | null>(null)
const dock = ref<HTMLElement | null>(null)
const paperH = ref<number | null>(null)
const fitPaper = () => {
  const r = root.value, c = canvas.value, d = dock.value
  if (!r || !c || !d) return
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const host = r.parentElement ? parseFloat(getComputedStyle(r.parentElement).paddingTop) || 0 : 0
  const above = c.getBoundingClientRect().top - r.getBoundingClientRect().top
  paperH.value = Math.max(15 * rem, Math.floor(window.innerHeight - 6 * rem - host - above - d.offsetHeight - 1.5 * rem))
}
let fitObserver: ResizeObserver | null = null

onMounted(() => {
  ctx = canvas.value?.getContext('2d') ?? null
  redraw()
  window.addEventListener('keydown', onKey)
  fitPaper()
  window.addEventListener('resize', fitPaper)
  if (typeof ResizeObserver !== 'undefined' && root.value) {
    fitObserver = new ResizeObserver(() => fitPaper())
    fitObserver.observe(root.value)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', fitPaper)
  fitObserver?.disconnect()
})

const submit = () => {
  if (!hasDrawing.value || !canvas.value) return
  canvas.value.toBlob((blob) => blob && emit('create', blob), 'image/png')
}

// Tools and sizes are underline chips (style.css .chip): selection = 3px rule + ✓ + bold, via aria-pressed.
const toolBtn = (active: boolean) => ['chip type-small inline-flex min-h-14 items-center gap-2 text-foreground', active ? 'font-bold' : 'font-medium']
</script>

<template>
  <div ref="root" class="flex flex-col gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="type-h2">{{ t('create.drawTitle') }}</h2>
      <p class="type-small text-muted-foreground">{{ t('create.drawHelp') }}</p>
    </div>

    <div class="flex flex-wrap items-center gap-x-12 gap-y-3">
      <div role="group" :aria-label="t('create.toolGroup')" class="flex gap-6">
        <button type="button" :class="toolBtn(tool === 'brush')" :aria-pressed="tool === 'brush'" @click="tool = 'brush'">
          <Brush aria-hidden="true" class="size-5" /> {{ t('create.toolBrush') }}
          <Check v-if="tool === 'brush'" aria-hidden="true" class="size-5" />
        </button>
        <button type="button" :class="toolBtn(tool === 'eraser')" :aria-pressed="tool === 'eraser'" @click="tool = 'eraser'">
          <Eraser aria-hidden="true" class="size-5" /> {{ t('create.toolEraser') }}
          <Check v-if="tool === 'eraser'" aria-hidden="true" class="size-5" />
        </button>
      </div>

      <div role="group" :aria-label="t('create.sizeGroup')" class="flex gap-6">
        <button
          v-for="k in (['s', 'm', 'l'] as SizeKey[])"
          :key="k"
          type="button"
          :class="toolBtn(size === k)"
          :aria-pressed="size === k"
          @click="size = k"
        >
          <span aria-hidden="true" class="inline-flex size-6 items-center justify-center">
            <span class="block rounded-full bg-foreground" :style="{ width: `${4 + SIZES[k] / 2}px`, height: `${4 + SIZES[k] / 2}px` }" />
          </span>
          {{ t(`create.size.${k}`) }}
          <Check v-if="size === k" aria-hidden="true" class="size-5" />
        </button>
      </div>
    </div>

    <!-- The palette beside the paper (two columns of colours), like paints next to a drawing board. -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <div role="radiogroup" :aria-label="t('create.colourGroup')" class="flex shrink-0 flex-wrap gap-3 sm:grid sm:grid-cols-2">
        <button
          v-for="c in COLOURS"
          :key="c"
          type="button"
          role="radio"
          :aria-checked="colour === c && tool === 'brush'"
          :aria-label="t(`create.colour.${c}`)"
          :title="t(`create.colour.${c}`)"
          :class="[
            'relative inline-flex size-14 items-center justify-center rounded-full border-2 transition-colors',
            colour === c && tool === 'brush' ? 'border-dawn-surface outline outline-[3px] outline-ring' : 'border-input',
          ]"
          :style="{ background: `var(--paint-${c})` }"
          @click="colour = c; tool = 'brush'"
        >
          <Check v-if="colour === c && tool === 'brush'" aria-hidden="true" class="size-6 text-dawn-surface drop-shadow" />
        </button>
      </div>

      <div class="paper-frame flex min-w-0 flex-1 justify-center rounded-none p-2">
        <canvas
          ref="canvas"
          :width="W"
          :height="H"
          role="img"
          :aria-label="hasDrawing ? t('create.canvasLabelDrawn') : t('create.canvasLabel')"
          class="block aspect-[4/3] w-full min-w-[min(100%,18rem)] cursor-crosshair touch-none rounded-none bg-paper"
          :style="paperH ? { maxWidth: `${Math.round((paperH * 4) / 3)}px` } : undefined"
          @pointerdown.prevent="down"
          @pointermove.prevent="move"
          @pointerup="up"
          @pointercancel="up"
          @lostpointercapture="up"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label :for="descId" class="type-body font-semibold">
        {{ t('create.drawDescLabel') }}
        <span class="type-small font-normal text-muted-foreground">{{ t('field.optional') }}</span>
      </label>
      <textarea
        :id="descId"
        v-model="description"
        rows="2"
        :placeholder="t('create.drawDescPlaceholder')"
        class="type-body w-full resize-y rounded-control border-2 border-input bg-card px-4 py-3 leading-relaxed text-foreground placeholder:text-muted-foreground"
      />
    </div>

    <!-- Crear docks to the bottom of the window while the panel is taller; the paper is sized to stay above it.
         Undo and clear live here too, so they are always in reach once there is something to undo. -->
    <div ref="dock" class="sticky bottom-0 z-10 -mx-6 border-t border-hairline bg-card px-6 pb-4 pt-4 sm:-mx-8 sm:px-8">
      <div class="flex flex-wrap items-center gap-4">
        <SButton :disabled="!hasDrawing" :busy="busy" @click="submit">{{ t('create.create') }}</SButton>
        <p v-if="!hasDrawing" class="type-small text-muted-foreground">{{ t('create.drawNeeded') }}</p>
        <div v-else class="ml-auto flex flex-wrap gap-3">
          <SButton variant="secondary" @click="undo">{{ t('create.undo') }}</SButton>
          <SButton variant="secondary" @click="confirmClear = true">{{ t('create.clear') }}</SButton>
        </div>
      </div>
    </div>

    <AlertDialog :open="confirmClear" @update:open="(v) => (confirmClear = v)">
      <AlertDialogContent class="rounded-none border-2 border-input p-8">
        <AlertDialogHeader>
          <AlertDialogTitle class="type-h2">{{ t('create.clearTitle') }}</AlertDialogTitle>
          <AlertDialogDescription class="type-body text-muted-foreground">{{ t('create.clearBody') }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter class="mt-4 gap-3">
          <SButton variant="secondary" @click="confirmClear = false">{{ t('create.clearKeep') }}</SButton>
          <SButton variant="danger" @click="clearAll">{{ t('create.clearConfirm') }}</SButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
