<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService } from '../api/userService'
import { isDemo } from '@/lib/demo/isDemo'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { DuskLayout, SButton, SField, SNotice } from '@/components/sanctuary'
import SanctuaryScene from '@/components/sanctuary/SanctuaryScene.vue'

const email = ref('')
const password = ref('')
const message = ref('')
const isLoading = ref(false)
const showForgot = ref(false)
const errors = ref<Record<string, string>>({})
const router = useRouter()
const route = useRoute()
const { locationWithDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()

// ?role=therapist only changes the heading copy.
const isTherapist = computed(() => route.query.role === 'therapist')

const demoLogin = async (role: 'patient' | 'therapist') => {
  isLoading.value = true
  try {
    await userService.login({ email: role === 'therapist' ? 'marta@demo.comfymind' : 'alex@demo.comfymind', password: 'demo-demo' })
    router.push(locationWithDemo('/home'))
  } finally {
    isLoading.value = false
  }
}

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
  if (!validateForm()) return // field errors are shown under each field
  isLoading.value = true
  try {
    await userService.login({ email: email.value, password: password.value })
    router.push(locationWithDemo('/home'))
  } catch (error: any) {
    // Plain language, never raw server text or codes (DESIGN.md §8).
    const status = error?.response?.status
    message.value = status === 400 || status === 401 || status === 403 || status === 404
      ? t('login.errorWrong')
      : t('login.errorTryLater')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <DuskLayout width="30rem">
    <template #scene><SanctuaryScene object="escultura" framing="background" /></template>
    <template #top><LanguageSelector /></template>

    <div class="scrim p-6 sm:p-10">
      <p class="type-wordmark text-mark">ComfyMind</p>
      <h1 class="type-h1 mt-5">{{ isTherapist ? t('login.headingTherapist') : t('login.heading') }}</h1>
      <!-- In demo the shortcuts come first, so the "email and password" lede would describe the wrong thing. -->
      <p v-if="isTherapist || !isDemo" class="type-body mt-2 text-muted-foreground">{{ isTherapist ? t('login.ledeTherapist') : t('login.lede') }}</p>

      <!-- Demo: the shortcuts come first (reviewers have no credentials), Alex is the one primary action. -->
      <section v-if="isDemo" class="mt-8 flex flex-col gap-4" data-testid="demo-login" aria-labelledby="demo-title">
        <div>
          <h2 id="demo-title" class="type-h3">{{ t('login.demoTitle') }}</h2>
          <p class="type-small mt-1 text-muted-foreground">{{ t('login.demoHint') }}</p>
        </div>
        <SButton block :disabled="isLoading" data-testid="demo-patient" @click="demoLogin('patient')">
          {{ t('login.demoPatient') }}
        </SButton>
        <SButton variant="secondary" block :disabled="isLoading" data-testid="demo-therapist" @click="demoLogin('therapist')">
          {{ t('login.demoTherapist') }}
        </SButton>
        <hr class="flute-rule mt-4" />
        <p class="type-small font-semibold text-muted-foreground">{{ t('login.orEmail') }}</p>
      </section>

      <form :class="[isDemo ? 'mt-4' : 'mt-8', 'flex flex-col gap-6']" novalidate @submit.prevent="login">
        <SNotice v-if="message" tone="danger" :title="t('login.errorHeading')">{{ message }}</SNotice>

        <SField
          v-model="email"
          :label="t('login.email')"
          type="email"
          name="email"
          autocomplete="email"
          :error="errors.email"
          @update:model-value="delete errors.email"
        />
        <SField
          v-model="password"
          :label="t('login.password')"
          type="password"
          name="password"
          autocomplete="current-password"
          :error="errors.password"
          @update:model-value="delete errors.password"
        />

        <SButton type="submit" block :variant="isDemo ? 'secondary' : 'primary'" :busy="isLoading">{{ isLoading ? t('login.entering') : t('login.enter') }}</SButton>
      </form>

      <div class="mt-4 flex flex-wrap items-center gap-x-4">
        <SButton variant="quiet" class="px-2 text-link underline" :aria-expanded="showForgot" @click="showForgot = !showForgot">
          {{ t('login.forgot') }}
        </SButton>
        <p v-if="showForgot" class="type-small order-last w-full text-muted-foreground" role="status">{{ t('login.forgotHelp') }}</p>
        <SButton variant="quiet" class="px-2 text-link underline" :disabled="isLoading" @click="router.push(locationWithDemo('/signup'))">
          {{ t('login.create') }}
        </SButton>
      </div>
    </div>
  </DuskLayout>
</template>
