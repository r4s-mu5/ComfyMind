<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-col gap-2">
        <h1 class="type-h1">{{ t('calendar.title') }}</h1>
        <p class="type-body text-muted-foreground">
          {{ user?.type === 'therapist' ? t('calendar.subtitleTherapist') : t('calendar.subtitlePatient') }}
        </p>
      </div>
      <SButton v-if="user?.type === 'therapist'" size="compact" @click="showCreateModal = true">
        <template #icon><Plus aria-hidden="true" /></template>
        {{ t('calendar.create') }}
      </SButton>
    </header>

    <div class="overflow-hidden rounded-card border-[1.5px] border-border bg-card p-2 elev sm:p-4">
      <FullCalendar
        :key="locale"
        ref="calendarRef"
        :options="calendarOptions"
        @eventClick="handleEventClick"
        class="fc-shadcn"
      />
    </div>

    <ul class="type-small flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground" aria-hidden="true">
      <li class="flex items-center gap-2"><span class="legend-chip legend-now">&#9654;</span> {{ t('calendar.legendNow') }}</li>
      <li class="flex items-center gap-2"><span class="legend-chip legend-next"></span> {{ t('calendar.legendNext') }}</li>
      <li class="flex items-center gap-2"><span class="legend-chip legend-done">&#10003;</span> {{ t('calendar.legendDone') }}</li>
    </ul>

    <Dialog :open="showModal"  @update:open="(val) => !val && closeModal()" >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ t('calendar.detailTitle') }}</DialogTitle>
          <DialogDescription>
            {{ t('calendar.detailBody') }}
          </DialogDescription>
        </DialogHeader>
        <div v-if="selectedSession">
          <dl class="grid grid-cols-2 gap-x-1.5 gap-y-1 text-[1.0625rem]">
            <template v-if="user?.type === 'therapist'">
              <dt class="font-semibold">{{ t('calendar.patient') }}</dt>
              <dd>{{ patient?.full_name ?? 'Cargando...' }}</dd>
            </template>
            <template v-else>
              <dt class="font-semibold">{{ t('calendar.therapist') }}</dt>
              <dd>{{ therapist?.full_name ?? 'Cargando...' }}</dd>
            </template>

            <dt class="font-semibold">{{ t('calendar.date') }}</dt>
            <dd>{{ formatLocalDate(selectedSession.start_date).slice(0,8) }}</dd>

            <dt class="font-semibold">{{ t('calendar.time') }}</dt>
            <dd>{{ formatLocalDate(selectedSession.start_date).slice(10,16) }} - {{ formatLocalDate(selectedSession.end_date).slice(10,16) }}</dd>
          </dl>

          <div class="mt-6 flex flex-wrap justify-end gap-3">
            <SButton size="compact" v-if="isSessionActive(selectedSession)" @click="router.push(`/session/${selectedSession.id}/${user?.type}`)">
              {{ t('calendar.enterActive') }}
            </SButton>
            <SButton size="compact" variant="secondary" v-if="selectedSession.ended_at" @click="router.push(`/session/${selectedSession.id}`)">
              {{ t('calendar.viewRecord') }}
            </SButton>
            <SButton size="compact" variant="secondary" v-if="user?.type==='therapist' && canModify(selectedSession)" @click="actualizarSesion(selectedSession.id)">
              {{ t('calendar.update') }}
            </SButton>
            <SButton size="compact" variant="danger" v-if="user?.type==='therapist' && canModify(selectedSession)" @click="eliminarSesion(selectedSession.id)">
              {{ t('calendar.cancelSession') }}
            </SButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <CreateSessionModal
      :open="showCreateModal"
      @update:open="showCreateModal = $event"
      :patients="patients"
      :existing-sessions="sessionsList"
      @session-created="handleSessionCreated"
    />

    <Dialog :open="showUpdateModal" @update:open="(val) => !val && closeUpdate()">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Actualizar la fecha de la sesión</DialogTitle>
          <DialogDescription>
            Rellena los detalles para modificar la fecha y hora de la sesión programada.
          </DialogDescription>
        </DialogHeader>

        <form class="create-form" @submit.prevent="actualizarSesionConfirm(selectedSession.id)">
          <div class="grid gap-4">

            <!-- Fecha -->
            <div class="grid gap-2">
              <Label for="date">Fecha</Label>
              <Popover v-slot="{ close }">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    class="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon class="h-4 w-4" />
                    {{ updateForm.date ? df.format(updateForm.date.toDate(getLocalTimeZone())) : "Selecciona fecha" }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-full p-0" align="start">
                  <Calendar
                    v-model="updateForm.date"
                    :default-placeholder="defaultPlaceholder"
                    :min-value="today(getLocalTimeZone())"
                    layout="month-and-year"
                    initial-focus
                    @update:model-value="close"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <!-- Hora inicio -->
            <div class="grid gap-2">
              <Label for="horaInicio">Hora de inicio</Label>
              <Input
                type="time"
                v-model="updateForm.startTime"
                class="w-full"
              />
            </div>

            <!-- Hora fin -->
            <div class="grid gap-2">
              <Label for="horaFin">Hora de fin</Label>
              <Input
                type="time"
                v-model="updateForm.endTime"
                class="w-full"
              />
            </div>

            <Alert v-if="updSessionError" class="bg-red-100 text-red-800 border border-red-300">
              <AlertCircleIcon class="h-4 w-4" />
              <AlertTitle>Error al actualizar la sesión</AlertTitle>
              <AlertDescription class="text-red-800">
                {{ updSessionError }}
              </AlertDescription>
            </Alert>

            <!-- Botón de confirmación -->
            <div class="flex justify-end mt-4">
              <Button type="submit" variant="default">Confirmar</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="showOverlapDialog" @update:open="showOverlapDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sesión solapada</AlertDialogTitle>
          <AlertDialogDescription>
            La sesión que intentas actualizar coincide con otra ya agendada.
            ¿Deseas continuar igualmente?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelOverlap">Cancelar</AlertDialogCancel>
          <AlertDialogAction @click="confirmOverlap">
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog :open="showCancelDialog" @update:open="showCancelDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('calendar.cancelSession') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('calendar.cancelBody') }}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelCancel" class="min-h-11">{{ t('calendar.keep') }}</AlertDialogCancel>
          <AlertDialogAction @click="confirmCancel" class="min-h-11 rounded-pill bg-danger text-danger-foreground hover:bg-danger/90">
            {{ t('calendar.cancelSession') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { createSocket } from '@/lib/config'
import { ref, onMounted, nextTick, onBeforeUnmount, watch } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import { userService } from '../api/userService';
import { sessionsService } from '../api/sessionsService';
import { useRouter } from "vue-router";

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { DateValue } from '@internationalized/date'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { CalendarIcon, AlertCircleIcon } from 'lucide-vue-next'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'vue-sonner'
import CreateSessionModal from '@/components/CreateSessionModal.vue'
import { Plus } from 'lucide-vue-next'
import { SButton } from '@/components/sanctuary'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

const { t, locale } = usePrototypeLocale()


const showModal = ref(false)
const selectedSession = ref(null)
const calendarRef = ref(null)
const router = useRouter()
const loading = ref(true)
const activeSession = ref(null)
const user = ref(null)
const patients = ref([])
const showCreateModal = ref(false)
const updateForm = ref({ date: '', startTime: '', endTime: '' })
const sessionsList = ref([])
const showUpdateModal = ref(false)
const patient = ref(null)
const therapist = ref(null)
const defaultPlaceholder = today(getLocalTimeZone())
const df = new DateFormatter('es-ES', {
  dateStyle: 'long',
})
const {
  ensureUTCString,
  formatLocalDate,
  localToUTC,
  dateToLocalString,
  utcToLocalInput,
  parseDate
} = useDateHelpers()
const showOverlapDialog = ref(false)
const overlapAction = ref<null | (() => Promise<void>)>(null)
const showCancelDialog = ref(false)
const cancelAction = ref<null | (() => Promise<void>)>(null)
const updSessionError = ref('')

const confirmOverlap = async () => {
  if (overlapAction.value) {
    await overlapAction.value()
  }
  overlapAction.value = null
  showOverlapDialog.value = false
}

const cancelOverlap = () => {
  overlapAction.value = null
  showOverlapDialog.value = false
}

const confirmCancel = async () => {
  if (cancelAction.value) {
    await cancelAction.value()
  }
  cancelAction.value = null
  showCancelDialog.value = false
}

const cancelCancel = () => {
  cancelAction.value = null
  showCancelDialog.value = false
}


const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  locale: locale.value,
  events: [],
  headerToolbar: {
    left: '',
    center: '',
    right: ''
  },
    titleFormat: { // aquí personalizas el título del mes
    year: 'numeric',
    month: 'long'
  },
  buttonText: {
    today: t('calendar.today'),
    month: 'Mes',
    week: 'Semana',
    day: 'Día'
  },
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    meridiem: false,
    hour12: false
  },
  buttonHints: { prev: t('calendar.prev'), next: t('calendar.next') },
  eventClick: null,
  firstDay: 1,
  height: 'auto',
  fixedWeekCount: false,
    customButtons: {
    customCreateButton: {
      text: 'Crear nueva sesión',
      click: () => {
        showCreateModal.value = true;
      }
    }
  },
})

