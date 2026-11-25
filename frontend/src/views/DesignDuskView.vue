<script setup lang="ts">
/** Demo of <DuskLayout> for the style guide, with the palette presets. Route: /design/dusk. */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import { SButton, DuskLayout } from '@/components/sanctuary'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { DEFAULT_PALETTE_ID, PALETTES, activePaletteId, applyPaletteClass } from '@/theme/palettes'

const { t } = usePrototypeLocale()

const palette = ref(DEFAULT_PALETTE_ID)
let paletteOnEntry = DEFAULT_PALETTE_ID
const setPalette = (id: string) => { applyPaletteClass(id); palette.value = id }
onMounted(() => { paletteOnEntry = activePaletteId(); palette.value = paletteOnEntry })
onBeforeUnmount(() => applyPaletteClass(paletteOnEntry))
</script>

<template>
  <!-- Wall text directly on the sky: no scrim (scrim is only for forms). -->
  <DuskLayout>
    <div class="flex flex-col items-start gap-5">
      <p class="type-wordmark text-mark">{{ t('shell.wordmark') }}</p>
      <hr class="flute-rule w-32" />
      <h1 class="type-display text-balance">{{ t('landing.display') }}</h1>
      <p class="type-body measure text-muted-foreground">{{ t('landing.lede') }}</p>
      <div class="flex flex-wrap gap-3">
        <SButton>{{ t('landing.begin') }}</SButton>
        <SButton to="/design" variant="secondary">/design</SButton>
      </div>
      <!-- Developer tool (English): the dusk tokens of each palette. The 3D scene keeps its own colours here. -->
      <div role="group" aria-label="Preview a palette" class="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <button v-for="p in PALETTES" :key="p.id" type="button" class="chip" :aria-pressed="palette === p.id" @click="setPalette(p.id)">
          <Check v-if="palette === p.id" aria-hidden="true" class="size-4" />{{ p.name }}
        </button>
      </div>
    </div>
  </DuskLayout>
</template>
