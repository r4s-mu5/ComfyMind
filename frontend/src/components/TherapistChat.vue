<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { SButton } from '@/components/sanctuary'

/** Therapist-side chat as a transcript: a name line + the text per turn, a hairline between turns, no bubbles. */
const props = defineProps<{
  messages: Array<{ sender: string; text: string }>
  role: string
  otherName: string
}>()
const emit = defineEmits<{ send: [text: string] }>()
const { t } = usePrototypeLocale()

const draft = ref('')
const list = ref<HTMLElement | null>(null)
const submit = () => {
  const text = draft.value.trim()
  if (!text) return
  emit('send', text)
  draft.value = ''
}
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    list.value?.scrollTo({ top: list.value.scrollHeight })
  },
  { immediate: true },
)
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-4">
    <ul ref="list" role="log" aria-live="polite" :aria-label="t('therapist.chatTitle', { name: otherName })" class="flex max-h-[26rem] min-h-40 flex-1 flex-col gap-3 overflow-y-auto pr-1">
      <li v-if="!messages.length" class="type-small text-muted-foreground">{{ t('therapist.chatEmpty') }}</li>
      <li v-for="(m, i) in messages" :key="i" class="border-t border-border pt-3 first:border-t-0 first:pt-0">
        <p :class="['type-small font-semibold', m.sender === role ? 'text-muted-foreground' : 'text-foreground']">{{ m.sender === role ? t('therapist.chatYou') : otherName }}</p>
        <p class="type-body mt-1">{{ m.text }}</p>
      </li>
    </ul>
    <form class="flex flex-col gap-3" @submit.prevent="submit">
      <label for="therapist-chat-input" class="type-small font-semibold">{{ t('therapist.chatInput') }}</label>
      <div class="flex gap-3">
        <input
          id="therapist-chat-input"
          v-model="draft"
          type="text"
          autocomplete="off"
          class="type-body min-h-11 min-w-0 flex-1 rounded-control border-2 border-input bg-card px-4 text-foreground"
        />
        <SButton type="submit" size="compact" :disabled="!draft.trim()">
          {{ t('therapist.chatSend') }}
        </SButton>
      </div>
    </form>
  </div>
</template>