let calendarWs: WebSocket | null = null

const connectCalendarWs = () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.warn('No token found, skipping Calendar WS connection')
    return
  }
  if (user.value?.type !== 'patient') {
    console.log('Usuario no es paciente, saltando WS Calendar')
    return
  }

  calendarWs = createSocket(`/ws/home?token=${token}`)

  calendarWs.onopen = () => {
    console.log('✅ WS Calendar conectado')
  }

  calendarWs.onmessage = (ev) => {
    try {
      const obj = JSON.parse(ev.data)
      console.log('📨 Mensaje WS Calendar recibido:', obj)
      if (obj.event === 'new_session') {
        console.log('🆕 Nueva sesión creada, recargando calendario')
        loadSessions()
      }
    } catch (e) {
      console.warn('Error parseando WS Calendar:', e)
    }
  }

  calendarWs.onclose = () => {
    console.log('❌ WS Calendar cerrado')
  }

  calendarWs.onerror = (e) => {
    console.warn('⚠️ Error en WS Calendar:', e)
  }
}

const disconnectCalendarWs = () => {
  if (calendarWs) {
    calendarWs.close()
    calendarWs = null
  }
}

onMounted(async () => {
  try {
    user.value = await userService.getCurrentUser()
    if (user.value && user.value.type === 'therapist') {
      calendarOptions.value.headerToolbar.left = 'title';
      calendarOptions.value.headerToolbar.right = 'prev,next today';
    } else {
      calendarOptions.value.headerToolbar.left = 'title';
      calendarOptions.value.headerToolbar.right = 'prev,next today';
    }
  } catch (e) {
    user.value = null
  }

  try {
    const allUsers = await userService.getUsers()
    patients.value = Array.isArray(allUsers) ? allUsers.filter(u => u.type === 'patient') : []
  } catch (e) {
    patients.value = []
  }
  await loadSessions()
  if (user.value?.type === 'patient') {
    connectCalendarWs()
  }
  loading.value = false

  // Force calendar to update size after mount
  await nextTick()
  if (calendarRef.value) {
    const calendarApi = calendarRef.value.getApi()
    if (calendarApi) {
      calendarApi.updateSize()
    }
  }
});

