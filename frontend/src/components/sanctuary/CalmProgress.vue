<script setup lang="ts">
import { computed } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/**
 * The waiting state: a dusk sun/mist visual, a thin honest progress bar and one status line
 * (announced politely to screen readers). It is its own dusk panel, so it works on dawn pages too.
 * `progress` is 0..1, or null/undefined for indeterminate. Put "cancel" in the `actions` slot.
 * Under Comfort > Motion off (or prefers-reduced-motion) everything is still; the bar stays honest.
 */
interface Props {
  progress?: number | null
  status?: string
  hint?: string
}
const props = defineProps<Props>()
const { t } = usePrototypeLocale()

const determinate = computed(() => typeof props.progress === 'number')
const pct = computed(() => Math.round(Math.min(1, Math.max(0, props.progress ?? 0)) * 100))
const statusText = computed(() => props.status ?? t('progress.onItsWay'))
</script>

<template>
  <div class="dusk relative isolate flex flex-col items-center gap-6 overflow-hidden rounded-none px-6 pb-40 pt-10 text-center">
    <div class="sky absolute inset-0 -z-10 [--horizon:14%] [--sun-size:8rem]" aria-hidden="true">
      <div class="mist" />
      <div class="sun-disc is-breathing" />
      <div class="dither" />
      <div class="grain" />
    </div>

    <p class="type-h2 text-foreground" aria-live="polite" aria-atomic="true">{{ statusText }}</p>

    <div
      role="progressbar"
      :aria-label="t('progress.label')"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="determinate ? pct : undefined"
      :aria-valuetext="determinate ? `${pct}%` : statusText"
      class="h-1.5 w-full max-w-sm overflow-hidden rounded-none bg-dusk-sky/70 ring-1 ring-dusk-border"
    >
      <div
        v-if="determinate"
        class="h-full rounded-none bg-dusk-light transition-[width] duration-700 ease-calm"
        :style="{ width: `${pct}%` }"
      />
      <div
        v-else
        class="calm-sweep h-full w-full rounded-none"
      />
    </div>

    <p class="type-small text-muted-foreground">{{ hint ?? t('progress.cancelHint') }}</p>
    <div v-if="$slots.actions"><slot name="actions" /></div>
  </div>
</template>
