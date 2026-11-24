<script setup lang="ts">
/** Demo of <DuskLayout> for the style guide. Route: /design/dusk. */
import { SButton, DuskLayout } from '@/components/sanctuary'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

const { t } = usePrototypeLocale()
</script>

<template>
  <DuskLayout scrim>
    <div class="flex flex-col items-start gap-5">
      <p class="type-wordmark text-mark">{{ t('shell.wordmark') }}</p>
      <h1 class="type-display">{{ t('welcome.heading') }}</h1>
      <p class="type-body measure text-muted-foreground">{{ t('welcome.description') }}</p>
      <div class="flex flex-wrap gap-3">
        <SButton>{{ t('welcome.begin') }}</SButton>
        <SButton to="/design" variant="secondary">/design</SButton>
      </div>
    </div>
  </DuskLayout>
</template>