async function handleEventClick(info) {
  selectedSession.value = info.event.extendedProps?.session || null
  
  // Load patient or therapist for this specific session
  if (selectedSession.value) {
    if (user.value?.type === 'therapist') {
      try {
        patient.value = await userService.getUserById(selectedSession.value.patient_id)
      } catch (e) {
        console.error('Error loading patient:', e)
        patient.value = null
      }
    } else {
      try {
        therapist.value = await userService.getUserById(selectedSession.value.therapist_id)
      } catch (e) {
        console.error('Error loading therapist:', e)
        therapist.value = null
      }
    }
  }
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedSession.value = null
}

const isSessionActive = (session) => {
  if (!session || !activeSession.value) return false
  return session.id === activeSession.value.id
}

const eliminarSesion = async (sessionId) => {
  cancelAction.value = async () => await doDeleteSession(sessionId)
  showCancelDialog.value = true
}

const doDeleteSession = async (sessionId) => {
  try {
    await sessionsService.deleteSession(sessionId)
    toast.success('Sesión cancelada correctamente')
    await loadSessions()
    closeModal()
  } catch (e) {
    console.error('Error cancelando sesión:', e)
    toast.error('No se pudo cancelar la sesión')
  }
}

const actualizarSesion = (sessionId) => {
  const session = sessionsList.value.find(s => s.id === sessionId)
  if (!session) {
    toast.error('Sesión no encontrada')
    return
  }
  selectedSession.value = { ...session }
  
  const start = utcToLocalInput(session.start_date);
  const end = utcToLocalInput(session.end_date);

  updateForm.value = {
    date: parseDate(start.date),
    startTime: start.time,
    endTime: end.time
  }


  showUpdateModal.value = true
  showModal.value = false
}

