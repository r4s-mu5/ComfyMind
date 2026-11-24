<script setup lang="ts">
import { computed } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import MuseumLabel from './MuseumLabel.vue'

/**
 * An artwork on a white marble mat with a museum label below. The artwork is the strongest
 * colour on any screen: keep everything around it quiet.
 * `niche` gives the mat an arch top (use for the featured piece). `mat`: sm 16px, md 24px, lg 32px.
 */
interface Props {
  src: string
  alt?: string
  title?: string
  technique?: string
  date?: string | Date
  madeBy?: string
  niche?: boolean
  mat?: 'sm' | 'md' | 'lg'
  /** CSS aspect-ratio of the image window, e.g. "1 / 1", "4 / 3". */
  ratio?: string
  label?: boolean
  loading?: 'lazy' | 'eager'
}
const props = withDefaults(defineProps<Props>(), { mat: 'md', ratio: '1 / 1', label: true, loading: 'lazy' })
const { t } = usePrototypeLocale()

const padding = computed(() => ({ sm: 'p-4', md: 'p-6', lg: 'p-8' }[props.mat]))
const title = computed(() => props.title?.trim() || t('art.untitled'))
const altText = computed(() =>
  props.alt ?? (props.madeBy ? t('art.alt', { name: props.madeBy, title: title.value }) : t('art.altNoName', { title: title.value })),
)
</script>

<template>
  <figure class="flex flex-col gap-4">
    <!-- The mat is always marble white, in dawn and dusk alike. -->
    <div :class="['elev border-[1.5px] border-dawn-hairline bg-dawn-surface', padding, niche ? 'niche pt-10' : 'rounded-card']">
      <img
        :src="src"
        :alt="altText"
        :loading="loading"
        :style="{ aspectRatio: ratio }"
        :class="['block w-full bg-dawn-surface-2 object-cover', niche ? 'rounded-t-[999px]' : 'rounded-sm']"
      />
    </div>
    <figcaption v-if="label">
      <MuseumLabel :title="props.title" :technique="technique" :date="date" :made-by="madeBy" />
    </figcaption>
  </figure>
</template>
