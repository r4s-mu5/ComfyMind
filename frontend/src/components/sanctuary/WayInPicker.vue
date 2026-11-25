<script setup lang="ts">
import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import imageSample from '@/lib/demo/images/simple_test_00160_.jpg'

/**
 * "How would you like to begin?": three doorways in a colonnade (hairlines between them, no cards,
 * no icons). Each shows a sample of its material on a small square mat: a paper strip with a word,
 * a pencil line on paper, a crop of an abstract image. v-model is 'words' | 'draw' | 'image'.
 * Once a way is chosen the same buttons collapse into a row of underline tabs (focus stays put).
 * `collapse=false` keeps the doorways and marks the chosen one (underline, ✓, "Elegida").
 * "Combine images" lives inside "Image", not here.
 */
export type WayIn = 'words' | 'draw' | 'image'
const props = withDefaults(defineProps<{ disabled?: boolean; collapse?: boolean }>(), { collapse: true })
const model = defineModel<WayIn | null>({ default: null })
const { t } = usePrototypeLocale()

const options: { value: WayIn; label: string; hint: string }[] = [
  { value: 'words', label: 'wayin.words', hint: 'wayin.wordsHint' },
  { value: 'draw', label: 'wayin.draw', hint: 'wayin.drawHint' },
  { value: 'image', label: 'wayin.image', hint: 'wayin.imageHint' },
]
const compact = computed(() => props.collapse && !!model.value)
</script>

<template>
  <div class="@container">
    <div
      role="group"
      :aria-label="t('wayin.title')"
      :class="
        compact
          ? 'flex flex-wrap gap-x-6 gap-y-1 border-b border-hairline'
          : 'grid border-y border-hairline @[44rem]:grid-cols-3'
      "
    >
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        :disabled="disabled"
        :aria-pressed="model === o.value"
        :class="[
          'group rounded-none border-b-[3px] text-left transition-colors disabled:cursor-not-allowed disabled:text-muted-foreground',
          compact
            ? 'type-body -mb-px inline-flex min-h-12 items-center gap-2 px-2'
            : [
                'grid grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-4 px-2 py-5',
                // hairlines between doorways: rows when stacked, columns side by side (no divide-*: it would fight the 3px rule)
                'border-t border-t-hairline first:border-t-0',
                '@[44rem]:grid-cols-1 @[44rem]:content-start @[44rem]:border-t-0 @[44rem]:border-l @[44rem]:border-l-hairline @[44rem]:px-6 @[44rem]:py-6 @[44rem]:first:border-l-0',
              ],
          model === o.value
            ? 'border-b-foreground font-bold text-foreground'
            : compact
              ? 'border-b-transparent font-medium text-muted-foreground hover:border-b-input hover:text-foreground'
              : 'border-b-transparent text-foreground hover:border-b-input',
        ]"
        @click="model = o.value"
      >
        <!-- the material sample: a small square mat, decorative -->
        <span
          v-if="!compact"
          aria-hidden="true"
          class="block aspect-[4/3] w-full max-w-[13rem] bg-dawn-surface p-[7%] @[44rem]:w-[78%]"
        >
          <span v-if="o.value === 'words'" class="flex size-full items-center bg-dawn-surface-2">
            <span class="type-label flex min-h-[38%] w-full items-center bg-paper px-[10%] text-dawn-ink">{{ t('wayin.wordsSample') }}</span>
          </span>
          <svg v-else-if="o.value === 'draw'" viewBox="0 0 120 90" preserveAspectRatio="none" class="block size-full bg-paper">
            <path
              d="M10 58 C 24 50, 30 40, 44 44 S 62 62, 76 52 S 98 30, 110 38"
              fill="none"
              stroke="var(--paint-ink)"
              stroke-opacity="0.78"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <path
              d="M14 66 C 34 62, 52 70, 72 64 S 100 58, 106 61"
              fill="none"
              stroke="var(--paint-ink)"
              stroke-opacity="0.35"
              stroke-width="1"
              stroke-linecap="round"
            />
          </svg>
          <img v-else :src="imageSample" alt="" class="block size-full object-cover object-[50%_62%]" />
        </span>

        <span :class="compact ? 'contents' : 'flex min-w-0 flex-col gap-1'">
          <span :class="compact ? '' : 'type-h3 flex flex-wrap items-center gap-x-3'">
            {{ t(o.label) }}
            <span v-if="!compact && model === o.value" aria-hidden="true" class="type-small inline-flex items-center gap-1 font-semibold">
              <Check class="size-5" /> {{ t('create.chosen') }}
            </span>
          </span>
          <span v-if="!compact" class="type-small font-normal text-muted-foreground">{{ t(o.hint) }}</span>
        </span>
        <Check v-if="compact && model === o.value" aria-hidden="true" class="size-5" />
      </button>
    </div>
  </div>
</template>
