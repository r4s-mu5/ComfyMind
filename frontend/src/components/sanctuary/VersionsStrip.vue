<script setup lang="ts">
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/**
 * Thumbnails of the versions made in this sitting. The current one is outlined (and marked for
 * screen readers). No ranking, no scores. v-model is the current version id.
 */
export interface Version { id: string | number; src: string; alt?: string }
defineProps<{ versions: Version[] }>()
const current = defineModel<string | number | null>({ default: null })
const emit = defineEmits<{ select: [id: string | number] }>()
const { t } = usePrototypeLocale()

const pick = (id: string | number) => {
  current.value = id
  emit('select', id)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="type-h3 text-foreground">{{ t('versions.title') }}</p>
    <ul class="flex flex-wrap gap-3">
      <li v-for="(v, i) in versions" :key="v.id">
        <button
          type="button"
          :aria-current="current === v.id ? 'true' : undefined"
          :aria-label="`${t('versions.item', { n: i + 1, total: versions.length })}${current === v.id ? `, ${t('versions.current')}` : ''}`"
          :class="[
            'block size-20 overflow-hidden rounded-none bg-dawn-mat p-1',
            current === v.id ? 'outline outline-[3px] outline-offset-2 outline-foreground' : 'border-2 border-input hover:border-foreground',
          ]"
          @click="pick(v.id)"
        >
          <img :src="v.src" :alt="v.alt ?? ''" class="size-full rounded-none object-cover" loading="lazy" />
        </button>
      </li>
    </ul>
  </div>
</template>
