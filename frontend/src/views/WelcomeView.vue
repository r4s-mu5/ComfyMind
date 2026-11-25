<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { DuskLayout, MuseumLabel, SButton } from '@/components/sanctuary'
import SanctuaryScene from '@/components/sanctuary/SanctuaryScene.vue'
import { useComfort } from '@/composables/useComfort'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

// Landing (DESIGN.md §7): wordmark, one line, one sentence, one primary action.
// The text sits on a wall plaque: a flat, square-cut dusk panel (the same surface, edge and left line as the login
// panel, so "Comenzar" opens the door in the same place). The pale columns behind it would put bare text well
// under 7:1, and a blurred shade read as a smudge; the plaque is opaque enough that no shape ghosts through.
// It stays in the left ~45% of the screen so the sculpture (about 60% across) is always clear.
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

// Pin the label card beside the plinth's top corner, like a label on the wall next to a plinth: its top-left
// just right of the corner, hanging down along the plinth's side. Never over the plinth or the piece. When the corner
// is too close to the right edge for the card (narrow screens), the card goes to the right edge ABOVE the plinth:
// just above its top face (about 3 gaps deep on screen) if it clears the piece sideways (the piece ends about 6% of
// the width left of the corner), else higher, above the piece's head (about a fifth of the screen height up).
const card = ref<HTMLElement | null>(null)
const cardPos = ref<{ left: string; top: string } | null>(null)
function posterAnchor(): { x: number; y: number } {
  const W = window.innerWidth, H = window.innerHeight
  const p = window.matchMedia('(max-width: 700px)').matches ? POSTER.portrait : POSTER.landscape
  // object-fit: cover; object-position: 62% 50% (SanctuaryScene.vue)
  const s = Math.max(W / p.w, H / p.h)
  return { x: (W - p.w * s) * 0.62 + p.x * s, y: (H - p.h * s) * 0.5 + p.y * s }
}
const EDGE = 16, GAP = 16, TOP = 80 // TOP: below the language and Comfort controls
function placeCard() {
  const a = live.value ? scene.value?.anchor() : posterMode.value ? posterAnchor() : null
  if (!a) { cardPos.value = null; return }
  const W = window.innerWidth, H = window.innerHeight
  const w = card.value?.offsetWidth ?? 260, h = card.value?.offsetHeight ?? 120
  let x = a.x + GAP, y = a.y + 4
  if (x + w > W - EDGE) {
    x = W - w - EDGE
    y = x > a.x - 0.06 * W ? a.y - h - 3 * GAP : a.y - h - GAP - 0.22 * H
  }
  x = Math.max(EDGE, x)
  y = Math.min(H - h - EDGE, Math.max(TOP, y))
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
  <DuskLayout width="76rem" fit>
    <template #scene>
      <SanctuaryScene ref="scene" object="escultura" framing="landing" interactive @sculpture="onSculpture" @layout="onLayout" />
    </template>
    <template #top><LanguageSelector /></template>

    <!-- Phone: the plaque sits at the bottom so the scene stays visible above it. From md it is centred in the
         full height (DuskLayout fit) on the same left line as the login panel. -->
    <div class="flex min-h-[calc(100dvh-9rem)] items-end md:block md:min-h-0">
      <section class="plaque scrim w-full px-6 py-8 sm:px-10 sm:py-10" aria-labelledby="landing-title">
        <p class="type-wordmark text-mark">ComfyMind</p>
        <hr class="flute-rule mt-4 max-w-[8rem]" />
        <h1 id="landing-title" class="type-display plaque-display mt-8 text-balance">{{ t('landing.display') }}</h1>
        <p class="type-body mt-4 text-muted-foreground">{{ t('landing.lede') }}</p>
        <div class="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <SButton to="/login">{{ t('landing.begin') }}</SButton>
          <SButton to="/login?role=therapist" variant="quiet" class="!px-0 text-link underline">{{ t('landing.therapist') }}</SButton>
        </div>
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </section>
    </div>

    <!-- The sculpture's museum label, beside the plinth. Live: with the quiet way to ask for another piece
         (SanctuaryScene also places its "Parar el giro" control in this card, on the same row). Poster: the label alone. -->
    <aside
      v-if="labelSeed !== null"
      ref="card"
      class="sculpture-card scrim flex flex-wrap items-center gap-x-6 px-4 pt-3"
      :class="live ? 'pb-1' : 'pb-3'"
      :style="cardPos ?? { visibility: 'hidden' }"
      :aria-label="t('landing.sculptureLabel') + ' ' + pad(labelSeed)"
    >
      <MuseumLabel class="basis-full" :title="`${t('landing.sculptureLabel')} ${pad(labelSeed)}`" :technique="t('landing.sculptureTechnique')" />
      <SButton v-if="live" variant="quiet" size="compact" class="!min-h-14 !px-0 text-link underline" @click="another">
        {{ t('landing.another') }}
      </SButton>
    </aside>
  </DuskLayout>
</template>

<style scoped>
.sculpture-card { position: fixed; z-index: 20; width: max-content; max-width: 20rem; }

/* The wall plaque is cut from the night sky at the top of the screen (--dusk-sky-deep), one step deeper than the
   login panel's surface; the museum label card is the same material. On it the lilac wordmark and the teal link
   reach 7:1 even where the palest column is behind
   (measured against the worst background pixel, with the 3% the panel lets through). Square, hairline edge, no blur. */
.plaque.scrim, .sculpture-card.scrim { background: color-mix(in srgb, var(--dusk-sky-deep) 97%, transparent); }

/* From md it keeps to the left ~45% of the screen (its right edge lands at 44-46% from 1024 to
   1440 with DuskLayout's left line), so the sculpture, about 60% across, stays clear. */
@media (min-width: 768px) {
  .plaque { width: clamp(22rem, 33vw, 30rem); }
  /* the display line scales with the plaque, so TRANQUILO never breaks out of it */
  .plaque-display { font-size: clamp(1.75rem, 2.9vw, 2.625rem); }
}
</style>
