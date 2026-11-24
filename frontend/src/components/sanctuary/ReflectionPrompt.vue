<script setup lang="ts">
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import SButton from './SButton.vue'
import SField from './SField.vue'

/**
 * One open question after saving an artwork, a textarea, and two equally visible choices.
 * This is the future chatbot slot. Emits `save` (with the note) and `skip`.
 */
defineProps<{ question?: string; busy?: boolean }>()
const emit = defineEmits<{ save: [note: string]; skip: [] }>()
const note = defineModel<string>({ default: '' })
const { t } = usePrototypeLocale()
</script>

<template>
  <form class="flex flex-col gap-5" @submit.prevent="emit('save', note)">
    <h2 class="type-h2">{{ question ?? t('reflection.question') }}</h2>
    <SField v-model="note" type="textarea" :label="t('reflection.label')" :help="t('reflection.help')" :rows="4" />
    <div class="flex flex-wrap gap-3">
      <SButton type="submit" :busy="busy" :disabled="!note.trim()">{{ t('reflection.save') }}</SButton>
      <SButton variant="secondary" @click="emit('skip')">{{ t('reflection.skip') }}</SButton>
    </div>
  </form>
</template>
