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
// Bind `to`/`href` only when set: an explicit `href: undefined` would override the href RouterLink computes.
const linkAttrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return {}
})

const variants = {
  // Square-cut, like a placard. dusk: peach fill + sky text; dawn: ink fill + light text (both from --primary).
  primary: 'rounded-control bg-primary text-primary-foreground hover:bg-primary-hover border-2 border-transparent',
  // Transparent, not white: the 2px border is the control boundary (>= 3:1).
  secondary: 'rounded-control bg-transparent text-foreground border-2 border-input hover:bg-secondary',
  // No box: an always-visible underline. px-1 keeps the target width; min-h keeps it >= 48px.
  quiet: 'rounded-none bg-transparent text-foreground border-0 px-1 underline decoration-1 underline-offset-[6px] hover:decoration-2',
  danger: 'rounded-control bg-danger text-danger-foreground hover:bg-danger/90 border-2 border-transparent',
}
const sizes = {
  patient: 'type-button min-h-14 px-7',
  compact: 'min-h-11 px-5 text-base font-semibold leading-tight',
}
// Quiet buttons have no box, so they keep only the height (48px floor for patient screens).
const quietSizes = {
  patient: 'type-button min-h-12',
  compact: 'min-h-11 text-base font-semibold leading-tight',
}
const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-3 text-center no-underline transition-colors',
    '[&_svg]:size-5 [&_svg]:shrink-0',
    variants[props.variant],
    props.variant === 'quiet' ? quietSizes[props.size] : sizes[props.size],
    props.block && 'w-full',
    // Disabled keeps the variant's shape but never looks like the primary: soft fill, dashed border.
    inert.value && props.variant !== 'quiet' && 'cursor-not-allowed border-2 border-dashed border-input bg-secondary text-muted-foreground hover:bg-secondary',
    inert.value && props.variant === 'quiet' && 'cursor-not-allowed text-muted-foreground no-underline hover:no-underline',
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
    v-bind="linkAttrs"
    :class="classes"
  >
    <Loader2 v-if="busy" aria-hidden="true" class="animate-spin" />
    <slot v-else name="icon" />
    <slot />
  </component>
</template>
