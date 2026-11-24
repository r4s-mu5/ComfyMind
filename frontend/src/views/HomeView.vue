<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, CalendarDays, Clock3, Image, Loader2, Palette, RefreshCw, Sparkles, UserRound } from 'lucide-vue-next'
import { userService } from '../api/userService'
import { sessionsService } from '../api/sessionsService'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import CreateSessionModal from '@/components/CreateSessionModal.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS_URL = API_URL.replace(/^http/, 'ws')

const router = useRouter()
const { formatLocalDate } = useDateHelpers()
const { isDemo, locationWithDemo } = usePrototypeDemo()
const { locale, t } = usePrototypeLocale()

const user = ref<any>(null)
const loading = ref(true)
const errorMsg = ref('')
const activeSession = ref<any>(null)
const nextSession = ref<any>(null)
const anotherUserSession = ref<any>(null)
const nextAnotherUserSession = ref<any>(null)
const patients = ref<any[]>([])
const sessionsList = ref<any[]>([])
const showCreateModal = ref(false)
let homeWs: WebSocket | null = null

const localeCode = computed(() => ({ ca: 'ca-ES', es: 'es-ES', en: 'en-GB' })[locale.value])
const displayName = computed(() => user.value?.full_name?.split(/\s+/)[0] || 'Alex')
const hasActiveSession = computed(() => Boolean(activeSession.value && !activeSession.value.ended_at))

const formatDate = (value?: string) => {
  if (!value) return ''
  if (!isDemo.value) return formatLocalDate(value).slice(0, 8)
  return new Intl.DateTimeFormat(localeCode.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(value))
}

const formatTime = (value?: string) => value ? formatLocalDate(value).slice(10, 16) : ''

const setDemoData = () => {
  user.value = { id: 'demo-patient', full_name: 'Alex', type: 'patient' }
  activeSession.value = {
    id: 'demo-session',
    therapist_id: 'demo-therapist',
    start_date: '2026-07-16T14:30:00Z',
    end_date: '2026-07-16T15:30:00Z',
    ended_at: null,
  }
  anotherUserSession.value = { id: 'demo-therapist', full_name: 'Marta Soler' }
  nextSession.value = null
  loading.value = false
}

const disconnectHomeWs = () => {
  homeWs?.close()
  homeWs = null
}

const connectHomeWs = () => {
  const token = localStorage.getItem('token')
  if (!token || isDemo.value) return
  homeWs = new WebSocket(`${WS_URL}/ws/home?token=${token}`)
  homeWs.onmessage = (event) => {
    try {
      if (JSON.parse(event.data).event === 'new_session') refreshHomeData()
    } catch {
      // Ignore malformed websocket messages and keep the current home state.
    }
  }
}

const loadActiveSession = async () => {
  activeSession.value = null
  anotherUserSession.value = null
  try {
    const response = await sessionsService.getActiveSession()
    if (!response || response.ended_at) return
    activeSession.value = response
    const otherId = user.value?.type === 'patient' ? response.therapist_id : response.patient_id
    anotherUserSession.value = await userService.getUserById(otherId)
  } catch (error) {
    console.warn('Unable to load active session', error)
  }
}

const loadNextSession = async () => {
  nextSession.value = null
  nextAnotherUserSession.value = null
  try {
    const response = await sessionsService.getNextSession()
    if (!response) return
    nextSession.value = response
    const otherId = user.value?.type === 'patient' ? response.therapist_id : response.patient_id
    nextAnotherUserSession.value = await userService.getUserById(otherId)
  } catch (error) {
    console.warn('Unable to load next session', error)
  }
}

const loadSessions = async () => {
  try {
    const response = await sessionsService.getMySessions()
    sessionsList.value = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
  } catch {
    sessionsList.value = []
  }
}

const refreshHomeData = async () => {
  if (isDemo.value) {
    setDemoData()
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    await loadActiveSession()
    if (!activeSession.value) await loadNextSession()
    await loadSessions()
  } catch {
    errorMsg.value = t('home.errorTitle')
  } finally {
    loading.value = false
  }
}

