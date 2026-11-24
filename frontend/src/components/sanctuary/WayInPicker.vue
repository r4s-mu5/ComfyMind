<script setup lang="ts">
import { Check, Image as ImageIcon, PenLine, Type } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/**
 * "How would you like to begin?": three large, real buttons. v-model is 'words' | 'draw' | 'image'.
 * "Combine images" lives inside "Image", not here.
 */
export type WayIn = 'words' | 'draw' | 'image'
defineProps<{ disabled?: boolean }>()
const model = defineModel<WayIn | null>({ default: null })
const { t } = usePrototypeLocale()

const options: { value: WayIn; icon: typeof Type; label: string; hint: string }[] = [
  { value: 'words', icon: Type, label: 'wayin.words', hint: 'wayin.wordsHint' },
  { value: 'draw', icon: PenLine, label: 'wayin.draw', hint: 'wayin.drawHint' },
  { value: 'image', icon: ImageIcon, label: 'wayin.image', hint: 'wayin.imageHint' },
]
</script>

<template>
  <div role="group" :aria-label="t('wayin.title')" class="grid gap-3 sm:grid-cols-3">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      :disabled="disabled"
      :aria-pressed="model === o.value"
      :class="[
        'relative flex min-h-36 flex-col items-start gap-2 rounded-card border-2 p-5 text-left transition-colors',
        'disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground',
        model === o.value ? 'border-ring bg-secondary' : 'border-input bg-card hover:bg-secondary',
      ]"
      @click="model = o.value"
    >
      <component :is="o.icon" aria-hidden="true" class="size-8 text-mark" />
      <span class="type-h3">{{ t(o.label) }}</span>
      <span class="type-small text-muted-foreground">{{ t(o.hint) }}</span>
      <Check v-if="model === o.value" aria-hidden="true" class="absolute right-4 top-4 size-6 text-mark" />
    </button>
  </div>
</template>
