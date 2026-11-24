<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { isDemo } from '@/lib/demo/isDemo'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { userService } from '../api/userService'
import { DuskLayout, SButton, SField, SNotice } from '@/components/sanctuary'
import SanctuaryScene from '@/components/sanctuary/SanctuaryScene.vue'

const router = useRouter()
const { locationWithDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()
const newUser = ref({ email: '', full_name: '', password: '', type: '' })
const confirmPassword = ref('')
const message = ref('')
const messageIsTranslationKey = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const displayedMessage = computed(() => messageIsTranslationKey.value ? t(message.value) : message.value)

const validateEmail = (emailStr: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailStr)
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!newUser.value.email.trim()) {
    errors.value.email = 'signup.emailRequired'
  } else if (!validateEmail(newUser.value.email)) {
    errors.value.email = 'signup.emailInvalid'
  }

  if (!newUser.value.full_name.trim()) {
    errors.value.full_name = 'signup.fullNameRequired'
  } else if (newUser.value.full_name.trim().length < 3) {
    errors.value.full_name = 'signup.fullNameLength'
  }

  if (!newUser.value.password) {
    errors.value.password = 'signup.passwordRequired'
  } else if (newUser.value.password.length < 8) {
    errors.value.password = 'signup.passwordLength'
  } else if (!/[A-Z]/.test(newUser.value.password)) {
    errors.value.password = 'signup.passwordUppercase'
  } else if (!/\d/.test(newUser.value.password)) {
    errors.value.password = 'signup.passwordNumber'
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newUser.value.password)) {
    errors.value.password = 'signup.passwordSpecial'
  }

  if (!confirmPassword.value) {
    errors.value.confirmPassword = 'signup.confirmPasswordRequired'
  } else if (newUser.value.password !== confirmPassword.value) {
    errors.value.confirmPassword = 'signup.passwordMismatch'
  }

  if (!newUser.value.type) {
    errors.value.type = 'signup.userTypeRequired'
  }

  return Object.keys(errors.value).length === 0
}

const addUser = async () => {
  message.value = ''
  messageIsTranslationKey.value = false

  if (!validateForm()) {
    message.value = 'signup.errorCheck'
    messageIsTranslationKey.value = true
    return
  }

  isLoading.value = true

  try {
    await userService.createUser({
      email: newUser.value.email,
      full_name: newUser.value.full_name,
      password: newUser.value.password,
      type: newUser.value.type,
    })
    router.push(locationWithDemo(isDemo ? '/home' : '/login'))
  } catch {
    // Plain language, never raw server text (DESIGN.md §8).
    message.value = 'signup.errorGeneric'
    messageIsTranslationKey.value = true
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <DuskLayout width="32rem">
    <template #scene><SanctuaryScene object="escultura" framing="background" /></template>
    <template #top><LanguageSelector /></template>

    <div class="scrim p-6 sm:p-10">
      <p class="type-wordmark text-mark">ComfyMind</p>
      <h1 class="type-h1 mt-5">{{ t('signup.title') }}</h1>
      <p class="type-body mt-2 text-muted-foreground">{{ t('signup.lede') }}</p>

      <form class="mt-8 flex flex-col gap-6" novalidate @submit.prevent="addUser">
        <SNotice v-if="displayedMessage" tone="danger" :title="t('signup.errorHeading')">{{ displayedMessage }}</SNotice>

        <SField v-model="newUser.full_name" :label="t('signup.fullName')" name="name" autocomplete="name" :error="errors.full_name ? t(errors.full_name) : undefined" />
        <SField v-model="newUser.email" :label="t('signup.email')" type="email" name="email" autocomplete="email" :error="errors.email ? t(errors.email) : undefined" />
        <SField
          v-model="newUser.password"
          :label="t('signup.password')"
          type="password"
          name="new-password"
          autocomplete="new-password"
          :help="t('signup.passwordHelp')"
          :error="errors.password ? t(errors.password) : undefined"
        />
        <SField
          v-model="confirmPassword"
          :label="t('signup.confirmPassword')"
          type="password"
          name="confirm-password"
          autocomplete="new-password"
          :error="errors.confirmPassword ? t(errors.confirmPassword) : undefined"
        />

        <fieldset class="flex flex-col gap-3" :aria-describedby="errors.type ? 'type-error' : undefined">
          <legend class="type-body mb-2 font-semibold">{{ t('signup.userType') }}</legend>
          <label
            v-for="option in ['patient', 'therapist']"
            :key="option"
            :class="['flex min-h-14 cursor-pointer items-center gap-4 rounded-control border-2 bg-card px-4', newUser.type === option ? 'border-primary' : 'border-input']"
          >
            <input v-model="newUser.type" type="radio" name="user-type" :value="option" class="size-5 accent-[var(--primary)]" />
            <span class="type-body">{{ t(`signup.${option}`) }}</span>
          </label>
          <p v-if="errors.type" id="type-error" role="alert" class="type-small font-semibold text-danger">{{ t(errors.type) }}</p>
        </fieldset>

        <SButton type="submit" block :busy="isLoading">{{ isLoading ? t('signup.submitting') : t('signup.submit') }}</SButton>
      </form>

      <div class="mt-4 flex justify-center">
        <SButton variant="quiet" class="px-2 text-link underline" to="/login">{{ t('signup.returnToLogin') }}</SButton>
      </div>
    </div>
  </DuskLayout>
</template>
