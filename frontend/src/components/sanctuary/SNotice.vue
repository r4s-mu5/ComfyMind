<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/**
 * Inline, persistent notice. It never auto-dismisses: the person closes it (`dismissible`).
 * State is always shown with an icon and a text label, never colour alone.
 */
interface Props {
  tone?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  dismissible?: boolean
}
const props = withDefaults(defineProps<Props>(), { tone: 'info' })
const emit = defineEmits<{ dismiss: [] }>()
const { t } = usePrototypeLocale()

const open = ref(true)
const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: OctagonAlert }
const toneClass = {
  info: 'border-link text-link',
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  danger: 'border-danger text-danger',
}
const icon = computed(() => icons[props.tone])

const close = () => {
  open.value = false
  emit('dismiss')
}
</script>

<template>
  <div
    v-if="open"
    :role="tone === 'danger' ? 'alert' : 'status'"
    :class="['flex items-start gap-4 rounded-none border-2 bg-card p-4 text-card-foreground', toneClass[tone].split(' ')[0]]"
  >
    <component :is="icon" aria-hidden="true" :class="['mt-0.5 size-6 shrink-0', toneClass[tone].split(' ')[1]]" />
    <div class="type-body min-w-0 flex-1">
      <p :class="['font-semibold', toneClass[tone].split(' ')[1]]">
        <span v-if="title" class="sr-only">{{ t(`notice.${tone}`) }}: </span>
        <template v-if="title">{{ title }}</template>
        <template v-else>{{ t(`notice.${tone}`) }}</template>
      </p>
      <div v-if="$slots.default" class="mt-1"><slot /></div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="type-small inline-flex min-h-12 shrink-0 items-center px-1 font-semibold underline decoration-1 underline-offset-[6px] hover:decoration-2"
      @click="close"
    >
      {{ t('notice.dismiss') }}
    </button>
  </div>
</template>
