<script setup lang="ts">
import { ref } from 'vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { DuskLayout, SButton } from '@/components/sanctuary'
import SanctuaryScene from '@/components/sanctuary/SanctuaryScene.vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

// Landing (DESIGN.md §7): wordmark, one line, one sentence, one primary action.
// The scene shows a generated marble sculpture; "Otra escultura" asks for another one (keyboard and
// screen readers use this button; a click on the scene itself does the same where it can be reached).
const { t } = usePrototypeLocale()
const scene = ref<InstanceType<typeof SanctuaryScene> | null>(null)
const announcement = ref('')
let asked = false
const pad = (n: number) => String(n).padStart(4, '0')
function another() {
  asked = true
  scene.value?.regenerate()
}
function onSculpture(seed: number) {
  if (!asked) return // the first sculpture is not announced
  announcement.value = `${t('landing.sculptureLabel')} ${pad(seed)}. ${t('landing.sculptureTechnique')}.`
}
</script>

<template>
  <DuskLayout width="76rem">
    <template #scene>
      <SanctuaryScene ref="scene" object="escultura" framing="landing" interactive label @sculpture="onSculpture" />
    </template>
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
        <SButton v-if="scene?.live" variant="quiet" class="mt-2 px-2 text-link underline" @click="another">
          {{ t('landing.another') }}
        </SButton>
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </section>
    </div>
  </DuskLayout>
</template>
