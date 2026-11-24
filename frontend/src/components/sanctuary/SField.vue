<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { AlertCircle, Eye, EyeOff } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/**
 * Labelled form field: visible label above (never placeholder-only), 56px control, 2px border,
 * help below, error below with an icon. Password fields get a Show/Hide toggle; paste is allowed.
 * Use the default slot to supply your own control (slot props: id, describedby, invalid).
 */
interface Props {
  label: string
  type?: 'text' | 'email' | 'password' | 'textarea' | 'search' | 'tel' | 'url'
  help?: string
  error?: string
  optional?: boolean
  required?: boolean
  rows?: number
  autocomplete?: string
  placeholder?: string
  disabled?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), { type: 'text', rows: 4 })
const model = defineModel<string>({ default: '' })
const { t } = usePrototypeLocale()

const id = useId()
const helpId = `${id}-help`
const errorId = `${id}-error`
const reveal = ref(false)
const isPassword = computed(() => props.type === 'password')
const describedby = computed(() => [props.help ? helpId : '', props.error ? errorId : ''].filter(Boolean).join(' ') || undefined)
const invalid = computed(() => Boolean(props.error))

const control =
  'w-full rounded-control border-2 bg-card px-4 text-foreground placeholder:text-muted-foreground ' +
  'disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground'
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="id" class="type-body font-semibold">
      {{ label }}
      <span v-if="optional" class="type-small font-normal text-muted-foreground">{{ t('field.optional') }}</span>
    </label>

    <slot :id="id" :describedby="describedby" :invalid="invalid">
      <textarea
        v-if="type === 'textarea'"
        :id="id"
        v-model="model"
        :name="name"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-invalid="invalid || undefined"
        :aria-describedby="describedby"
        :class="[control, 'py-3 leading-relaxed', invalid ? 'border-danger' : 'border-input']"
      />
      <div v-else class="relative">
        <input
          :id="id"
          v-model="model"
          :name="name"
          :type="isPassword && reveal ? 'text' : type"
          :autocomplete="autocomplete"
          :placeholder="placeholder"
          :disabled="disabled"
          :required="required"
          :aria-invalid="invalid || undefined"
          :aria-describedby="describedby"
          :class="[control, 'min-h-14', isPassword ? 'pr-28' : '', invalid ? 'border-danger' : 'border-input']"
        />
        <button
          v-if="isPassword"
          type="button"
          class="type-small absolute right-2 top-1/2 inline-flex min-h-11 -translate-y-1/2 items-center gap-2 rounded-control px-3 font-semibold text-link hover:bg-secondary"
          :aria-pressed="reveal"
          @click="reveal = !reveal"
        >
          <component :is="reveal ? EyeOff : Eye" aria-hidden="true" class="size-4" />
          {{ reveal ? t('field.hide') : t('field.show') }}
        </button>
      </div>
    </slot>

    <p v-if="help" :id="helpId" class="type-small text-muted-foreground">{{ help }}</p>
    <p v-if="error" :id="errorId" role="alert" class="type-small flex items-start gap-2 font-semibold text-danger">
      <AlertCircle aria-hidden="true" class="mt-0.5 size-4 shrink-0" />
      <span>{{ error }}</span>
    </p>
  </div>
</template>
