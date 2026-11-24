<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

/**
 * One card = one thing. 16px radius, surface fill, hairline border.
 * `padding`: none | md (24px, default) | lg (32px). `selected` outlines it (never colour alone: add a label).
 */
interface Props {
  as?: string
  padding?: 'none' | 'md' | 'lg'
  selected?: boolean
  raised?: boolean
}
const props = withDefaults(defineProps<Props>(), { as: 'div', padding: 'md', raised: true })

const classes = computed(() =>
  cn(
    'rounded-card border-[1.5px] border-border bg-card text-card-foreground',
    props.raised && 'elev',
    { none: '', md: 'p-6', lg: 'p-8' }[props.padding],
    props.selected && 'border-2 border-ring',
  ),
)
</script>

<template>
  <component :is="as" :class="classes"><slot /></component>
</template>
