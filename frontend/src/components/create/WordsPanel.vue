<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { SButton } from '@/components/sanctuary'

/**
 * Way in "Palabras": a large textarea, a few gentle suggestion chips that add text, and Crear.
 * v-model is the description (kept by the parent, so "Otra versión" can reuse it).
 */
defineProps<{ busy?: boolean }>()
const emit = defineEmits<{ create: [] }>()
const text = defineModel<string>({ default: '' })
const { t } = usePrototypeLocale()

const id = useId()
const area = ref<HTMLTextAreaElement | null>(null)
const chips = computed(() => [t('create.chip1'), t('create.chip2'), t('create.chip3'), t('create.chip4')])
const canCreate = computed(() => text.value.trim().length > 0)

const addChip = async (chip: string) => {
  const cur = text.value.trim()
  text.value = cur ? `${cur}${/[.,;:]$/.test(cur) ? '' : ','} ${chip}` : chip.charAt(0).toUpperCase() + chip.slice(1)
  await nextTick()
  area.value?.focus()
  const end = text.value.length
  area.value?.setSelectionRange(end, end)
}

const submit = () => {
  if (canCreate.value) emit('create')
}

defineExpose({ focus: () => area.value?.focus() })
</script>

<template>
  <form class="flex flex-col gap-8" @submit.prevent="submit">
      <div class="flex flex-col gap-2">
        <label :for="id" class="type-h2">{{ t('create.wordsLabel') }}</label>
        <p :id="`${id}-help`" class="type-small text-muted-foreground">{{ t('create.wordsHelp') }}</p>
        <textarea
          :id="id"
          ref="area"
          v-model="text"
          rows="5"
          :aria-describedby="`${id}-help`"
          :placeholder="t('create.wordsPlaceholder')"
          class="type-body mt-2 w-full resize-y rounded-control border-2 border-input bg-card px-5 py-4 leading-relaxed text-foreground placeholder:text-muted-foreground"
          @keydown.ctrl.enter.prevent="submit"
          @keydown.meta.enter.prevent="submit"
        />
      </div>

      <div class="flex flex-col gap-3">
        <p class="type-small font-semibold text-muted-foreground">{{ t('create.chipsTitle') }}</p>
        <ul class="flex flex-wrap gap-3" role="list">
          <li v-for="chip in chips" :key="chip">
            <button
              type="button"
              class="type-body inline-flex min-h-12 items-center rounded-control border-2 border-input bg-card px-4 text-foreground transition-colors hover:border-ring hover:bg-secondary"
              :aria-label="t('create.chipAdd', { text: chip })"
              @click="addChip(chip)"
            >
              {{ t('create.quote', { text: chip }) }}
            </button>
          </li>
        </ul>
      </div>

      <hr class="flute-rule" />
      <div class="flex flex-wrap items-center gap-4">
        <SButton type="submit" :disabled="!canCreate" :busy="busy">{{ t('create.create') }}</SButton>
        <p v-if="!canCreate" class="type-small text-muted-foreground">{{ t('create.wordsNeeded') }}</p>
      </div>
  </form>
</template>
