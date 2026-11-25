<script setup lang="ts">
import { computed } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import MuseumLabel from './MuseumLabel.vue'
import type { FrameShape } from './frames'

/**
 * An artwork on a square-cornered museum mat (white, generous margin) hung with a soft drop shadow,
 * with a museum label below. The artwork is the strongest colour on any screen: keep everything
 * around it quiet. `mat`: sm 20px, md 32px, lg 40px.
 *
 * `frame` (the person can choose it, see FramePicker):
 *   arch      the niche: arch-top mat (the featured piece; same as the older `niche` prop)
 *   square    the plain square mat (the default)
 *   pediment  a square mat under a shallow gable, a temple front
 *   oculus    a round window in a square mat (always 1 / 1)
 *   columns   the mat between two thin fluted pilasters
 *   none      the picture alone, hung, with its label
 * All architectural and drawn with tokens only (--dawn-mat, --dawn-ink, --dawn-hairline, --flute-*), so they
 * follow dawn, dusk and the dark theme.
 */
interface Props {
  src: string
  alt?: string
  title?: string
  technique?: string
  date?: string | Date
  madeBy?: string
  /** Older shorthand for `frame="arch"`. */
  niche?: boolean
  frame?: FrameShape
  mat?: 'sm' | 'md' | 'lg'
  /** CSS aspect-ratio of the image window, e.g. "1 / 1", "4 / 3". */
  ratio?: string
  label?: boolean
  loading?: 'lazy' | 'eager'
}
const props = withDefaults(defineProps<Props>(), { mat: 'md', ratio: '1 / 1', label: true, loading: 'lazy' })
const { t } = usePrototypeLocale()

const shape = computed<FrameShape>(() => props.frame ?? (props.niche ? 'arch' : 'square'))
const padding = computed(() => ({ sm: 'p-5', md: 'p-8', lg: 'p-10' }[props.mat]))
const archTop = computed(() => ({ sm: 'pt-9', md: 'pt-12', lg: 'pt-14' }[props.mat]))
const ratio = computed(() => (shape.value === 'oculus' ? '1 / 1' : props.ratio))
const title = computed(() => props.title?.trim() || t('art.untitled'))
const altText = computed(() =>
  props.alt ?? (props.madeBy ? t('art.alt', { name: props.madeBy, title: title.value }) : t('art.altNoName', { title: title.value })),
)
</script>

<template>
  <figure class="mount flex flex-col gap-4" :data-frame="shape">
    <div v-if="shape === 'none'" class="shadow-hung">
      <img :src="src" :alt="altText" :loading="loading" :style="{ aspectRatio: ratio }" class="picture block w-full object-cover" />
    </div>

    <div v-else :class="['flex items-stretch', shape === 'columns' && 'gap-[clamp(6px,2.5%,14px)]']">
      <span v-if="shape === 'columns'" class="pilaster" aria-hidden="true"><i /><b /><i /></span>

      <div class="flex min-w-0 flex-1 flex-col">
        <!-- Temple front: a shallow gable whose cornice overhangs the mat a little; the tympanum is one hairline. -->
        <svg v-if="shape === 'pediment'" class="relative z-[1] -mx-[3%] -mb-px block w-[106%] max-w-none" viewBox="0 0 106 11" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="0,11 53,0 106,11" fill="var(--dawn-mat)" />
          <polyline points="11,9.6 53,1.9 95,9.6 11,9.6" fill="none" stroke="var(--mat-line)" stroke-width="1" vector-effect="non-scaling-stroke" />
          <line x1="0" y1="10.5" x2="106" y2="10.5" stroke="var(--mat-line)" stroke-width="1" vector-effect="non-scaling-stroke" />
        </svg>
        <!-- The mat (--dawn-mat) is the brightest surface on the page, in dawn and dusk alike. Square corners, no border, hung shadow. -->
        <div
          :class="[
            'bg-dawn-mat shadow-hung',
            padding,
            shape === 'arch' && ['niche rounded-b-[2px]', archTop],
            shape === 'columns' && 'py-[12%]',
          ]"
        >
          <div v-if="shape === 'oculus'" class="oculus">
            <img :src="src" :alt="altText" :loading="loading" class="picture block aspect-square w-full rounded-full object-cover" />
          </div>
          <img
            v-else
            :src="src"
            :alt="altText"
            :loading="loading"
            :style="{ aspectRatio: ratio }"
            :class="['picture block w-full object-cover', shape === 'arch' ? 'rounded-t-[999px]' : 'rounded-none']"
          />
        </div>
      </div>

      <span v-if="shape === 'columns'" class="pilaster" aria-hidden="true"><i /><b /><i /></span>
    </div>

    <figcaption v-if="label">
      <MuseumLabel :title="props.title" :technique="technique" :date="date" :made-by="madeBy" />
    </figcaption>
  </figure>
</template>

<style scoped>
/* A line drawn ON the mat: the mat stays light in every theme, so it is ink-based, not --dawn-hairline. */
.mount {
  --mat-line: color-mix(in srgb, var(--dawn-ink) 22%, transparent);
}
.picture {
  background: var(--dawn-surface-2);
  box-shadow: 0 0 0 1px var(--dawn-hairline);
}

/* Oculus: the round window keeps a second, thin moulding ring a few pixels out. */
.oculus {
  padding: 6%;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px var(--mat-line);
}

/* Pilaster: abacus, fluted shaft, base. The same flute shading as the header entablature. */
.pilaster {
  display: flex;
  flex-direction: column;
  flex: none;
  width: clamp(12px, 6%, 26px);
}
.pilaster i {
  display: block;
  height: 7px;
  margin-inline: -3px;
  background: var(--flute-mid);
  border-block: 1px solid var(--dawn-hairline);
}
.pilaster b {
  display: block;
  flex: 1;
  border-inline: 1px solid var(--dawn-hairline);
  background: repeating-linear-gradient(90deg, var(--flute-dark) 0, var(--flute-lit) 2px, var(--flute-mid) 5px, var(--flute-dark) 6px);
}
</style>
