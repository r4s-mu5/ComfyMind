<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import ArtworkMount from './ArtworkMount.vue'
import DuskLayout from './DuskLayout.vue'
import SButton from './SButton.vue'
import SanctuaryScene from './SanctuaryScene.vue'

/**
 * Session end (DESIGN.md §7): a dusk screen that thanks the person and shows today's obras.
 * Mount it over the session when the demo engine / socket sends `session_ended`:
 *
 *   <SessionEndOverlay v-if="ended" :artworks="todayArtworks" name="Alex" @home="goHome" />
 *
 * Props
 *   artworks  today's obras: { id, src, title?, technique?, date? }[]
 *   name      who made them (shown on the museum labels)
 *   homeTo    where "Volver al inicio" goes (a router location). Also emits `home` on click.
 *   overlay   true (default) covers the whole page; false renders in the normal flow
 */
export interface SessionEndArtwork {
  id: string | number
  src: string
  title?: string
  technique?: string
  date?: string | Date
}
interface Props {
  artworks?: SessionEndArtwork[]
  name?: string
  homeTo?: string
  overlay?: boolean
}
withDefaults(defineProps<Props>(), { artworks: () => [], homeTo: '/home', overlay: true })
const emit = defineEmits<{ home: [] }>()
const { t } = usePrototypeLocale()

// Move focus to the heading so screen-reader and keyboard users land on the thank-you.
const heading = ref<HTMLElement | null>(null)
onMounted(async () => { await nextTick(); heading.value?.focus() })
</script>

<template>
  <div :class="overlay && 'fixed inset-0 z-50 overflow-y-auto'">
    <!-- Wall text on the dusk sky (no card): the thanks, the one way on, then today's obras hung small in a row. -->
    <DuskLayout width="46rem" align="start">
      <template #scene><SanctuaryScene object="escultura" framing="background" /></template>
      <section aria-labelledby="session-end-title">
        <p class="type-wordmark text-mark">ComfyMind</p>
        <h1 id="session-end-title" ref="heading" tabindex="-1" class="type-h1 mt-6 outline-offset-4">{{ t('sessionEnd.title') }}</h1>
        <p class="type-body measure mt-3 text-muted-foreground">{{ t('sessionEnd.lede') }}</p>
        <SButton :to="homeTo" class="mt-8" @click="emit('home')">{{ t('sessionEnd.home') }}</SButton>

        <hr class="flute-rule mb-6 mt-12 max-w-[20rem]" />
        <h2 class="type-label text-muted-foreground">{{ t('sessionEnd.today') }}</h2>
        <ul v-if="artworks.length" class="mt-6 flex flex-wrap items-start gap-x-8 gap-y-10" role="list">
          <li v-for="art in artworks" :key="art.id" class="w-[10.5rem]">
            <ArtworkMount
              :src="art.src"
              :title="art.title"
              :technique="art.technique"
              :date="art.date"
              :made-by="name"
              mat="sm"
            />
          </li>
        </ul>
        <p v-else class="type-body mt-4 text-muted-foreground">{{ t('sessionEnd.none') }}</p>
      </section>
    </DuskLayout>
  </div>
</template>
