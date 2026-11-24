<script setup lang="ts">
import { computed } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import SCard from './SCard.vue'

/**
 * A session: a date "leaf" (month, day and the status in a word: Now / Today / Next), time and therapist.
 * "Now" turns the leaf peach with a small sun dot; the word carries the state, never colour alone.
 * Put the single action in the `action` slot (e.g. <SButton>Entrar a la sesión</SButton>).
 */
interface Props {
  date: string | Date
  /** Display time, e.g. "17:00 – 18:00". Defaults to the time of `date`. */
  time?: string
  therapist?: string
  status?: 'now' | 'today' | 'next'
}
const props = defineProps<Props>()
const { t, locale } = usePrototypeLocale()

const d = computed(() => (props.date instanceof Date ? props.date : new Date(props.date)))
const month = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'short' }).format(d.value).replace('.', ''))
const day = computed(() => d.value.getDate())
const timeText = computed(() => props.time ?? new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(d.value))
const fullDate = computed(() => new Intl.DateTimeFormat(locale.value, { dateStyle: 'full' }).format(d.value))
</script>

<template>
  <SCard class="flex flex-wrap items-center gap-6">
    <div
      :class="[
        'flex min-h-24 w-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-control border-2 px-1 py-2 text-center',
        status === 'now' ? 'border-dawn-ink bg-dawn-sun text-dawn-ink' : 'border-input bg-card text-card-foreground',
      ]"
    >
      <span class="sr-only">{{ fullDate }}</span>
      <span class="type-label" aria-hidden="true">{{ month }}</span>
      <span class="font-display text-3xl leading-none" aria-hidden="true">{{ day }}</span>
      <span v-if="status" class="type-small mt-1 inline-flex items-center gap-1.5 font-semibold">
        <span v-if="status === 'now'" aria-hidden="true" class="size-2.5 rounded-full bg-dawn-ink" />
        {{ t(`session.${status}`) }}
      </span>
    </div>

    <div class="flex min-w-[12rem] flex-1 flex-col gap-1">
      <p class="type-h2">
        <time :datetime="d.toISOString()">{{ timeText }}</time>
      </p>
      <p v-if="therapist" class="type-body text-muted-foreground">{{ t('session.with', { name: therapist }) }}</p>
    </div>

    <div v-if="$slots.action" class="flex shrink-0 items-center"><slot name="action" /></div>
  </SCard>
</template>
