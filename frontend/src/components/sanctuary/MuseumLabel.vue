<script setup lang="ts">
import { computed } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/**
 * Museum label under an artwork: title in Tenor caps ("Untitled" fallback via locale),
 * a technique line, a date and "Made by <name>".
 */
interface Props {
  title?: string
  technique?: string
  date?: string | Date
  madeBy?: string
  align?: 'start' | 'center'
}
const props = withDefaults(defineProps<Props>(), { align: 'start' })
const { t, locale } = usePrototypeLocale()

const heading = computed(() => props.title?.trim() || t('art.untitled'))
const parsed = computed(() => {
  if (!props.date) return null
  const d = props.date instanceof Date ? props.date : new Date(props.date)
  return Number.isNaN(d.getTime()) ? null : d
})
const dateText = computed(() => {
  if (!props.date) return ''
  if (!parsed.value) return String(props.date)
  const d = parsed.value
  return new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
})
const byline = computed(() => (props.madeBy ? t('art.madeBy', { name: props.madeBy }) : ''))
</script>

<template>
  <div :class="['flex flex-col gap-1', align === 'center' ? 'items-center text-center' : 'items-start text-left']">
    <p class="type-label text-foreground">{{ heading }}</p>
    <p v-if="technique" class="type-small text-muted-foreground">{{ technique }}</p>
    <!-- Date and maker on their own lines, as on a museum label: nothing dangles when the mount is narrow. -->
    <p v-if="dateText" class="type-small text-muted-foreground">
      <time :datetime="parsed?.toISOString()">{{ dateText }}</time>
    </p>
    <p v-if="byline" class="type-small text-muted-foreground">{{ byline }}</p>
  </div>
</template>
