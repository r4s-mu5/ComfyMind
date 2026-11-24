<script setup lang="ts">
import { FlaskConical } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/** Small persistent "Demo" chip. AppShell shows it automatically in demo mode. No banners. */
const { t } = usePrototypeLocale()
</script>

<template>
  <span
    class="type-small inline-flex items-center gap-1.5 rounded-pill border-2 border-input bg-card px-3 py-0.5 font-semibold text-card-foreground"
    :title="t('demo.tooltip')"
  >
    <FlaskConical aria-hidden="true" class="size-4" />
    {{ t('demo.tag') }}
  </span>
</template>
