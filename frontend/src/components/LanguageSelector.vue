<script setup lang="ts">
import type { PrototypeLocale } from '@/composables/usePrototypeLocale'
import { ChevronDown } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

const { locale, setLocale, t } = usePrototypeLocale()

const handleChange = (event: Event) => {
  setLocale((event.target as HTMLSelectElement).value as PrototypeLocale)
}
</script>

<template>
  <label class="language-selector">
    <span class="sr-only">{{ t('language.label') }}</span>
    <select
      :value="locale"
      :aria-label="t('language.label')"
      class="min-w-0 cursor-pointer appearance-none bg-transparent pr-6 text-small font-semibold outline-none"
      @change="handleChange"
    >
      <option value="ca">{{ t('language.ca') }}</option>
      <option value="es">{{ t('language.es') }}</option>
      <option value="en">{{ t('language.en') }}</option>
    </select>
    <ChevronDown aria-hidden="true" class="pointer-events-none -ml-7 size-4 shrink-0" />
  </label>
</template>