const enterSession = () => {
  if (isDemo.value) {
    router.push(locationWithDemo('/generation'))
    return
  }
  if (!activeSession.value) return
  const role = user.value?.type === 'therapist' ? 'therapist' : 'patient'
  router.push(`/session/${activeSession.value.id}/${role}`)
}

const handleSessionCreated = async () => {
  showCreateModal.value = false
  await refreshHomeData()
}

onMounted(async () => {
  if (isDemo.value) {
    setDemoData()
    return
  }

  try {
    user.value = await userService.getCurrentUser()
    if (user.value?.type === 'therapist') {
      const allUsers = await userService.getUsers()
      patients.value = Array.isArray(allUsers) ? allUsers.filter((item: any) => item.type === 'patient') : []
    }
    await refreshHomeData()
    if (user.value?.type === 'patient') connectHomeWs()
  } catch (error: any) {
    errorMsg.value = error?.response?.data?.detail || t('home.errorTitle')
    loading.value = false
  }
})

onBeforeUnmount(disconnectHomeWs)
</script>

<template>
  <div class="prototype-page">
    <section v-if="loading" class="flex min-h-[28rem] items-center justify-center" aria-live="polite">
      <div class="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
        <Loader2 aria-hidden="true" class="size-6 animate-spin text-primary" />
        <span class="font-semibold">{{ t('home.loading') }}</span>
      </div>
    </section>

    <section v-else-if="errorMsg" class="mx-auto max-w-2xl py-16">
      <Alert variant="destructive" class="bg-white p-6">
        <AlertTitle class="text-lg">{{ t('home.errorTitle') }}</AlertTitle>
        <AlertDescription class="mt-2">{{ errorMsg }}</AlertDescription>
      </Alert>
      <Button class="mt-5 h-12 rounded-xl px-6" @click="refreshHomeData">
        <RefreshCw aria-hidden="true" /> {{ t('home.tryAgain') }}
      </Button>
    </section>

    <template v-else-if="user?.type === 'patient'">
      <header class="mb-8 sm:mb-10">
        <p class="prototype-eyebrow">{{ t('home.eyebrow') }}</p>
        <h1 class="prototype-title mt-3">{{ t('home.greeting', { name: displayName }) }}</h1>
        <p class="prototype-lead mt-3">{{ t('home.description') }}</p>
      </header>

      <div class="grid gap-6 lg:grid-cols-[1.45fr_0.8fr]">
        <Card class="overflow-hidden border-0 bg-[#176b63] text-white shadow-[0_22px_55px_-35px_rgba(23,107,99,0.8)]">
          <CardHeader class="relative space-y-3 p-6 pb-2 sm:p-8 sm:pb-3">
            <div aria-hidden="true" class="absolute -right-16 -top-20 size-56 rounded-full bg-white/10" />
            <span class="relative flex size-12 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles class="size-6" />
            </span>
            <div class="relative">
              <p class="text-sm font-bold uppercase tracking-[0.15em] text-white/75">{{ t('nav.session') }}</p>
              <h2 class="mt-2 text-2xl font-bold sm:text-3xl">
                {{ hasActiveSession ? t('home.currentTitle') : t('home.upcomingTitle') }}
              </h2>
              <p class="mt-2 max-w-xl leading-7 text-white/85">
                {{ hasActiveSession ? t('home.currentDescription') : (nextSession ? '' : t('home.noUpcoming')) }}
              </p>
            </div>
          </CardHeader>

          <CardContent v-if="hasActiveSession || nextSession" class="px-6 sm:px-8">
            <dl class="grid gap-3 rounded-2xl bg-black/10 p-4 sm:grid-cols-3 sm:p-5">
              <div>
                <dt class="flex items-center gap-2 text-sm text-white/70"><UserRound class="size-4" /> {{ t('home.therapist') }}</dt>
                <dd class="mt-1 font-bold">{{ (hasActiveSession ? anotherUserSession : nextAnotherUserSession)?.full_name }}</dd>
              </div>
              <div>
                <dt class="flex items-center gap-2 text-sm text-white/70"><CalendarDays class="size-4" /> {{ t('home.date') }}</dt>
                <dd class="mt-1 font-bold">{{ formatDate((hasActiveSession ? activeSession : nextSession)?.start_date) }}</dd>
              </div>
              <div>
                <dt class="flex items-center gap-2 text-sm text-white/70"><Clock3 class="size-4" /> {{ t('home.schedule') }}</dt>
                <dd class="mt-1 font-bold">
                  {{ formatTime((hasActiveSession ? activeSession : nextSession)?.start_date) }}–{{ formatTime((hasActiveSession ? activeSession : nextSession)?.end_date) }}
                </dd>
              </div>
            </dl>
          </CardContent>

          <CardFooter class="px-6 pb-7 sm:px-8 sm:pb-8">
            <Button
              v-if="hasActiveSession"
              class="h-12 w-full rounded-xl bg-white text-base font-bold text-[#155c55] hover:bg-white/90 sm:w-auto sm:px-7"
              @click="enterSession"
            >
              {{ t('home.continueSession') }} <ArrowRight aria-hidden="true" />
            </Button>
            <Button
              v-else
              class="h-12 w-full rounded-xl bg-white text-base font-bold text-[#155c55] hover:bg-white/90 sm:w-auto sm:px-7"
              @click="router.push(locationWithDemo('/generation'))"
            >
              {{ t('home.startCreating') }} <ArrowRight aria-hidden="true" />
            </Button>
          </CardFooter>
        </Card>

        <div class="grid gap-6">
          <Card class="border-border/80 bg-[#fffaf4] shadow-sm">
            <CardHeader class="space-y-3 px-6 pb-2">
              <span class="flex size-11 items-center justify-center rounded-2xl bg-[#f3e8dc] text-[#825b3e]">
                <Palette aria-hidden="true" class="size-5" />
              </span>
              <h2 class="text-xl font-bold">{{ t('home.freeCreation') }}</h2>
              <p class="leading-6 text-muted-foreground">{{ t('home.freeCreationDescription') }}</p>
            </CardHeader>
            <CardFooter class="px-6 pb-6">
              <Button variant="outline" class="h-11 w-full rounded-xl bg-white" @click="router.push(locationWithDemo('/generation'))">
                {{ t('home.startCreating') }}
              </Button>
            </CardFooter>
          </Card>

          <Button
            variant="outline"
            class="h-auto min-h-20 justify-between rounded-2xl bg-white px-5 py-4 text-base shadow-sm"
            @click="router.push(locationWithDemo('/freeimages'))"
          >
            <span class="flex items-center gap-3"><Image aria-hidden="true" class="size-5 text-primary" /> {{ t('home.viewArtwork') }}</span>
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </template>

    <!-- Existing therapist responsibilities remain available; no therapist preview is introduced. -->
    <section v-else class="mx-auto max-w-xl py-10">
      <Card>
        <CardHeader>
          <h1 class="text-2xl font-bold">Inicio</h1>
          <p class="text-muted-foreground">{{ hasActiveSession ? 'Hay una sesión activa.' : 'No hay ninguna sesión activa.' }}</p>
        </CardHeader>
        <CardFooter>
          <Button v-if="hasActiveSession" class="w-full" @click="enterSession">Acceder a la sesión</Button>
          <Button v-else class="w-full" @click="showCreateModal = true">Añadir una nueva sesión</Button>
        </CardFooter>
      </Card>
    </section>

    <CreateSessionModal
      :open="showCreateModal"
      :patients="patients"
      :existing-sessions="sessionsList"
      @update:open="showCreateModal = $event"
      @session-created="handleSessionCreated"
    />
  </div>
</template>
