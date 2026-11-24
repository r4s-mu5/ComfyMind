<script setup lang="ts">
import ComfortPanel from './ComfortPanel.vue'

/**
 * Threshold screens (landing, login, waiting, session end): a full-bleed dusk sky with mist,
 * grain and the sun disc. Everything inside is in dusk mode (class "dusk").
 *
 * Slots
 *   scene   optional full-bleed scene (e.g. <SanctuaryScene />), rendered above the sky, below the content
 *   top     extra controls in the top-right corner (next to the Comfort button)
 *   default centred content. Use `scrim` (or class="scrim") so text always sits on a 92% surface.
 */
interface Props {
  scrim?: boolean
  align?: 'center' | 'start'
  showComfort?: boolean
  /** max width of the content column, any CSS length */
  width?: string
}
withDefaults(defineProps<Props>(), { align: 'center', showComfort: true, width: '40rem' })
</script>

<template>
  <div class="dusk sky relative isolate flex min-h-screen flex-col overflow-hidden text-foreground">
    <div class="absolute inset-0 -z-10" aria-hidden="true">
      <div class="mist" />
      <div class="sun-disc is-breathing" />
      <div class="grain" />
    </div>
    <div v-if="$slots.scene" class="scene-3d absolute inset-0 -z-[5]"><slot name="scene" /></div>

    <div v-if="showComfort || $slots.top" class="relative z-10 flex flex-wrap items-center justify-end gap-3 px-4 py-4 sm:px-6">
      <slot name="top" />
      <ComfortPanel v-if="showComfort" variant="secondary" />
    </div>

    <main
      id="main"
      :class="['relative z-10 flex flex-1 flex-col items-center px-4 pb-16 sm:px-6', align === 'center' ? 'justify-center' : 'justify-start pt-8']"
    >
      <div :class="['w-full', scrim && 'scrim p-6 sm:p-10']" :style="{ maxWidth: width }">
        <slot />
      </div>
    </main>
  </div>
</template>
