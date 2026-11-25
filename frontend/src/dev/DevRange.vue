<script setup lang="ts">
// One labelled slider row of the dev panel, with its value as an editable number.
const props = withDefaults(defineProps<{ label: string; min: number; max: number; step?: number; disabled?: boolean }>(), { step: 0.01, disabled: false })
const model = defineModel<number>({ required: true })
const id = `dev-r-${Math.random().toString(36).slice(2, 8)}`
const set = (v: string) => { const n = Number(v); if (Number.isFinite(n)) model.value = Math.min(props.max, Math.max(props.min, n)) }
</script>

<template>
  <div class="dev-row">
    <label :for="id">{{ label }}</label>
    <input :id="id" type="range" :min="min" :max="max" :step="step" :value="model" :disabled="disabled" @input="set(($event.target as HTMLInputElement).value)" />
    <input class="dev-num" type="number" :min="min" :max="max" :step="step" :value="model" :disabled="disabled" :aria-label="label" @change="set(($event.target as HTMLInputElement).value)" />
  </div>
</template>
