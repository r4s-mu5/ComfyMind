<script setup lang="ts">
/** Demo of <DuskLayout> for the style guide. Route: /design/dusk. */
import { SButton, DuskLayout } from '@/components/sanctuary'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

const { t } = usePrototypeLocale()
</script>

<template>
  <!-- Wall text directly on the sky: no scrim (scrim is only for forms). -->
  <DuskLayout>
    <div class="flex flex-col items-start gap-5">
      <p class="type-wordmark text-mark">{{ t('shell.wordmark') }}</p>
      <hr class="flute-rule w-32" />
      <h1 class="type-display text-balance">{{ t('landing.display') }}</h1>
      <p class="type-body measure text-muted-foreground">{{ t('landing.lede') }}</p>
      <div class="flex flex-wrap gap-3">
        <SButton>{{ t('landing.begin') }}</SButton>
        <SButton to="/design" variant="secondary">/design</SButton>
      </div>
    </div>
  </DuskLayout>
</template>
