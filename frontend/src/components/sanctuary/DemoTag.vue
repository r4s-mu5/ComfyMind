<script setup lang="ts">
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/** Small persistent "Demo" chip. AppShell shows it automatically in demo mode. No banners. */
const { t } = usePrototypeLocale()
</script>

<template>
  <span
    class="type-small inline-flex items-center rounded-control border-[1.5px] border-border px-3 py-0.5 font-semibold text-muted-foreground"
    :title="t('demo.tooltip')"
  >
    {{ t('demo.tag') }}
  </span>
</template>
