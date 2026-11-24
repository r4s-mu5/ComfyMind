<script setup lang="ts">
import LanguageSelector from '@/components/LanguageSelector.vue'
import { DuskLayout, SButton } from '@/components/sanctuary'
import SanctuaryScene from '@/components/sanctuary/SanctuaryScene.vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

// Landing (DESIGN.md §7): wordmark, one line, one sentence, one primary action.
const { t } = usePrototypeLocale()
</script>

<template>
  <DuskLayout width="76rem">
    <template #scene><SanctuaryScene object="escultura" framing="landing" /></template>
    <template #top><LanguageSelector /></template>

    <!-- Phone: the panel sits at the bottom so the scene stays visible above it. -->
    <div class="flex min-h-[calc(100dvh-9rem)] items-end sm:items-center">
      <section class="scrim w-full max-w-[34rem] !rounded-control p-6 sm:p-10 lg:ml-8" aria-labelledby="landing-title">
        <p class="type-wordmark text-mark">ComfyMind</p>
        <hr class="flute-rule mt-5 max-w-[8rem]" />
        <h1 id="landing-title" class="type-display mt-8 text-balance">{{ t('landing.display') }}</h1>
        <p class="type-body measure mt-4 text-muted-foreground">{{ t('landing.lede') }}</p>
        <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <SButton to="/login">{{ t('landing.begin') }}</SButton>
          <SButton to="/login?role=therapist" variant="quiet" class="px-2 text-link underline">{{ t('landing.therapist') }}</SButton>
        </div>
      </section>
    </div>
  </DuskLayout>
</template>
