<script setup lang="ts">
import { Sun } from 'lucide-vue-next'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useComfort, type Atmosphere, type TextSize } from '@/composables/useComfort'
import { usePrototypeLocale, type PrototypeLocale } from '@/composables/usePrototypeLocale'
import SButton from './SButton.vue'

/**
 * Comfort panel (DESIGN.md §5.4): a labelled sun button that opens a popover with text size,
 * motion, atmosphere, 3D scene and language. Everything persists per device (useComfort).
 */
defineProps<{ variant?: 'secondary' | 'quiet' }>()
const { state, motionOff, setTextSize, setMotion, setAtmosphere, setScene3d, reset } = useComfort()
const { t, locale, setLocale } = usePrototypeLocale()

const sizes: TextSize[] = [100, 125, 150]
const atmospheres: { value: Atmosphere; label: string }[] = [
  { value: 'thresholds', label: 'comfort.atmosphereThresholds' },
  { value: 'everywhere', label: 'comfort.atmosphereEverywhere' },
  { value: 'plain', label: 'comfort.atmospherePlain' },
]
const languages: { value: PrototypeLocale; label: string }[] = [
  { value: 'es', label: 'ES' },
  { value: 'ca', label: 'CA' },
  { value: 'en', label: 'EN' },
]
const seg =
  'type-small min-h-11 min-w-12 flex-1 rounded-control border-2 px-3 font-semibold transition-colors'
const segClass = (on: boolean) => [seg, on ? 'border-ring bg-secondary' : 'border-input bg-card hover:bg-secondary']
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <SButton :variant="variant ?? 'secondary'" size="compact">
        <template #icon><Sun aria-hidden="true" /></template>
        {{ t('comfort.title') }}
      </SButton>
    </PopoverTrigger>
    <PopoverContent align="end" class="max-h-[min(85vh,var(--reka-popover-content-available-height))] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-card border-2 border-input p-5">
      <p class="type-small mb-4 text-muted-foreground">{{ t('comfort.intro') }}</p>

      <div class="flex flex-col gap-5">
        <fieldset class="flex flex-col gap-2">
          <legend class="type-small mb-2 font-semibold">{{ t('comfort.textSize') }}</legend>
          <div class="flex gap-2">
            <button v-for="s in sizes" :key="s" type="button" :aria-pressed="state.textSize === s" :class="segClass(state.textSize === s)" @click="setTextSize(s)">
              {{ s }}%
            </button>
          </div>
        </fieldset>

        <fieldset class="flex flex-col gap-2">
          <legend class="type-small mb-2 font-semibold">{{ t('comfort.motion') }}</legend>
          <div class="flex gap-2">
            <button type="button" :aria-pressed="!motionOff" :class="segClass(!motionOff)" @click="setMotion('on')">{{ t('comfort.on') }}</button>
            <button type="button" :aria-pressed="motionOff" :class="segClass(motionOff)" @click="setMotion('off')">{{ t('comfort.off') }}</button>
          </div>
        </fieldset>

        <fieldset class="flex flex-col gap-2">
          <legend class="type-small mb-2 font-semibold">{{ t('comfort.atmosphere') }}</legend>
          <div class="flex flex-wrap gap-2">
            <button v-for="a in atmospheres" :key="a.value" type="button" :aria-pressed="state.atmosphere === a.value" :class="segClass(state.atmosphere === a.value)" @click="setAtmosphere(a.value)">
              {{ t(a.label) }}
            </button>
          </div>
        </fieldset>

        <fieldset class="flex flex-col gap-2">
          <legend class="type-small mb-2 font-semibold">{{ t('comfort.scene3d') }}</legend>
          <div class="flex gap-2">
            <button type="button" :aria-pressed="state.scene3d" :class="segClass(state.scene3d)" @click="setScene3d(true)">{{ t('comfort.on') }}</button>
            <button type="button" :aria-pressed="!state.scene3d" :class="segClass(!state.scene3d)" @click="setScene3d(false)">{{ t('comfort.off') }}</button>
          </div>
        </fieldset>

        <fieldset class="flex flex-col gap-2">
          <legend class="type-small mb-2 font-semibold">{{ t('language.label') }}</legend>
          <div class="flex gap-2">
            <button v-for="l in languages" :key="l.value" type="button" :aria-pressed="locale === l.value" :lang="l.value" :class="segClass(locale === l.value)" @click="setLocale(l.value)">
              {{ l.label }}
            </button>
          </div>
        </fieldset>
      </div>

      <div class="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
        <p class="type-small text-muted-foreground">{{ t('comfort.saved') }}</p>
        <SButton variant="quiet" size="compact" @click="reset">{{ t('comfort.reset') }}</SButton>
      </div>
    </PopoverContent>
  </Popover>
</template>
