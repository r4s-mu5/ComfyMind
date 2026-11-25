<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { DuskLayout, MuseumLabel, SButton } from '@/components/sanctuary'
import SanctuaryScene from '@/components/sanctuary/SanctuaryScene.vue'
import { useComfort } from '@/composables/useComfort'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

// Landing (DESIGN.md §7): wordmark, one line, one sentence, one primary action.
// The text is wall text on the sky (like the session end), with a soft local shade behind the text column only:
// the columns of the atrium are pale, so bare text on them would measure well under 7:1.
// The scene shows a generated marble sculpture. Its museum label is pinned beside the plinth and carries
// the quiet "Otra escultura" button (keyboard and screen readers use it; the text keeps one primary action).
// With the poster (3D off, phones, no WebGL) the label stays, with the poster's number, but without the button:
// there is nothing to regenerate.
const { t } = usePrototypeLocale()
const { state: comfort } = useComfort()
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

// The poster files (assets/sanctuary/poster-escultura*.jpg) show seed 0427. Where its plinth's front-right top
// corner sits in each file, in the poster's own CSS px (measured with the scene's anchor('plinth') when rendered).
const POSTER_SEED = 427
const POSTER = {
  landscape: { w: 1440, h: 900, x: 1220, y: 664 },
  portrait: { w: 390, h: 844, x: 315, y: 276 },
}
const live = computed(() => Boolean(scene.value?.live))
// Same rule as SanctuaryScene: 3D only with the Comfort toggle on and a desktop pointer. If 3D was wanted but
// never arrived (no WebGL), fall back to the poster label after a short wait.
const desktop = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px) and (hover: hover)').matches
const gaveUp = ref(false)
const posterMode = computed(() => !live.value && (!(comfort.scene3d && desktop) || gaveUp.value))
const labelSeed = computed(() => (live.value ? seed.value : posterMode.value ? POSTER_SEED : null))

// Pin the label card just right of the plinth's top corner, kept inside the viewport.
const card = ref<HTMLElement | null>(null)
const cardPos = ref<{ left: string; top: string } | null>(null)
function posterAnchor(): { x: number; y: number } {
  const W = window.innerWidth, H = window.innerHeight
  const p = window.matchMedia('(max-width: 700px)').matches ? POSTER.portrait : POSTER.landscape
  // object-fit: cover; object-position: 62% 50% (SanctuaryScene.vue)
  const s = Math.max(W / p.w, H / p.h)
  return { x: (W - p.w * s) * 0.62 + p.x * s, y: (H - p.h * s) * 0.5 + p.y * s }
}
function placeCard() {
  const a = live.value ? scene.value?.anchor() : posterMode.value ? posterAnchor() : null
  if (!a) { cardPos.value = null; return }
  const w = card.value?.offsetWidth ?? 260, h = card.value?.offsetHeight ?? 120
  const x = Math.min(window.innerWidth - w - 16, Math.max(16, a.x + 14))
  const y = Math.min(window.innerHeight - h - 16, Math.max(80, a.y + 6))
  cardPos.value = { left: `${Math.round(x)}px`, top: `${Math.round(y)}px` }
}
const onLayout = () => { void nextTick(placeCard) }
let wait: ReturnType<typeof setTimeout> | undefined
onMounted(() => {
  window.addEventListener('scroll', onLayout, { passive: true })
  window.addEventListener('resize', onLayout, { passive: true })
  wait = setTimeout(() => { gaveUp.value = true; onLayout() }, 4000)
  onLayout()
})
onBeforeUnmount(() => {
  clearTimeout(wait)
  window.removeEventListener('scroll', onLayout)
  window.removeEventListener('resize', onLayout)
})
</script>

