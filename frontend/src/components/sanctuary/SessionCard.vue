<script setup lang="ts">
import { computed } from 'vue'
import { CalendarClock, Radio, Sun } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import SCard from './SCard.vue'

/**
 * A session: date "leaf" (month + day), time, therapist and a status chip (Now / Today / Next).
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
const chipIcon = { now: Radio, today: Sun, next: CalendarClock }
const chipClass = {
  now: 'bg-primary text-primary-foreground border-transparent',
  today: 'bg-secondary text-secondary-foreground border-input',
  next: 'bg-card text-card-foreground border-input',
}
</script>

<template>
  <SCard class="flex flex-wrap items-center gap-6">
    <div
      class="flex size-20 shrink-0 flex-col items-center justify-center rounded-card border-2 border-input bg-card text-card-foreground"
      aria-hidden="true"
    >
      <span class="type-small font-display uppercase tracking-[0.14em]">{{ month }}</span>
      <span class="font-display text-3xl leading-none">{{ day }}</span>
    </div>

    <div class="flex min-w-[12rem] flex-1 flex-col gap-1">
      <span
        v-if="status"
        :class="['type-small inline-flex w-fit items-center gap-2 rounded-pill border-2 px-3 py-0.5 font-semibold', chipClass[status]]"
      >
        <component :is="chipIcon[status]" aria-hidden="true" class="size-4" />
        {{ t(`session.${status}`) }}
      </span>
      <p class="type-h2">
        <time :datetime="d.toISOString()">{{ timeText }}</time>
      </p>
      <p v-if="therapist" class="type-body text-muted-foreground">{{ t('session.with', { name: therapist }) }}</p>
    </div>

    <div v-if="$slots.action" class="flex shrink-0 items-center"><slot name="action" /></div>
  </SCard>
</template>