const actualizarSesionConfirm = async (sessionId) => {
  try {
    if (updateForm.value.startTime >= updateForm.value.endTime) {
      updSessionError.value = 'La hora de inicio debe ser anterior a la hora de fin'
      return
    }

    const startDateTime = localToUTC(updateForm.value.date, updateForm.value.startTime)
    const endDateTime = localToUTC(updateForm.value.date, updateForm.value.endTime)
    const newStart = new Date(startDateTime)
    const newEnd = new Date(endDateTime)
    
    const overlap = sessionsList.value.find(s => {
      if (!s.start_date || !s.end_date) return false
      if (s.id === sessionId) return false // Excluir la sesión que se está modificando
      const sStart = new Date(ensureUTCString(s.start_date))
      const sEnd = new Date(ensureUTCString(s.end_date))
      return newStart < sEnd && newEnd > sStart
    })

    if (overlap) {
      overlapAction.value = async () => await doUpdateSession(sessionId)
      showOverlapDialog.value = true
      return
    }

    await doUpdateSession(sessionId)

  } catch (e) {
    console.error('Error actualizando sesión:', e)
    toast.error('No se pudo actualizar la sesión')
  }
}

const doUpdateSession = async (sessionId) => {
  const startDateTime = localToUTC(updateForm.value.date, updateForm.value.startTime)
  const endDateTime = localToUTC(updateForm.value.date, updateForm.value.endTime)
  const session_data = {
    start_date: startDateTime,
    end_date: endDateTime
  }
  
  await sessionsService.updateSession(sessionId, session_data)
  try {
    activeSession.value = await sessionsService.getActiveSession()
  } catch (e) {
    activeSession.value = null
  }
  await loadSessions()
  closeUpdate()
  closeModal()
  toast.success('Sesión actualizada correctamente')
}

const canModify = (session) => {
  if (!session) return false;
  if (isSessionActive(session)) return false;
  if (!session.start_date) return false;
  return new Date(ensureUTCString(session.start_date)) > new Date();
}

const handleSessionCreated = async () => {
  try {
    activeSession.value = await sessionsService.getActiveSession()
  } catch (e) {
    activeSession.value = null
  }
  await loadSessions()
  showCreateModal.value = false
}

async function loadSessions() {
  try {
    activeSession.value = await sessionsService.getActiveSession()
  } catch (e) {
    activeSession.value = null
  }

  const sessions = await sessionsService.getMySessions();
  const list = Array.isArray(sessions?.data) ? sessions.data : (Array.isArray(sessions) ? sessions : []);
  sessionsList.value = list

  // Build event titles: for therapists show patient name + time, for patients show "Sesión"
  const eventTitles = await Promise.all(
    list.map(async (s) => {
      if (user.value?.type === 'therapist') {
        try {
          const patientData = await userService.getUserById(s.patient_id)
          return patientData.full_name
        } catch (e) {
          console.error('Error getting patient:', e)
          return "Sesión"
        }
      }
      else{
        try {
          const therapistData = await userService.getUserById(s.therapist_id)
          return therapistData.full_name
        } catch (e) {
          console.error('Error getting therapist:', e)
          return "Sesión"
        }
      }
    })
  )

  calendarOptions.value = {
    ...calendarOptions.value,
    events: list.map((s, idx) => ({
      title: eventTitles[idx],
      start: dateToLocalString(new Date(ensureUTCString(s.start_date))),
      end: dateToLocalString(new Date(ensureUTCString(s.end_date))),
      displayEventTime: true,
      extendedProps: { session: s },
      classNames: isSessionActive(s) ? ['active-event'] : (s.ended_at ? ['done-event'] : ['pending-event']),
    })),
    eventClick: handleEventClick,
  };
}

const closeUpdate = () => {
  showUpdateModal.value = false
  selectedSession.value = null
}

watch(locale, (l) => {
  calendarOptions.value = {
    ...calendarOptions.value,
    locale: l,
    buttonText: { ...calendarOptions.value.buttonText, today: t('calendar.today') },
    buttonHints: { prev: t('calendar.prev'), next: t('calendar.next') },
  }
})

onBeforeUnmount(() => {
  disconnectCalendarWs()
})

// ...existing code...

</script>

