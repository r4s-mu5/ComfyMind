<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { AlertCircle, Eye, EyeOff, HeartHandshake } from 'lucide-vue-next'
import { userService } from '../api/userService'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const email = ref('')
const password = ref('')
const message = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const errors = ref<Record<string, string>>({})

const router = useRouter()
const { locationWithDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()

const validateEmail = (emailValue: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)

const validateForm = () => {
  errors.value = {}

  if (!email.value.trim()) errors.value.email = t('login.emailRequired')
  else if (!validateEmail(email.value)) errors.value.email = t('login.emailInvalid')

  if (!password.value) errors.value.password = t('login.passwordRequired')
  else if (password.value.length < 8) errors.value.password = t('login.passwordLength')

  return Object.keys(errors.value).length === 0
}

const login = async () => {
  message.value = ''

  if (!validateForm()) {
    message.value = t('login.errorCheck')
    return
  }

  isLoading.value = true
  try {
    await userService.login({ email: email.value, password: password.value })
    router.push(locationWithDemo('/home'))
  } catch (error: any) {
    const detail = error?.response?.data?.detail
    message.value = typeof detail === 'string' && detail ? detail : t('login.errorGeneric')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="relative min-h-screen overflow-hidden bg-[#eef4f1] px-4 py-6 sm:px-6 sm:py-10">
    <div aria-hidden="true" class="absolute -left-32 -top-36 size-96 rounded-full bg-[#cfe4de] blur-3xl" />
    <div aria-hidden="true" class="absolute -bottom-36 -right-24 size-[28rem] rounded-full bg-[#f1dfca] blur-3xl" />

    <div class="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col">
      <div class="flex justify-end">
        <LanguageSelector />
      </div>

      <div class="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1fr_28rem] lg:gap-20">
        <section class="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <img src="/logo_comfymind.svg" alt="ComfyMind" class="mx-auto mb-7 size-24 lg:mx-0" />
          <p class="prototype-eyebrow">{{ t('login.eyebrow') }}</p>
          <h1 class="mt-4 text-4xl font-bold tracking-tight text-[#17302d] sm:text-5xl">
            {{ t('login.title') }}
          </h1>
          <p class="mt-5 text-lg leading-8 text-[#526762]">
            {{ t('login.description') }}
          </p>
          <div class="mt-8 hidden items-center gap-3 text-sm font-semibold text-[#315b55] lg:flex">
            <span class="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
              <HeartHandshake aria-hidden="true" class="size-5" />
            </span>
            <span>ComfyMind</span>
          </div>
        </section>

        <Card class="w-full border-white/80 bg-white/95 shadow-[0_20px_60px_-30px_rgba(23,48,45,0.4)]">
          <CardHeader class="space-y-2 px-6 pb-1 pt-7 sm:px-8">
            <h2 class="text-2xl font-bold text-foreground">{{ t('login.submit') }}</h2>
            <p class="text-sm leading-6 text-muted-foreground">{{ t('login.description') }}</p>
          </CardHeader>

          <CardContent class="px-6 sm:px-8">
            <form class="space-y-5" novalidate @submit.prevent="login">
              <div class="space-y-2">
                <Label for="email" class="text-base">{{ t('login.email') }}</Label>
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  autocomplete="email"
                  :placeholder="t('login.emailPlaceholder')"
                  :aria-invalid="Boolean(errors.email)"
                  :aria-describedby="errors.email ? 'email-error' : undefined"
                  class="h-12 rounded-xl bg-white px-4 text-base"
                  @input="delete errors.email"
                />
                <p v-if="errors.email" id="email-error" class="text-sm font-medium text-red-700">
                  {{ errors.email }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="password" class="text-base">{{ t('login.password') }}</Label>
                <div class="relative">
                  <Input
                    id="password"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="••••••••"
                    :aria-invalid="Boolean(errors.password)"
                    :aria-describedby="errors.password ? 'password-error' : undefined"
                    class="h-12 rounded-xl bg-white px-4 pr-12 text-base"
                    @input="delete errors.password"
                  />
                  <button
                    type="button"
                    class="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    :aria-label="showPassword ? t('login.hidePassword') : t('login.showPassword')"
                    @click="showPassword = !showPassword"
                  >
                    <EyeOff v-if="showPassword" aria-hidden="true" class="size-5" />
                    <Eye v-else aria-hidden="true" class="size-5" />
                  </button>
                </div>
                <p v-if="errors.password" id="password-error" class="text-sm font-medium text-red-700">
                  {{ errors.password }}
                </p>
              </div>

              <Alert v-if="message" variant="destructive" class="bg-red-50">
                <AlertCircle aria-hidden="true" />
                <AlertTitle>{{ t('login.errorTitle') }}</AlertTitle>
                <AlertDescription>{{ message }}</AlertDescription>
              </Alert>

              <Button type="submit" class="h-12 w-full rounded-xl text-base font-bold" :disabled="isLoading">
                {{ isLoading ? t('login.submitting') : t('login.submit') }}
              </Button>
            </form>
          </CardContent>

          <CardFooter class="px-6 pb-7 sm:px-8">
            <Button
              variant="outline"
              class="h-12 w-full rounded-xl text-base"
              :disabled="isLoading"
              @click="router.push(locationWithDemo('/signup'))"
            >
              {{ t('login.createAccount') }}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </main>
</template>

<style scoped>
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}
</style>
