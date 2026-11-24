<script setup lang="ts">
import { computed, type Component } from 'vue'
import { RouterLink } from 'vue-router'
import { Loader2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

/**
 * Sanctuary button. Variants: primary (one per screen), secondary, quiet, danger.
 * Sizes: "patient" = 56px (default), "compact" = 44px (therapist, dense places).
 * `to` renders a RouterLink, `href` an <a>, or pass `as` explicitly.
 * Put a Lucide icon in the `icon` slot: icons always go together with text.
 */
interface Props {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger'
  size?: 'patient' | 'compact'
  as?: string | Component
  to?: string | Record<string, unknown>
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  busy?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'patient',
  type: 'button',
})

const tag = computed(() => props.as ?? (props.to ? RouterLink : props.href ? 'a' : 'button'))
const isNativeButton = computed(() => tag.value === 'button')
const inert = computed(() => props.disabled || props.busy)

const variants = {
  // dusk: peach fill + sky text; dawn: ink fill + white text (both come from --primary)
  primary: 'rounded-pill bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-transparent',
  secondary: 'rounded-control bg-card text-foreground border-2 border-input hover:bg-secondary',
  quiet: 'rounded-control bg-transparent text-foreground border-2 border-transparent underline-offset-4 hover:underline',
  danger: 'rounded-pill bg-danger text-danger-foreground hover:bg-danger/90 border-2 border-transparent',
}
const sizes = {
  patient: 'type-button min-h-14 px-7',
  compact: 'min-h-11 px-5 text-base font-semibold leading-tight',
}
const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-3 text-center no-underline transition-colors',
    '[&_svg]:size-5 [&_svg]:shrink-0',
    variants[props.variant],
    sizes[props.size],
    props.block && 'w-full',
    inert.value && 'cursor-not-allowed border-transparent bg-secondary text-muted-foreground hover:bg-secondary hover:no-underline',
  ),
)
</script>

<template>
  <component
    :is="tag"
    :type="isNativeButton ? type : undefined"
    :disabled="isNativeButton ? inert : undefined"
    :aria-disabled="!isNativeButton && inert ? 'true' : undefined"
    :aria-busy="busy ? 'true' : undefined"
    :to="to"
    :href="href"
    :class="classes"
  >
    <Loader2 v-if="busy" aria-hidden="true" class="animate-spin" />
    <slot v-else name="icon" />
    <slot />
  </component>
</template>
