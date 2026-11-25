<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { DuskLayout, MuseumLabel, SButton } from '@/components/sanctuary'
import SanctuaryScene from '@/components/sanctuary/SanctuaryScene.vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

// Landing (DESIGN.md §7): wordmark, one line, one sentence, one primary action.
// The scene shows a generated marble sculpture. Its museum label is pinned beside the plinth and carries
// the quiet "Otra escultura" button (keyboard and screen readers use it; the panel keeps one primary action).
// Label and button only exist while the 3D scene is live; with the poster there is nothing to regenerate.
const { t } = usePrototypeLocale()
const scene = ref<InstanceType<typeof SanctuaryScene> | null>(null)
const announcement = ref('')
const seed = ref<number | null>(null)
let asked = false
const pad = (n: number) => String(n).padStart(4, '0')
function another() {
  asked = true
  scene.value?.regenerate()
}
function onSculpture(s: number) {
  seed.value = s
  if (!asked) return // the first sculpture is not announced
  announcement.value = `${t('landing.sculptureLabel')} ${pad(s)}. ${t('landing.sculptureTechnique')}.`
}

// Pin the label card just right of the plinth's top corner, kept inside the viewport.
const card = ref<HTMLElement | null>(null)
const cardPos = ref<{ left: string; top: string } | null>(null)
function placeCard() {
  const a = scene.value?.anchor()
  if (!a) { cardPos.value = null; return }
  const w = card.value?.offsetWidth ?? 260, h = card.value?.offsetHeight ?? 120
  const x = Math.min(window.innerWidth - w - 16, Math.max(16, a.x + 14))
  const y = Math.min(window.innerHeight - h - 16, Math.max(80, a.y + 6))
  cardPos.value = { left: `${Math.round(x)}px`, top: `${Math.round(y)}px` }
}
const onLayout = () => { void nextTick(placeCard) }
onMounted(() => window.addEventListener('scroll', onLayout, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onLayout))
</script>

<template>
  <DuskLayout width="76rem">
    <template #scene>
      <SanctuaryScene ref="scene" object="escultura" framing="landing" interactive @sculpture="onSculpture" @layout="onLayout" />
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
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </section>
    </div>

    <!-- The sculpture's museum label, beside the plinth, with the quiet way to ask for another piece. -->
    <aside
      v-if="scene?.live && seed !== null"
      ref="card"
      class="sculpture-card scrim rounded-control px-4 pb-2 pt-3"
      :style="cardPos ?? { visibility: 'hidden' }"
      :aria-label="t('landing.sculptureLabel') + ' ' + pad(seed)"
    >
      <MuseumLabel :title="`${t('landing.sculptureLabel')} ${pad(seed)}`" :technique="t('landing.sculptureTechnique')" />
      <SButton variant="quiet" size="compact" class="-ml-1 mt-1 px-1 text-link underline" @click="another">
        {{ t('landing.another') }}
      </SButton>
    </aside>
  </DuskLayout>
</template>

<style scoped>
.sculpture-card { position: fixed; z-index: 20; width: max-content; max-width: 19rem; }
</style>
