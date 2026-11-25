<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
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
// Demo: the email form is folded under "O entra con tu correo" (opens in place, focus stays on the toggle).
const showEmail = ref(false)
const emailBlock = ref<HTMLElement | null>(null)
const toggleEmail = () => {
  showEmail.value = !showEmail.value
  if (showEmail.value) void nextTick(() => emailBlock.value?.scrollIntoView({ block: 'nearest' }))
}
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
  <!-- Same left line as the landing plaque, so the plaque becomes the door. A little wider than the plaque at 1024
       (the fields and the demo buttons need the room; the scene here is only a veiled background). -->
  <DuskLayout width="clamp(26rem, 36vw, 30rem)" fit>
    <template #scene><SanctuaryScene object="escultura" framing="background" /></template>
    <template #top><LanguageSelector /></template>

    <!-- One panel, one left edge: every line, field and link starts on the same vertical (no 4px link indents).
         Rhythm: 16 between a heading and its line, 24 between blocks, a fluted course between the two ways in. -->
    <div class="scrim px-6 py-7 sm:px-10 sm:py-9">
      <p class="type-wordmark text-mark">ComfyMind</p>
      <h1 class="type-h1 mt-4">{{ isTherapist ? t('login.headingTherapist') : t('login.heading') }}</h1>
      <!-- In demo the shortcuts come first, so the "email and password" lede would describe the wrong thing. -->
      <p v-if="isTherapist || !isDemo" class="type-body mt-2 text-muted-foreground">{{ isTherapist ? t('login.ledeTherapist') : t('login.lede') }}</p>

      <!-- Demo: the shortcuts come first (reviewers have no credentials), Alex is the one primary action. -->
      <section v-if="isDemo" class="mt-6" data-testid="demo-login" aria-labelledby="demo-title">
        <h2 id="demo-title" class="type-h3">{{ t('login.demoTitle') }}</h2>
        <p class="type-small mt-1 text-muted-foreground">{{ t('login.demoHint') }}</p>
        <SButton block class="mt-4" :disabled="isLoading" data-testid="demo-patient" @click="demoLogin('patient')">
          {{ t('login.demoPatient') }}
        </SButton>
        <!-- One primary per column (VC4 §4b): Marta is a text link. -->
        <SButton variant="quiet" class="mt-1 !justify-start !px-0 text-left text-link underline" :disabled="isLoading" data-testid="demo-therapist" @click="demoLogin('therapist')">
          {{ t('login.demoTherapist') }}
        </SButton>
        <hr class="flute-rule mt-5" />
        <!-- The email way in is folded away in demo, so the panel fits one screen; it opens in place. -->
        <SButton
          variant="quiet"
          class="mt-3 !px-0 text-foreground"
          :aria-expanded="showEmail"
          aria-controls="email-login"
          data-testid="email-toggle"
          @click="toggleEmail"
        >
          {{ t('login.orEmail') }}
          <ChevronDown :class="['motion-safe:transition-transform', showEmail && 'rotate-180']" aria-hidden="true" />
        </SButton>
      </section>

      <div v-show="!isDemo || showEmail" id="email-login" ref="emailBlock">
        <form :class="[isDemo ? 'mt-3' : 'mt-6', 'flex flex-col gap-5']" novalidate @submit.prevent="login">
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

          <!-- The forgotten-password help belongs to the password, so it sits right under it. -->
          <div class="-mt-3">
            <SButton variant="quiet" class="!px-0 text-link underline" :aria-expanded="showForgot" @click="showForgot = !showForgot">
              {{ t('login.forgot') }}
            </SButton>
            <p v-if="showForgot" class="type-small text-muted-foreground" role="status">{{ t('login.forgotHelp') }}</p>
          </div>

          <!-- In demo Alex keeps the only peach button; Entrar is the bordered secondary, still a 56px target.
               "Crear una cuenta" shares its row, so the email way in ends on one line. -->
          <div :class="['flex flex-wrap items-center gap-x-8 gap-y-3', !isDemo && 'flex-col items-stretch']">
            <SButton type="submit" :block="!isDemo" :variant="isDemo ? 'secondary' : 'primary'" :busy="isLoading">
              {{ isLoading ? t('login.entering') : t('login.enter') }}
            </SButton>
            <SButton variant="quiet" :class="['!px-0 text-link underline', !isDemo && 'self-start']" :disabled="isLoading" @click="router.push(locationWithDemo('/signup'))">
              {{ t('login.create') }}
            </SButton>
          </div>
        </form>
      </div>
    </div>
  </DuskLayout>
</template>