<template>
  <DuskLayout width="76rem">
    <template #scene>
      <SanctuaryScene ref="scene" object="escultura" framing="landing" interactive @sculpture="onSculpture" @layout="onLayout" />
    </template>
    <template #top><LanguageSelector /></template>

    <!-- Phone: the text sits at the bottom so the scene stays visible above it. -->
    <div class="flex min-h-[calc(100dvh-9rem)] items-end sm:items-center">
      <section class="wall-text relative w-full max-w-[34rem] py-6 xl:ml-8 lg:max-w-[28rem] xl:max-w-[34rem]" aria-labelledby="landing-title">
        <p class="type-wordmark text-mark">ComfyMind</p>
        <hr class="flute-rule mt-5 max-w-[8rem]" />
        <h1 id="landing-title" class="type-display mt-8 text-balance">{{ t('landing.display') }}</h1>
        <p class="type-body measure mt-4 text-muted-foreground">{{ t('landing.lede') }}</p>
        <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <SButton to="/login">{{ t('landing.begin') }}</SButton>
          <SButton to="/login?role=therapist" variant="quiet" class="px-1 text-link underline">{{ t('landing.therapist') }}</SButton>
        </div>
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </section>
    </div>

    <!-- The sculpture's museum label, beside the plinth. Live: with the quiet way to ask for another piece
         (SanctuaryScene also places its "Parar el giro" control in this card). Poster: the label alone. -->
    <aside
      v-if="labelSeed !== null"
      ref="card"
      class="sculpture-card scrim rounded-none px-4 pb-2 pt-3"
      :class="!live && 'pb-3'"
      :style="cardPos ?? { visibility: 'hidden' }"
      :aria-label="t('landing.sculptureLabel') + ' ' + pad(labelSeed)"
    >
      <MuseumLabel :title="`${t('landing.sculptureLabel')} ${pad(labelSeed)}`" :technique="t('landing.sculptureTechnique')" />
      <SButton v-if="live" variant="quiet" size="compact" class="mt-1 px-0 text-link underline" @click="another">
        {{ t('landing.another') }}
      </SButton>
    </aside>
  </DuskLayout>
</template>

<style scoped>
.sculpture-card { position: fixed; z-index: 20; width: max-content; max-width: 19rem; }

/* A soft shade of the night sky behind the text column only (measured: text 7:1 or more over the pale columns).
   Solid under the text, then an eased fade past its right edge, above and below; open to the left edge of the
   screen, like dusk falling on the near wall. No box, no edge, no radius. --fade is shorter at 1024 so the
   sculpture on the right stays clear. */
.wall-text { --fade: 7rem; --shade: color-mix(in srgb, var(--dusk-sky-deep) 93%, transparent); }
@media (min-width: 1280px) { .wall-text { --fade: 13rem; } }
.wall-text::before {
  content: '';
  position: absolute;
  z-index: -1;
  pointer-events: none;
  top: -9rem;
  bottom: -9rem;
  left: -100vw;
  right: calc(-0.5rem - var(--fade));
  background: linear-gradient(90deg,
    var(--shade) 0,
    var(--shade) calc(100% - var(--fade)),
    color-mix(in srgb, var(--dusk-sky-deep) 62%, transparent) calc(100% - var(--fade) * 0.6),
    color-mix(in srgb, var(--dusk-sky-deep) 24%, transparent) calc(100% - var(--fade) * 0.25),
    transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, rgba(0,0,0,.45) 4rem, #000 9rem, #000 calc(100% - 9rem), rgba(0,0,0,.45) calc(100% - 4rem), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, rgba(0,0,0,.45) 4rem, #000 9rem, #000 calc(100% - 9rem), rgba(0,0,0,.45) calc(100% - 4rem), transparent 100%);
}
@media (max-width: 639px) {
  /* Phone: the text spans the width; shade the bottom band instead, fading upwards. */
  .wall-text::before { left: -1rem; right: -1rem; bottom: -4rem; background: color-mix(in srgb, var(--dusk-sky-deep) 90%, transparent);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 5rem); mask-image: linear-gradient(to bottom, transparent 0, #000 5rem); }
}
</style>
