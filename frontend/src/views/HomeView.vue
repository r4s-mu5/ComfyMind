<script setup lang="ts">
import { createSocket } from '@/lib/config'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { userService } from '../api/userService'
import { sessionsService } from '../api/sessionsService'
import { comfyService } from '../api/comfyService'
import { urlFor } from '@/components/create/images'
import { useNavLink } from '@/components/create/useNavLink'
import { ArtworkMount, SButton, SessionCard, SNotice, frameFor } from '@/components/sanctuary'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import CreateSessionModal from '@/components/CreateSessionModal.vue'


const router = useRouter()
const { ensureUTCString } = useDateHelpers()
const { locationWithDemo } = usePrototypeDemo()
const nav = useNavLink()
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

const displayName = computed(() => user.value?.full_name?.split(/\s+/)[0] || '')
const hasActiveSession = computed(() => Boolean(activeSession.value && !activeSession.value.ended_at))
const latest = ref<{ fileName: string; src: string } | null>(null)

const toDate = (value?: string) => (value ? new Date(ensureUTCString(value)) : null)
const formatTime = (value?: string) => {
  const d = toDate(value)
  return d ? new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(d) : ''
}

// Time-of-day greeting: morning 5-12, afternoon 12-20, evening otherwise.
const greeting = computed(() => {
  const h = new Date().getHours()
  const key = h >= 5 && h < 12 ? 'home.greetMorning' : h >= 12 && h < 20 ? 'home.greetAfternoon' : 'home.greetEvening'
  return displayName.value ? t(key, { name: displayName.value }) : t(`${key}NoName`)
})

const shownSession = computed(() => (hasActiveSession.value ? activeSession.value : nextSession.value))
const shownOther = computed(() => (hasActiveSession.value ? anotherUserSession.value : nextAnotherUserSession.value))
const otherFirstName = computed(() => shownOther.value?.full_name?.split(/\s+/)[0] || '')
const isToday = (value?: string) => toDate(value)?.toDateString() === new Date().toDateString()
const sessionStatus = computed(() => (hasActiveSession.value ? 'now' : isToday(shownSession.value?.start_date) ? 'today' : 'next'))
const sessionRange = computed(() => `${formatTime(shownSession.value?.start_date)} – ${formatTime(shownSession.value?.end_date)}`)
const lede = computed(() => {
  if (hasActiveSession.value) return t('home.ledeLive', { name: otherFirstName.value })
  if (nextSession.value && isToday(nextSession.value.start_date)) return t('home.ledeLater', { time: formatTime(nextSession.value.start_date) })
  if (nextSession.value) return t('home.ledeNext')
  return t('home.ledeNone')
})

const loadLatest = async () => {
  latest.value = null
  if (!user.value?.id || user.value.type !== 'patient') return
  try {
    const resp: any = await comfyService.getImagesForUser(user.value.id)
    const list: { id: number; fileName: string }[] = resp?.data ?? resp?.images ?? []
    const pick = [...list].filter((i) => i.fileName.startsWith('generated')).sort((a, b) => b.id - a.id)[0]
    if (pick) latest.value = { fileName: pick.fileName, src: urlFor(pick.fileName) }
  } catch {
    latest.value = null
  }
}

const disconnectHomeWs = () => {
  homeWs?.close()
  homeWs = null
}

const connectHomeWs = () => {
  const token = localStorage.getItem('token')
  if (!token) return
  homeWs = createSocket(`/ws/home?token=${token}`)
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
  loading.value = true
  errorMsg.value = ''
  try {
    await loadActiveSession()
    if (!activeSession.value) await loadNextSession()
    await loadSessions()
    await loadLatest()
  } catch {
    errorMsg.value = t('home.errorTitle')
  } finally {
    loading.value = false
  }
}

const enterSession = () => {
  if (!activeSession.value) return
  const role = user.value?.type === 'therapist' ? 'therapist' : 'patient'
  router.push(`/session/${activeSession.value.id}/${role}`)
}

// Therapist agenda: today's sessions as ledger rows, then the next few days as a short list.
const nameOf = (id: number) => patients.value.find((p) => p.id === id)?.full_name || ''
const startOf = (s: any) => toDate(s.start_date)?.getTime() ?? 0
const openSessions = computed(() => sessionsList.value.filter((s) => !s.ended_at).sort((a, b) => startOf(a) - startOf(b)))
const todaySessions = computed(() => openSessions.value.filter((s) => isToday(s.start_date) || s.id === activeSession.value?.id))
const upcomingSessions = computed(() => {
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  return openSessions.value.filter((s) => startOf(s) > endOfToday.getTime()).slice(0, 4)
})
const rangeOf = (s: any) => `${formatTime(s.start_date)} – ${formatTime(s.end_date)}`
const dayOf = (s: any) => {
  const d = toDate(s.start_date)
  if (!d) return ''
  const text = new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(d)
  return text.charAt(0).toUpperCase() + text.slice(1)
}
const todayLong = computed(() => dayOf({ start_date: new Date().toISOString() }))

const handleSessionCreated = async () => {
  showCreateModal.value = false
  await refreshHomeData()
}

