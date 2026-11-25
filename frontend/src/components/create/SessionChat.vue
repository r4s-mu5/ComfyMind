<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { SButton } from '@/components/sanctuary'

/**
 * The patient's side panel in a session: the chat with the therapist, the "Marta can see what you
 * share" line, and a collapsed, clearly inactive placeholder for the future assistant.
 * Messages are { sender: 'patient' | 'therapist', text }. Emits `send` with the text.
 * Shown as a transcript, not bubbles: a name line and the text, a hairline between turns; your own
 * turns are set in a little, like a reply in a script.
 */
const props = defineProps<{
  messages: { sender: string; text: string }[]
  therapistName: string
  connected?: boolean
}>()
const emit = defineEmits<{ send: [text: string] }>()
const { t } = usePrototypeLocale()

const inputId = useId()
const draft = ref('')
const list = ref<HTMLElement | null>(null)
const assistantOpen = ref(false)
const canSend = computed(() => draft.value.trim().length > 0 && props.connected !== false)

watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    list.value?.scrollTo({ top: list.value.scrollHeight })
  },
)

const send = () => {
  if (!canSend.value) return
  emit('send', draft.value.trim())
  draft.value = ''
}
</script>

<template>
  <section class="panel flex flex-col gap-4" :aria-labelledby="`${inputId}-title`">
    <div class="flex flex-col gap-1">
      <h2 :id="`${inputId}-title`" class="type-body font-semibold">{{ t('session.chatTitle', { name: therapistName }) }}</h2>
      <p class="type-small text-muted-foreground">{{ t('session.canSee', { name: therapistName }) }}</p>
    </div>

    <div
      ref="list"
      role="log"
      aria-live="polite"
      :aria-label="t('session.chatLog')"
      class="flex max-h-[24rem] min-h-32 flex-col divide-y divide-hairline overflow-y-auto border-b border-hairline"
    >
      <p v-if="!messages.length" class="type-small py-3 text-muted-foreground">{{ t('session.chatEmpty', { name: therapistName }) }}</p>
      <div v-for="(m, i) in messages" :key="i" :class="['flex flex-col gap-1 py-3', m.sender === 'patient' && 'pl-8']">
        <span :class="['type-small font-semibold', m.sender === 'patient' ? 'text-muted-foreground' : 'text-foreground']">
          {{ m.sender === 'patient' ? t('session.chatYou') : therapistName }}
        </span>
        <p class="type-body text-foreground">{{ m.text }}</p>
      </div>
    </div>

    <form class="flex flex-col gap-3" @submit.prevent="send">
      <label :for="inputId" class="type-small font-semibold">{{ t('session.chatInput') }}</label>
      <textarea
        :id="inputId"
        v-model="draft"
        rows="2"
        class="type-body w-full resize-y rounded-control border-2 border-input bg-card px-4 py-3 text-foreground"
        @keydown.enter.exact.prevent="send"
      />
      <SButton type="submit" variant="secondary" :disabled="!canSend">{{ t('session.chatSend') }}</SButton>
      <p v-if="connected === false" class="type-small text-muted-foreground">{{ t('session.chatOffline') }}</p>
    </form>

    <div class="border-t border-hairline pt-4">
      <button
        type="button"
        class="type-small flex min-h-12 w-full items-center justify-between gap-3 rounded-none px-1 text-left font-semibold text-muted-foreground hover:text-foreground"
        :aria-expanded="assistantOpen"
        :aria-controls="`${inputId}-assistant`"
        @click="assistantOpen = !assistantOpen"
      >
        <span>{{ t('session.assistant') }}</span>
        <ChevronDown aria-hidden="true" :class="['size-5 transition-transform', assistantOpen && 'rotate-180']" />
      </button>
      <p v-show="assistantOpen" :id="`${inputId}-assistant`" class="type-small px-1 pt-2 text-muted-foreground">
        {{ t('session.assistantBody') }}
      </p>
    </div>
  </section>
</template>