<style>
/* Calendar on Sanctuary tokens (dawn). Event chips >= 4.5:1, clear "today", 44px nav buttons. */
.fc-shadcn {
  --fc-border-color: var(--dawn-hairline);
  --fc-button-bg-color: var(--card);
  --fc-button-border-color: var(--input);
  --fc-button-text-color: var(--foreground);
  --fc-button-hover-bg-color: var(--secondary);
  --fc-button-hover-border-color: var(--input);
  --fc-button-active-bg-color: var(--secondary);
  --fc-button-active-border-color: var(--input);
  --fc-today-bg-color: transparent;
  --fc-neutral-bg-color: var(--secondary);
  --fc-page-bg-color: var(--card);
  --fc-event-text-color: var(--primary-foreground);
  font-family: inherit;
}
.fc-shadcn .fc-toolbar { gap: 0.75rem; padding: 0.5rem 0.5rem 1rem; flex-wrap: wrap; }
.fc-shadcn .fc-toolbar-chunk { display: flex; gap: 0.75rem; align-items: center; }
.fc-shadcn .fc-toolbar-title {
  font-family: var(--font-display, inherit);
  font-size: 1.5rem; font-weight: 400; color: var(--foreground);
}
.fc-shadcn .fc-toolbar-title::first-letter { text-transform: uppercase; }
.fc-shadcn .fc-button {
  min-height: 2.75rem; min-width: 2.75rem; padding: 0 1rem;
  border-width: 2px; border-radius: 0.75rem; font-size: 1rem; font-weight: 600;
  box-shadow: none; text-transform: none;
}
.fc-shadcn .fc-button:focus-visible { outline: 3px solid var(--ring); outline-offset: 3px; box-shadow: none; }
.fc-shadcn .fc-button:disabled { background: var(--secondary); color: var(--muted-foreground); opacity: 1; }
.fc-shadcn .fc-col-header-cell-cushion {
  padding: 0.5rem; font-size: 0.9375rem; font-weight: 600;
  color: var(--muted-foreground); text-transform: capitalize; text-decoration: none;
}
.fc-shadcn .fc-daygrid-day-number {
  padding: 0.5rem; font-size: 1rem; font-weight: 600; color: var(--foreground); text-decoration: none;
}
.fc-shadcn .fc-day-other .fc-daygrid-day-number { color: var(--muted-foreground); font-weight: 400; }
.fc-shadcn .fc-daygrid-day.fc-day-sat, .fc-shadcn .fc-daygrid-day.fc-day-sun { background: color-mix(in srgb, var(--secondary) 45%, transparent); }
/* Today: a filled number disc + an outlined cell, never colour alone. */
.fc-shadcn .fc-daygrid-day.fc-day-today { background: var(--secondary); box-shadow: inset 0 0 0 2px var(--link); }
.fc-shadcn .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
  margin: 0.25rem; min-width: 2rem; min-height: 2rem; padding: 0 0.4rem;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px; background: var(--primary); color: var(--primary-foreground); font-weight: 700;
}
.fc-shadcn .fc-daygrid-event {
  margin: 2px 4px; padding: 0.25rem 0.5rem; border-radius: 0.5rem; border: 2px solid transparent;
  font-size: 0.9375rem; font-weight: 600; box-shadow: none; cursor: pointer;
}
.fc-shadcn .fc-daygrid-event:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
.fc-shadcn .fc-event-title, .fc-shadcn .fc-event-time { color: inherit; font-weight: 600; }
/* upcoming: ink on light (>= 12:1) */
.fc-shadcn .pending-event, .fc-shadcn .fc-daygrid-event.pending-event {
  background: var(--card); color: var(--foreground); border-color: var(--link);
}
.fc-shadcn .pending-event * { color: var(--foreground); }
/* happening now: solid success + "play" cue */
.fc-shadcn .active-event { background: var(--success); color: var(--dawn-surface); border-color: var(--success); }
.fc-shadcn .active-event * { color: var(--dawn-surface); }
.fc-shadcn .active-event .fc-event-main::before { content: "\25B6\00a0"; }
/* done: soft fill + check cue */
.fc-shadcn .done-event { background: var(--secondary); color: var(--foreground); border-color: var(--border); }
.fc-shadcn .done-event * { color: var(--foreground); }
.fc-shadcn .done-event .fc-event-main::before { content: "\2713\00a0"; }
.fc-shadcn .fc-daygrid-event-dot { display: none; }
.fc-theme-standard td, .fc-theme-standard th, .fc-theme-standard .fc-scrollgrid { border-color: var(--dawn-hairline); }

.legend-chip {
  display: inline-flex; min-width: 1.5rem; height: 1.25rem; align-items: center; justify-content: center;
  border-radius: 0.4rem; border: 2px solid transparent; font-size: 0.7rem; line-height: 1;
}
.legend-now { background: var(--success); color: var(--dawn-surface); border-color: var(--success); }
.legend-next { background: var(--card); border-color: var(--link); }
.legend-done { background: var(--secondary); color: var(--foreground); border-color: var(--border); }
</style>
