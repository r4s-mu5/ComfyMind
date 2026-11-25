<script setup lang="ts">
import ComfortPanel from './ComfortPanel.vue'

/**
 * Threshold screens (landing, login, waiting, session end): the atrium at dusk. A full-bleed sky with a
 * horizon and a floor, a sun disc sitting on the horizon, low mist, a dither and grain. Everything inside
 * is in dusk mode (class "dusk"). Content is LEFT-aligned "wall text" directly on the upper sky;
 * use `scrim` only behind forms.
 *
 * Slots
 *   scene   optional full-bleed scene (e.g. <SanctuaryScene />), rendered above the sky, below the content
 *   top     extra controls in the top-right corner (next to the Comfort button)
 *   default content column. Add `scrim` (or class="scrim") behind forms so they sit on a 97% surface.
 *
 * `fit` (landing, login): from 768px wide the corner controls float over the sky instead of taking a row, and the
 * content column is centred in the full height, so a one-screen threshold never needs a scroll.
 */
interface Props {
  scrim?: boolean
  /** 'start' (default): left-aligned wall text on the upper sky. 'center': centred in the screen. */
  align?: 'center' | 'start'
  showComfort?: boolean
  /** max width of the content column, any CSS length */
  width?: string
  /** one screen, no scroll: controls float in the corner and the column is centred in the full height (md and up) */
  fit?: boolean
}
withDefaults(defineProps<Props>(), { align: 'start', showComfort: true, width: '40rem', fit: false })
</script>

<template>
  <div class="dusk sky relative isolate flex min-h-screen flex-col overflow-hidden text-foreground [--sun-x:70%] max-md:[--sun-x:50%]">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div class="mist" />
      <div class="sun-disc is-breathing" />
      <div class="dither" />
      <div class="grain" />
    </div>
    <div v-if="$slots.scene" class="scene-3d absolute inset-0 -z-[5]"><slot name="scene" /></div>

    <div
      v-if="showComfort || $slots.top"
      :class="['relative z-10 flex flex-wrap items-center justify-end gap-3 px-4 py-4 sm:px-6', fit && 'md:absolute md:inset-x-0 md:top-0 md:z-20 md:pointer-events-none md:[&>*]:pointer-events-auto']"
    >
      <slot name="top" />
      <ComfortPanel v-if="showComfort" variant="quiet" />
    </div>

    <main
      id="main"
      :class="[
        'relative z-10 flex flex-1 flex-col px-4 pb-16 sm:px-6',
        align === 'center' ? 'items-center justify-center' : 'items-start justify-start pt-8 md:pl-[clamp(1.5rem,12vw,10rem)]',
        align !== 'center' && (fit ? 'md:min-h-screen md:justify-center md:py-12' : 'md:pt-[8vh]'),
      ]"
    >
      <div :class="['w-full', scrim && 'scrim p-6 sm:p-10']" :style="{ maxWidth: width }">
        <slot />
      </div>
    </main>
  </div>
</template>
