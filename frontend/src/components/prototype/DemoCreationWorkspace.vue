<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Brush, Check, Image, Images, Loader2, Sparkles, WandSparkles } from 'lucide-vue-next'
import demoArtwork from '@/assets/images/template_images/ComfyUI_00105_.png'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type DemoState = 'empty' | 'loading' | 'result' | 'saved'

const router = useRouter()
const { locationWithDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()
const state = ref<DemoState>('empty')
const prompt = ref('')
const error = ref('')
let resultTimer: ReturnType<typeof setTimeout> | null = null

const generate = () => {
  error.value = ''
  if (!prompt.value.trim()) {
    error.value = t('workspace.promptRequired')
    return
  }
  state.value = 'loading'
  resultTimer = setTimeout(() => {
    state.value = 'result'
    resultTimer = null
  }, 800)
}

const reset = () => {
  state.value = 'empty'
  error.value = ''
}

onBeforeUnmount(() => {
  if (resultTimer) clearTimeout(resultTimer)
})
</script>

<template>
  <div class="prototype-page">
    <header class="mb-7 flex flex-col gap-5 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="prototype-eyebrow">{{ t('workspace.eyebrow') }}</p>
        <h1 class="prototype-title mt-3">{{ t('workspace.title') }}</h1>
        <p class="prototype-lead mt-3">{{ t('workspace.description') }}</p>
      </div>
      <div class="shrink-0 rounded-2xl border border-border bg-white px-4 py-3 text-sm shadow-sm">
        <p class="font-bold text-foreground">Marta Soler</p>
        <p class="mt-0.5 text-muted-foreground">16/07/2026 · 16:30–17:30</p>
      </div>
    </header>

    <div class="mb-5 flex items-center gap-3" :aria-label="t('workspace.progress')">
      <span class="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
      <div class="h-1 flex-1 overflow-hidden rounded-full bg-muted"><div class="h-full w-1/2 rounded-full bg-primary" /></div>
      <span class="text-sm font-bold text-muted-foreground">{{ t('workspace.progress') }}</span>
    </div>

    <Alert class="mb-5 border-[#d8c4ad] bg-[#fffaf4] text-[#68472f]">
      <Sparkles aria-hidden="true" />
      <AlertDescription>{{ t('workspace.demoNote') }}</AlertDescription>
    </Alert>

    <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card class="min-h-[32rem] border-border/80 bg-white shadow-sm">
        <CardHeader class="px-6 pb-2 sm:px-8"><h2 class="text-xl font-bold">{{ t('workspace.currentArtwork') }}</h2></CardHeader>
        <CardContent class="flex flex-1 items-center justify-center px-6 sm:px-8" aria-live="polite">
          <div v-if="state === 'loading'" class="text-center">
            <span class="mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary"><Loader2 aria-hidden="true" class="size-8 animate-spin" /></span>
            <h3 class="mt-5 text-xl font-bold">{{ t('workspace.generating') }}</h3>
            <p class="mt-2 text-muted-foreground">{{ t('workspace.loadingHint') }}</p>
          </div>

          <div v-else-if="state === 'result' || state === 'saved'" class="w-full text-center">
            <img :src="demoArtwork" :alt="t('workspace.imageAlt')" class="mx-auto max-h-[23rem] w-full rounded-2xl border border-border bg-muted object-contain shadow-sm" />
            <div class="mt-5">
              <h3 class="text-xl font-bold">{{ state === 'saved' ? t('workspace.saved') : t('workspace.resultTitle') }}</h3>
              <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{{ t('workspace.resultDescription') }}</p>
            </div>
          </div>

          <div v-else class="max-w-md text-center">
            <span class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-secondary text-primary"><WandSparkles aria-hidden="true" class="size-9" /></span>
            <h3 class="mt-6 text-2xl font-bold">{{ t('workspace.emptyTitle') }}</h3>
            <p class="mt-2 leading-7 text-muted-foreground">{{ t('workspace.emptyDescription') }}</p>
          </div>
        </CardContent>
        <CardFooter v-if="state === 'result' || state === 'saved'" class="flex-col gap-3 px-6 pb-7 sm:flex-row sm:px-8">
          <Button variant="outline" class="h-12 w-full rounded-xl sm:w-auto" @click="reset">{{ t('workspace.tryAgain') }}</Button>
          <Button v-if="state === 'result'" class="h-12 w-full rounded-xl sm:w-auto" @click="state = 'saved'">
            <Check aria-hidden="true" /> {{ t('workspace.save') }}
          </Button>
          <Button v-else class="h-12 w-full rounded-xl sm:w-auto" @click="router.push(locationWithDemo('/freeimages'))">
            <Images aria-hidden="true" /> {{ t('home.viewArtwork') }}
          </Button>
        </CardFooter>
      </Card>

      <div class="space-y-6">
        <Card class="border-border/80 bg-[#fffaf4] shadow-sm">
          <CardHeader class="space-y-2 px-6 pb-2">
            <span class="flex size-11 items-center justify-center rounded-2xl bg-[#f3e8dc] text-[#825b3e]"><WandSparkles aria-hidden="true" class="size-5" /></span>
            <h2 class="text-xl font-bold">{{ t('workspace.promptLabel') }}</h2>
          </CardHeader>
          <CardContent class="space-y-3 px-6">
            <Label for="demo-prompt" class="sr-only">{{ t('workspace.promptLabel') }}</Label>
            <Textarea
              id="demo-prompt"
              v-model="prompt"
              :placeholder="t('workspace.promptPlaceholder')"
              :disabled="state === 'loading'"
              :aria-invalid="Boolean(error)"
              :aria-describedby="error ? 'demo-prompt-error' : undefined"
              class="min-h-32 resize-none rounded-xl bg-white p-4 text-base leading-6"
              @input="error = ''"
            />
            <p v-if="error" id="demo-prompt-error" class="text-sm font-semibold text-red-700">{{ error }}</p>
          </CardContent>
          <CardFooter class="px-6 pb-6">
            <Button class="h-12 w-full rounded-xl text-base font-bold" :disabled="state === 'loading'" @click="generate">
              <Loader2 v-if="state === 'loading'" aria-hidden="true" class="animate-spin" />
              <WandSparkles v-else aria-hidden="true" />
              {{ state === 'loading' ? t('workspace.generating') : t('workspace.generate') }}
            </Button>
          </CardFooter>
        </Card>

        <section aria-labelledby="other-methods-title">
          <h2 id="other-methods-title" class="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground">{{ t('workspace.methods') }}</h2>
          <div class="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <button disabled class="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-white px-4 text-left font-semibold opacity-60"><Image aria-hidden="true" class="size-5 text-primary" /> {{ t('workspace.fromImage') }}</button>
            <button disabled class="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-white px-4 text-left font-semibold opacity-60"><Brush aria-hidden="true" class="size-5 text-primary" /> {{ t('workspace.fromSketch') }}</button>
            <button disabled class="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-white px-4 text-left font-semibold opacity-60"><Images aria-hidden="true" class="size-5 text-primary" /> {{ t('workspace.mixImages') }}</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
