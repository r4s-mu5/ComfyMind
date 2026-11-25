<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
      <div class="flex flex-col gap-2">
        <h1 class="type-h1">{{ t('calendar.title') }}</h1>
        <p class="type-body text-muted-foreground">
          {{ user?.type === 'therapist' ? t('calendar.subtitleTherapist') : t('calendar.subtitlePatient') }}
        </p>
      </div>
      <SButton v-if="user?.type === 'therapist'" variant="secondary" size="compact" @click="openCreate">
        {{ t('home.therapistCreate') }}
      </SButton>
    </header>

    <p v-if="loading" role="status" class="type-body text-muted-foreground">{{ t('calendar.loading') }}</p>

    <!-- The month sits on the page with its own hairline grid: no card around it. -->
    <FullCalendar
      :key="locale"
      ref="calendarRef"
      :options="calendarOptions"
      class="fc-sanctuary"
    />

    <!-- Legend: a square sample + the word. Each event also carries the word for screen readers. -->
    <ul class="type-small flex flex-wrap gap-x-8 gap-y-2" aria-hidden="true">
      <li class="flex items-center gap-2"><span class="legend-swatch legend-now" /> {{ t('calendar.legendNow') }}</li>
      <li class="flex items-center gap-2"><span class="legend-swatch legend-next" /> {{ t('calendar.legendNext') }}</li>
      <li class="flex items-center gap-2"><span class="legend-swatch legend-done" /> {{ t('calendar.legendDone') }}</li>
    </ul>

    <Dialog :open="showModal" @update:open="(val) => !val && closeModal()">
      <DialogContent class="max-w-[34rem] sm:max-w-[34rem]">
        <template v-if="selectedSession">
          <p class="type-small font-semibold text-muted-foreground">{{ statusWord(selectedSession) }}</p>
          <DialogTitle class="type-h2 -mt-2">{{ detailTitle }}</DialogTitle>
          <DialogDescription class="type-body text-foreground">{{ whenText(selectedSession) }}</DialogDescription>

          <div class="mt-4 flex flex-wrap justify-end gap-3">
            <SButton v-if="isSessionActive(selectedSession)" size="compact" @click="router.push(`/session/${selectedSession.id}/${user?.type}`)">
              {{ t('calendar.enterActive') }}
            </SButton>
            <SButton v-if="user?.type === 'therapist' && canModify(selectedSession)" size="compact" variant="secondary" @click="openUpdate(selectedSession)">
              {{ t('calendar.update') }}
            </SButton>
            <SButton v-if="user?.type === 'therapist' && canModify(selectedSession)" size="compact" variant="danger" @click="askCancel(selectedSession.id)">
              {{ t('calendar.cancelSession') }}
            </SButton>
            <SButton v-if="selectedSession.ended_at" size="compact" variant="secondary" @click="router.push(`/session/${selectedSession.id}`)">
              {{ t('calendar.viewRecord') }}
            </SButton>
          </div>
        </template>
      </DialogContent>
    </Dialog>

    <CreateSessionModal
      :open="showCreateModal"
      :patients="patients"
      :existing-sessions="sessionsList"
      :session="editingSession"
      :session-name="editingSession ? nameFor(editingSession) : ''"
      @update:open="onCreateOpen"
      @session-created="refreshAfterChange"
      @session-updated="refreshAfterChange"
    />

    <AlertDialog :open="showCancelDialog" @update:open="showCancelDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="type-h2">{{ t('calendar.cancelSession') }}</AlertDialogTitle>
          <AlertDialogDescription class="type-body">{{ t('calendar.cancelBody') }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter class="gap-3">
          <AlertDialogCancel as-child>
            <SButton variant="secondary" size="compact" @click="cancelCancel">{{ t('calendar.keep') }}</SButton>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <SButton variant="danger" size="compact" @click="confirmCancel">{{ t('calendar.cancelSession') }}</SButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { createSocket } from '@/lib/config'
import { computed, ref, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import { userService } from '../api/userService'
import { sessionsService } from '../api/sessionsService'
import { useRouter } from 'vue-router'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'vue-sonner'
import CreateSessionModal from '@/components/CreateSessionModal.vue'
import { SButton } from '@/components/sanctuary'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

const { t, locale } = usePrototypeLocale()
const { ensureUTCString, dateToLocalString } = useDateHelpers()
const router = useRouter()

const showModal = ref(false)
const selectedSession = ref<any>(null)
const calendarRef = ref<any>(null)
const loading = ref(true)
const activeSession = ref<any>(null)
const user = ref<any>(null)
const patients = ref<any[]>([])
const sessionsList = ref<any[]>([])
const names = ref<Record<number, string>>({})
const showCreateModal = ref(false)
const editingSession = ref<any>(null)
const showCancelDialog = ref(false)
const cancelAction = ref<null | (() => Promise<void>)>(null)

const otherId = (s: any) => (user.value?.type === 'therapist' ? s.patient_id : s.therapist_id)
const nameFor = (s: any) => names.value[otherId(s)] || ''
const detailTitle = computed(() => {
  const name = selectedSession.value ? nameFor(selectedSession.value) : ''
  return name ? t('calendar.sessionWith', { name }) : t('calendar.sessionFallback')
})

const toDate = (v: string) => new Date(ensureUTCString(v))
const whenText = (s: any) => {
  const day = new Intl.DateTimeFormat(locale.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(toDate(s.start_date))
  const hm = new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' })
  const text = `${day}, ${hm.format(toDate(s.start_date))} – ${hm.format(toDate(s.end_date))}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const isSessionActive = (session: any) => Boolean(session && activeSession.value && session.id === activeSession.value.id)
const stateOf = (s: any): 'now' | 'done' | 'next' => (isSessionActive(s) ? 'now' : s.ended_at ? 'done' : 'next')
const statusWord = (s: any) => t({ now: 'calendar.legendNow', done: 'calendar.legendDone', next: 'calendar.legendNext' }[stateOf(s)])

const canModify = (session: any) => {
  if (!session || isSessionActive(session) || !session.start_date) return false
  return toDate(session.start_date) > new Date()
}

// The state word goes inside each event for screen readers (the visible cue is the fill + the legend).
const addStateLabel = (info: any) => {
  const s = info.event.extendedProps?.session
  if (!s || info.el.querySelector('.fc-state-label')) return
  const label = document.createElement('span')
  label.className = 'sr-only fc-state-label'
  label.textContent = `${statusWord(s)}: `
  info.el.prepend(label)
}

const calendarOptions = ref<any>({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  locale: locale.value,
  events: [],
  headerToolbar: { left: 'title', center: '', right: 'prev,next today' },
  titleFormat: { year: 'numeric', month: 'long' },
  buttonText: { today: t('calendar.today') },
  buttonHints: { prev: t('calendar.prev'), next: t('calendar.next') },
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', meridiem: false, hour12: false },
  eventInteractive: true,
  eventClick: (info: any) => handleEventClick(info),
  eventDidMount: addStateLabel,
  firstDay: 1,
  height: 'auto',
  fixedWeekCount: false,
})

let calendarWs: WebSocket | null = null
const connectCalendarWs = () => {
  const token = localStorage.getItem('token')
  if (!token || user.value?.type !== 'patient') return
  calendarWs = createSocket(`/ws/home?token=${token}`)
  calendarWs.onmessage = (ev) => {
    try {
      if (JSON.parse(ev.data).event === 'new_session') loadSessions()
    } catch {
      // Ignore malformed websocket messages.
    }
  }
}
const disconnectCalendarWs = () => {
  calendarWs?.close()
  calendarWs = null
}

onMounted(async () => {
  try {
    user.value = await userService.getCurrentUser()
  } catch {
    user.value = null
  }
  try {
    const allUsers = await userService.getUsers()
    patients.value = Array.isArray(allUsers) ? allUsers.filter((u: any) => u.type === 'patient') : []
  } catch {
    patients.value = []
  }
  await loadSessions()
  connectCalendarWs()
  loading.value = false
  await nextTick()
  calendarRef.value?.getApi?.()?.updateSize()
})

function handleEventClick(info: any) {
  selectedSession.value = info.event.extendedProps?.session || null
  if (selectedSession.value) showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSession.value = null
}

const openCreate = () => {
  editingSession.value = null
  showCreateModal.value = true
}
const openUpdate = (session: any) => {
  editingSession.value = { ...session }
  showModal.value = false
  showCreateModal.value = true
}
const onCreateOpen = (open: boolean) => {
  showCreateModal.value = open
  if (!open) editingSession.value = null
}

const askCancel = (sessionId: number) => {
  cancelAction.value = async () => {
    try {
      await sessionsService.deleteSession(sessionId)
      toast.success(t('calendar.toastCancelled'))
      await loadSessions()
      closeModal()
    } catch (e) {
      console.error('Session could not be cancelled', e)
      toast.error(t('calendar.toastCancelError'))
    }
  }
  showCancelDialog.value = true
}
const confirmCancel = async () => {
  showCancelDialog.value = false
  const action = cancelAction.value
  cancelAction.value = null
  if (action) await action()
}
const cancelCancel = () => {
  cancelAction.value = null
  showCancelDialog.value = false
}

const refreshAfterChange = async () => {
  closeModal()
  await loadSessions()
}

const eventClass = (s: any) => ({ now: 'active-event', done: 'done-event', next: 'pending-event' }[stateOf(s)])

async function loadSessions() {
  try {
    activeSession.value = await sessionsService.getActiveSession()
  } catch {
    activeSession.value = null
  }
  let list: any[] = []
  try {
    const sessions: any = await sessionsService.getMySessions()
    list = Array.isArray(sessions?.data) ? sessions.data : Array.isArray(sessions) ? sessions : []
  } catch {
    list = []
  }
  sessionsList.value = list

  // Names of the other person (the user for a therapist, the therapist for a user), fetched once each.
  const ids = [...new Set(list.map(otherId))].filter((id) => id != null && !(id in names.value))
  const fetched = await Promise.all(ids.map((id) => userService.getUserById(id).then((u: any) => [id, u?.full_name || ''] as const).catch(() => [id, ''] as const)))
  names.value = { ...names.value, ...Object.fromEntries(fetched) }

  calendarOptions.value = {
    ...calendarOptions.value,
    events: list.map((s) => ({
      title: nameFor(s) || t('calendar.sessionFallback'),
      start: dateToLocalString(toDate(s.start_date)),
      end: dateToLocalString(toDate(s.end_date)),
      extendedProps: { session: s },
      classNames: [eventClass(s)],
    })),
  }
}

watch(locale, (l) => {
  calendarOptions.value = {
    ...calendarOptions.value,
    locale: l,
    buttonText: { today: t('calendar.today') },
    buttonHints: { prev: t('calendar.prev'), next: t('calendar.next') },
    events: calendarOptions.value.events.map((e: any) => ({ ...e, title: nameFor(e.extendedProps.session) || t('calendar.sessionFallback') })),
  }
})

onBeforeUnmount(disconnectCalendarWs)
</script>

<style>
/* FullCalendar on Sanctuary tokens: hairline grid on the page, square controls, today = ink underline
   under the number, square events whose state is a fill + the legend word (sr-only inside each event). */
.fc-sanctuary {
  --fc-border-color: var(--dawn-hairline);
  --fc-button-bg-color: transparent;
  --fc-button-border-color: var(--input);
  --fc-button-text-color: var(--foreground);
  --fc-button-hover-bg-color: var(--secondary);
  --fc-button-hover-border-color: var(--input);
  --fc-button-active-bg-color: var(--secondary);
  --fc-button-active-border-color: var(--input);
  --fc-today-bg-color: transparent;
  --fc-neutral-bg-color: var(--secondary);
  --fc-page-bg-color: transparent;
  --fc-event-text-color: var(--foreground);
  font-family: inherit;
}
.fc-sanctuary .fc-toolbar.fc-header-toolbar { gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; }
.fc-sanctuary .fc-toolbar-chunk { display: flex; gap: 0.75rem; align-items: center; }
.fc-sanctuary .fc-toolbar-title {
  font-family: var(--font-display, inherit);
  font-size: 1.5rem; font-weight: 400; color: var(--foreground);
}
.fc-sanctuary .fc-toolbar-title::first-letter { text-transform: uppercase; }
.fc-sanctuary .fc-button,
.fc-sanctuary .fc-button-group > .fc-button {
  min-height: 2.75rem; min-width: 2.75rem; padding: 0 1rem;
  border-width: 2px; border-radius: 2px; font-size: 1rem; font-weight: 600;
  box-shadow: none; text-transform: none;
}
.fc-sanctuary .fc-button-group { gap: 0.5rem; }
.fc-sanctuary .fc-button:focus, .fc-sanctuary .fc-button:focus-visible { box-shadow: none; }
.fc-sanctuary .fc-button:focus-visible { outline: 3px solid var(--ring); outline-offset: 3px; }
.fc-sanctuary .fc-button:disabled { background: transparent; border-style: dashed; color: var(--muted-foreground); opacity: 1; }
.fc-sanctuary .fc-scrollgrid { border-left: 0; border-right: 0; }
.fc-sanctuary .fc-scrollgrid td:last-child, .fc-sanctuary .fc-scrollgrid th:last-child { border-right: 0; }
.fc-sanctuary .fc-col-header-cell { border-left: 0; border-right: 0; }
.fc-sanctuary .fc-col-header-cell-cushion {
  padding: 0.5rem; font-size: 0.9375rem; font-weight: 600;
  color: var(--muted-foreground); text-transform: capitalize; text-decoration: none;
}
.fc-sanctuary .fc-daygrid-day-top { flex-direction: row; }
.fc-sanctuary .fc-daygrid-day-number {
  margin: 0.375rem 0.5rem 0.25rem; padding: 0 0 0.125rem;
  font-size: 1rem; font-weight: 600; color: var(--foreground); text-decoration: none;
  border-bottom: 3px solid transparent;
}
.fc-sanctuary .fc-day-other .fc-daygrid-day-number { color: var(--muted-foreground); font-weight: 400; }
.fc-sanctuary .fc-daygrid-day.fc-day-sat, .fc-sanctuary .fc-daygrid-day.fc-day-sun { background: color-mix(in srgb, var(--secondary) 45%, transparent); }
/* Today: an ink rule under the day number (not colour alone: weight + rule). */
.fc-sanctuary .fc-daygrid-day.fc-day-today .fc-daygrid-day-number { border-bottom-color: var(--foreground); font-weight: 700; }
.fc-sanctuary .fc-daygrid-event {
  margin: 2px 4px; padding: 0.25rem 0.5rem; border-radius: 0; border: 2px solid transparent;
  font-size: 0.9375rem; font-weight: 600; box-shadow: none; cursor: pointer;
}
.fc-sanctuary .fc-daygrid-event:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
.fc-sanctuary .fc-event-title, .fc-sanctuary .fc-event-time { color: inherit; font-weight: 600; }
.fc-sanctuary .fc-daygrid-event-dot { display: none; }
/* Names wrap instead of being cut ("Jordi Pui…" at 1024 px and at 150 % text). */
.fc-sanctuary .fc-daygrid-dot-event { flex-wrap: wrap; white-space: normal; }
.fc-sanctuary .fc-daygrid-dot-event .fc-event-title { overflow: visible; white-space: normal; }
/* upcoming: ink on the page, outlined */
.fc-sanctuary .pending-event { background: var(--card); color: var(--foreground); border-color: var(--link); }
/* happening now: solid success fill */
.fc-sanctuary .active-event { background: var(--success); color: var(--dawn-surface); border-color: var(--success); }
/* done: soft fill */
.fc-sanctuary .done-event { background: var(--secondary); color: var(--foreground); border-color: var(--border); }
.fc-sanctuary .fc-daygrid-event:hover { filter: none; text-decoration: underline; text-underline-offset: 3px; }

.legend-swatch { display: inline-block; width: 1.25rem; height: 0.875rem; border: 2px solid transparent; }
.legend-now { background: var(--success); border-color: var(--success); }
.legend-next { background: var(--card); border-color: var(--link); }
.legend-done { background: var(--secondary); border-color: var(--border); }
</style>