onMounted(async () => {
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
  <div class="flex flex-col gap-12 pb-8">
    <p v-if="loading" class="type-body py-16 text-muted-foreground" aria-live="polite">{{ t('home.loading') }}</p>

    <section v-else-if="errorMsg" class="flex max-w-[40rem] flex-col gap-5 py-10">
      <SNotice tone="danger" :title="t('home.errorTitle')">{{ t('home.errorBody') }}</SNotice>
      <SButton variant="secondary" class="self-start" @click="refreshHomeData">{{ t('home.retry') }}</SButton>
    </section>

    <!-- Patient home (DESIGN.md §7): one obvious next step, the latest obra hung beside it. -->
    <template v-else-if="user?.type === 'patient'">
      <header class="flex flex-col gap-3">
        <h1 class="type-h1">{{ greeting }}</h1>
        <p class="type-body measure text-muted-foreground">{{ lede }}</p>
      </header>

      <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start xl:gap-16">
        <div class="flex flex-col gap-10">
          <section class="flex flex-col gap-4" aria-labelledby="home-session">
            <h2 id="home-session" class="type-h2">{{ hasActiveSession ? t('home.sessionNow') : t('home.sessionNext') }}</h2>
            <template v-if="shownSession">
              <SessionCard
                :date="toDate(shownSession.start_date)!"
                :time="sessionRange"
                :therapist="shownOther?.full_name"
                :status="sessionStatus"
              >
                <template v-if="hasActiveSession" #action>
                  <SButton @click="enterSession">{{ t('session.enter') }}</SButton>
                </template>
              </SessionCard>
              <p v-if="!hasActiveSession" class="type-small text-muted-foreground">{{ t('home.sessionWait') }}</p>
            </template>
            <p v-else class="type-body text-muted-foreground">{{ t('home.noSession') }}</p>
          </section>

          <hr class="flute-rule" />

          <section class="flex flex-col gap-3" aria-labelledby="home-own">
            <h2 id="home-own" class="type-h2">{{ t('home.ownTitle') }}</h2>
            <p class="type-body measure text-muted-foreground">{{ t('home.ownBody') }}</p>
            <SButton
              :variant="hasActiveSession ? 'secondary' : 'primary'"
              v-bind="nav('/generation')"
              class="mt-2 self-start"
            >
              {{ hasActiveSession ? t('home.ownAction') : t('home.create') }}
            </SButton>
          </section>
        </div>

        <section class="flex flex-col gap-5" aria-labelledby="home-latest">
          <h2 id="home-latest" class="type-h2">{{ t('home.latest') }}</h2>
          <ArtworkMount v-if="latest" :src="latest.src" :made-by="displayName" :frame="frameFor(latest.fileName, 'arch')" mat="md" ratio="4 / 5" />
          <div
            v-else
            class="niche flex aspect-[4/5] items-end justify-center border-[1.5px] border-dashed border-input bg-card p-8 text-center"
          >
            <p class="type-body text-muted-foreground">{{ t('home.latestEmpty') }}</p>
          </div>
          <RouterLink :to="locationWithDemo('/freeimages')" class="type-body inline-flex min-h-12 items-center self-start font-semibold text-link underline underline-offset-4 hover:no-underline">{{ t('home.allWorks') }}</RouterLink>
        </section>
      </div>
    </template>

    <!-- Therapist home: the day as a ledger (DESIGN.md §7). Today's sessions as rows, the next days beside them. -->
    <template v-else>
      <header class="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div class="flex flex-col gap-3">
          <h1 class="type-h1">{{ greeting }}</h1>
          <p class="type-body text-muted-foreground">{{ hasActiveSession ? t('home.therapistLive') : t('home.therapistNone') }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
          <SButton variant="secondary" size="compact" @click="showCreateModal = true">{{ t('home.therapistCreate') }}</SButton>
          <SButton variant="quiet" size="compact" v-bind="nav('/calendar')">{{ t('home.therapistCalendar') }}</SButton>
        </div>
      </header>

      <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start xl:gap-16">
        <section class="flex flex-col gap-4" aria-labelledby="t-today">
          <h2 id="t-today" class="type-h2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            {{ t('home.therapistToday') }}
            <span class="type-body font-normal text-muted-foreground">{{ todayLong }}</span>
          </h2>
          <ul v-if="todaySessions.length" class="flex flex-col [&>li+li]:-mt-px">
            <li v-for="s in todaySessions" :key="s.id">
              <SessionCard
                :date="toDate(s.start_date)!"
                :time="rangeOf(s)"
                :therapist="nameOf(s.patient_id)"
                :status="s.id === activeSession?.id ? 'now' : 'today'"
              >
                <template v-if="s.id === activeSession?.id" #action>
                  <SButton size="compact" @click="enterSession">{{ t('session.enter') }}</SButton>
                </template>
              </SessionCard>
            </li>
          </ul>
          <p v-else class="type-body border-y border-border py-6 text-muted-foreground">{{ t('home.therapistTodayEmpty') }}</p>
        </section>

        <section class="flex flex-col gap-4" aria-labelledby="t-upcoming">
          <h2 id="t-upcoming" class="type-h2">{{ t('home.therapistUpcoming') }}</h2>
          <ol v-if="upcomingSessions.length" class="flex flex-col divide-y divide-border border-y border-border">
            <li v-for="s in upcomingSessions" :key="s.id" class="flex flex-col gap-1 py-4">
              <p class="type-small font-semibold text-muted-foreground">{{ dayOf(s) }}</p>
              <p class="type-body"><time :datetime="toDate(s.start_date)!.toISOString()">{{ rangeOf(s) }}</time> · {{ nameOf(s.patient_id) }}</p>
            </li>
          </ol>
          <p v-else class="type-body border-y border-border py-4 text-muted-foreground">{{ t('home.therapistUpcomingEmpty') }}</p>
        </section>
      </div>
    </template>

    <CreateSessionModal
      :open="showCreateModal"
      :patients="patients"
      :existing-sessions="sessionsList"
      @update:open="showCreateModal = $event"
      @session-created="handleSessionCreated"
    />
  </div>
</template>
