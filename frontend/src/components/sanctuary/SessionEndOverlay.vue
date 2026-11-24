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
    <DuskLayout width="52rem" align="start">
      <template #scene><SanctuaryScene object="escultura" framing="background" /></template>
      <section class="scrim p-6 text-center sm:p-10" aria-labelledby="session-end-title">
        <p class="type-wordmark text-mark">ComfyMind</p>
        <h1 id="session-end-title" ref="heading" tabindex="-1" class="type-h1 mt-5 outline-offset-4">{{ t('sessionEnd.title') }}</h1>
        <p class="type-body measure mx-auto mt-2 text-muted-foreground">{{ t('sessionEnd.lede') }}</p>

        <hr class="flute-rule mx-auto my-8 max-w-xs" />

        <h2 class="type-h3">{{ t('sessionEnd.today') }}</h2>
        <ul v-if="artworks.length" class="mt-6 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
          <li v-for="art in artworks" :key="art.id" class="w-full max-w-[14rem]">
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

        <SButton :to="homeTo" class="mt-10" @click="emit('home')">{{ t('sessionEnd.home') }}</SButton>
      </section>
    </DuskLayout>
  </div>
</template>
