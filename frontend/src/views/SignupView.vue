<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { userService } from '../api/userService'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import signupBg from '@/assets/utils/fondo_login.jpg'
import logoImg from '/logo_comfymind.svg'
import { AlertCircleIcon} from 'lucide-vue-next'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'


const router = useRouter()
const { locationWithDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()
const newUser = ref({ email: '', full_name: '', password: '', type: '' })
const confirmPassword = ref('')
const message = ref('')
const messageIsTranslationKey = ref(false)
const messageType = ref<'error' | 'success' | ''>('')
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordRequirements = ref({
  length: false,
  uppercase: false,
  number: false,
  special: false,
})

const bgStyle = computed(() => ({
  backgroundImage: `url(${signupBg})`,
  backgroundSize: 'cover',
  backgroundPosition: 'top center',
}))

const displayedMessage = computed(() => messageIsTranslationKey.value ? t(message.value) : message.value)

const validateEmail = (emailStr: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailStr)
}

const updatePasswordRequirements = (password: string) => {
  passwordRequirements.value = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
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
  messageType.value = ''

  if (!validateForm()) {
    message.value = 'signup.errorCheck'
    messageIsTranslationKey.value = true
    messageType.value = 'error'
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
    router.push(locationWithDemo('/login'))
  } catch (err: any) {
    messageType.value = 'error'
    const detail = err?.response?.data?.detail
    if (typeof detail === 'string' && detail) {
      message.value = detail
    } else {
      message.value = 'signup.errorGeneric'
      messageIsTranslationKey.value = true
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
    <div
      class="relative flex flex-col items-center px-4 py-16 min-h-screen w-full"
      :style="bgStyle"
    >
    <!-- overlay suave -->
    <div class="absolute inset-0 bg-white/60"></div>

    <div class="relative z-10 mb-4 flex w-full max-w-md justify-end">
      <LanguageSelector />
    </div>

    <div class="relative z-10 flex flex-col w-full max-w-md items-center">      <!-- Logo -->
      <div class="mb-6 text-center">
        <img :src="logoImg" alt="ComfyMind" class="mx-auto h-32 w-32 mb-2" />
        <h1 style="font-family: 'Nunito', sans-serif; font-size: 2.2rem; font-weight: 800; color: rgb(17, 24, 39)">ComfyMind</h1>
      </div>

      <!-- Card de signup -->
      <Card class="w-full text-gray-900 shadow-lg bg-white/95 border border-white/70">
        <CardHeader>
          <CardTitle>{{ t('signup.title') }}</CardTitle>
          <CardDescription>
            {{ t('signup.description') }}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="addUser" class="space-y-4" @keydown.enter="addUser" autocomplete="off">
            <!-- Email field -->
            <div class="flex flex-col space-y-1.5">
              <Label for="email">{{ t('signup.email') }}</Label>
              <Input
                id="email"
                type="email"
                :placeholder="t('signup.emailPlaceholder')"
                v-model="newUser.email"
                :class="{ 'border-red-500': errors.email }"
                @input="() => { if (errors.email) delete errors.email }"
              />
              <span v-if="errors.email" class="text-xs text-red-600 mt-0.5">
                {{ t(errors.email) }}
              </span>
            </div>

            <!-- Full Name field -->
            <div class="flex flex-col space-y-1.5">
              <Label for="full_name">{{ t('signup.fullName') }}</Label>
              <Input
                id="full_name"
                type="text"
                :placeholder="t('signup.fullNamePlaceholder')"
                v-model="newUser.full_name"
                :class="{ 'border-red-500': errors.full_name }"
                @input="() => { if (errors.full_name) delete errors.full_name }"
              />
              <span v-if="errors.full_name" class="text-xs text-red-600 mt-0.5">
                {{ t(errors.full_name) }}
              </span>
            </div>

            <!-- Password field -->
            <div class="flex flex-col space-y-1.5">
              <Label for="password">{{ t('signup.password') }}</Label>
              <div class="relative">
                <Input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  v-model="newUser.password"
                  @input="(e) => updatePasswordRequirements((e.target).value)"
                  :class="{ 'border-red-500': errors.password }"
                  class="pr-10"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  :aria-label="showPassword ? t('signup.hidePassword') : t('signup.showPassword')"
                >
                  <Eye v-if="!showPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
              <span v-if="errors.password" class="text-xs text-red-600 mt-0.5">
                {{ t(errors.password) }}
              </span>
              <!-- Password requirements checker -->
              <div class="mt-2 space-y-1 text-xs">
                <div :class="passwordRequirements.length ? 'text-green-600' : 'text-gray-500'">
                  ✓ {{ t('signup.requirementLength') }}
                </div>
                <div :class="passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-500'">
                  ✓ {{ t('signup.requirementUppercase') }}
                </div>
                <div :class="passwordRequirements.number ? 'text-green-600' : 'text-gray-500'">
                  ✓ {{ t('signup.requirementNumber') }}
                </div>
                <div :class="passwordRequirements.special ? 'text-green-600' : 'text-gray-500'">
                  ✓ {{ t('signup.requirementSpecial') }}
                </div>
              </div>
            </div>

            <!-- Confirm Password field -->
            <div class="flex flex-col space-y-1.5">
              <Label for="confirmPassword">{{ t('signup.confirmPassword') }}</Label>
              <div class="relative">
                <Input
                  id="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  v-model="confirmPassword"
                  :class="{ 'border-red-500': errors.confirmPassword }"
                  @input="() => { if (errors.confirmPassword) delete errors.confirmPassword }"
                  class="pr-10"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  :aria-label="showConfirmPassword ? t('signup.hideConfirmPassword') : t('signup.showConfirmPassword')"
                >
                  <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
                  <EyeOff v-else class="h-4 w-4" />
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="text-xs text-red-600 mt-0.5">
                {{ t(errors.confirmPassword) }}
              </span>
            </div>

            <!-- User Type field -->
            <div class="flex flex-col space-y-1.5">
              <Label for="type">{{ t('signup.userType') }}</Label>

                <Select id="type"
                  v-model="newUser.type"
                  :class="['border rounded p-2 text-sm', errors.type ? 'border-red-500' : 'border-gray-300']"
                  @change="() => { if (errors.type) delete errors.type }">
                  <SelectTrigger class="w-full">
                    <SelectValue :placeholder="t('signup.userTypePlaceholder')" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{{ t('signup.userTypes') }}</SelectLabel>
                      <SelectItem value="patient">
                        {{ t('signup.patient') }}
                      </SelectItem>
                      <SelectItem value="therapist">
                        {{ t('signup.therapist') }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              <span v-if="errors.type" class="text-xs text-red-600 mt-0.5">
                {{ t(errors.type) }}
              </span>
            </div>

            <!-- General message -->
            <div
              v-if="message"
            >
              <Alert class="bg-red-100 text-red-800 border border-red-300">
                <AlertCircleIcon />
                <AlertTitle>{{ t('signup.errorTitle') }}</AlertTitle>
                <AlertDescription class="text-red-800">
                  {{ displayedMessage }}
                </AlertDescription>
              </Alert>
            </div>
          </form>
        </CardContent>

        <CardFooter class="flex flex-col gap-2">
          <Button
            class="w-full"
            @click="addUser"
            type="submit"
            :disabled="isLoading"
          >
            {{ isLoading ? t('signup.submitting') : t('signup.submit') }}
          </Button>

          <p
            class="mt-2 text-center text-sm text-blue-600 hover:underline cursor-pointer"
            @click="router.push(locationWithDemo('/login'))"
          >
            {{ t('signup.returnToLogin') }}
          </p>
        </CardFooter>

      </Card>
    </div>
  </div>
</template>

<style scoped>
/* Ocultar el icono nativo de mostrar/ocultar contraseña del navegador */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

input[type="password"]::-webkit-credentials-auto-fill-button {
  display: none !important;
}
</style>
