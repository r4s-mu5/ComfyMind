<script setup lang="ts">
import { nextTick, ref, useId } from 'vue'
import { Check } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { FRAME_SHAPES, type FrameShape } from './frames'

/**
 * "Marco": a quiet row of the frame shapes for an obra, each a small line drawing of the mount
 * and its name. A radio group (one tab stop, arrow keys move and choose, Home/End).
 * Selected follows the chip convention: a 3px rule under it, bold, and a check.
 * v-model is the frame; ArtworkMount above it takes the same value.
 */
const frame = defineModel<FrameShape>({ required: true })
const { t } = usePrototypeLocale()
const labelId = `frame-${useId()}`
const buttons = ref<HTMLButtonElement[]>([])

const move = async (from: number, step: number | 'first' | 'last') => {
  const n = FRAME_SHAPES.length
  const to = step === 'first' ? 0 : step === 'last' ? n - 1 : (from + step + n) % n
  frame.value = FRAME_SHAPES[to]
  await nextTick()
  buttons.value[to]?.focus()
}
const onKey = (e: KeyboardEvent, i: number) => {
  const map: Record<string, number | 'first' | 'last'> = {
    ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: 'first', End: 'last',
  }
  if (!(e.key in map)) return
  e.preventDefault()
  void move(i, map[e.key])
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <p :id="labelId" class="type-body text-muted-foreground">{{ t('frame.label') }}</p>
    <div role="radiogroup" :aria-labelledby="labelId" class="flex flex-wrap items-center gap-x-4 gap-y-3">
      <button
        v-for="(shape, i) in FRAME_SHAPES"
        :key="shape"
        ref="buttons"
        type="button"
        role="radio"
        :aria-checked="frame === shape"
        :tabindex="frame === shape ? 0 : -1"
        class="chip min-h-14 gap-2 text-base"
        @click="frame = shape"
        @keydown="onKey($event, i)"
      >
        <!-- Each drawing is the mount seen from the front: outline = mat or frame, tint = the picture. -->
        <svg viewBox="0 0 24 28" class="h-7 w-6 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <template v-if="shape === 'arch'">
            <path d="M3 27V11a9 9 0 0 1 18 0v16z" />
            <path d="M7 23V12a5 5 0 0 1 10 0v11z" fill="currentColor" fill-opacity=".2" stroke-width="1" />
          </template>
          <template v-else-if="shape === 'square'">
            <rect x="3" y="5" width="18" height="20" />
            <rect x="7" y="9" width="10" height="12" fill="currentColor" fill-opacity=".2" stroke-width="1" />
          </template>
          <template v-else-if="shape === 'pediment'">
            <path d="M2 9 12 3l10 6z" stroke-linejoin="miter" />
            <rect x="3" y="9" width="18" height="17" />
            <rect x="7" y="13" width="10" height="9" fill="currentColor" fill-opacity=".2" stroke-width="1" />
          </template>
          <template v-else-if="shape === 'oculus'">
            <rect x="3" y="5" width="18" height="18" />
            <circle cx="12" cy="14" r="5" fill="currentColor" fill-opacity=".2" stroke-width="1" />
          </template>
          <template v-else-if="shape === 'columns'">
            <path d="M1.5 4h4M2.5 4v21M4.5 4v21M1.5 25h4M18.5 4h4M19.5 4v21M21.5 4v21M18.5 25h4" stroke-width="1" />
            <rect x="7.5" y="4" width="9" height="21" />
            <rect x="9.5" y="9" width="5" height="11" fill="currentColor" fill-opacity=".2" stroke-width="1" />
          </template>
          <template v-else>
            <rect x="6" y="8" width="12" height="14" fill="currentColor" fill-opacity=".2" stroke-width="1" />
          </template>
        </svg>
        <span>{{ t(`frame.${shape}`) }}</span>
        <Check v-if="frame === shape" aria-hidden="true" class="size-4 shrink-0" />
      </button>
    </div>
  </div>
</template>
