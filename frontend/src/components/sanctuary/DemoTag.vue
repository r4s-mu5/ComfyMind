<script setup lang="ts">
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/** The word "Demo" next to the wordmark, as plain text: no box, no pill, no banner. AppShell shows it in demo mode. */
const { t } = usePrototypeLocale()
</script>

<template>
  <span
    class="type-small font-semibold text-muted-foreground"
    :title="t('demo.tooltip')"
  >
    {{ t('demo.tag') }}
  </span>
</template>
