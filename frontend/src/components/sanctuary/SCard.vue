<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

/**
 * A room on the page, not a box.
 * variant "panel" (default): no fill, no border, no radius; a hairline rule above and space. The heading
 *   inside is the only frame. Use it to separate one section from the next.
 * variant "mat": an opt-in surface (a form, the paper, the reflection) on the page like a mount board:
 *   surface fill, square corners, no border, no shadow. Artwork uses ArtworkMount, not this.
 * `padding`: none | md (24px, default) | lg (32px). `selected` marks it (never colour alone: add a label).
 */
interface Props {
  as?: string
  variant?: 'panel' | 'mat'
  padding?: 'none' | 'md' | 'lg'
  selected?: boolean
}
const props = withDefaults(defineProps<Props>(), { as: 'div', variant: 'panel', padding: 'md' })

const classes = computed(() =>
  props.variant === 'mat'
    ? cn(
        'mat',
        { none: '', md: 'p-6 sm:p-8', lg: 'p-8 sm:p-10' }[props.padding],
        props.selected && 'outline outline-2 outline-offset-0 outline-foreground',
      )
    : cn(
        'border-t border-hairline text-foreground',
        { none: '', md: 'pt-6', lg: 'pt-8' }[props.padding],
        props.selected && 'border-t-[3px] border-foreground',
      ),
)
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
