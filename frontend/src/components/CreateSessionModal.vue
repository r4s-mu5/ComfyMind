<template>
  <div style="display: contents">
    <Dialog :open="open" @update:open="(val) => !val && handleClose()">
      <DialogContent class="max-w-[34rem] sm:max-w-[34rem]">
        <DialogTitle class="type-h2">{{ editing ? t('calendar.update') : t('home.therapistCreate') }}</DialogTitle>
        <DialogDescription v-if="editing && editingName" class="type-body text-muted-foreground">
          {{ t('calendar.sessionWith', { name: editingName }) }}
        </DialogDescription>

        <form class="flex flex-col gap-6" novalidate @submit.prevent="handleSubmit">
          <SField v-if="!editing" :label="t('calendar.patient')">
            <template #default="{ id }">
              <select :id="id" v-model="formData.patientId" :class="control">
                <option :value="null" disabled>{{ t('calendar.pickUser') }}</option>
                <option v-for="p in patients" :key="p.id" :value="p.id">{{ p.full_name }}</option>
              </select>
            </template>
          </SField>

          <SField :label="t('calendar.date')">
            <template #default="{ id }">
              <input :id="id" v-model="formData.date" type="date" :min="minDate" :class="control" />
            </template>
          </SField>

          <div class="grid gap-6 sm:grid-cols-2">
            <SField :label="t('calendar.startTime')">
              <template #default="{ id }">
                <input :id="id" v-model="formData.startTime" type="time" :class="control" />
              </template>
            </SField>
            <SField :label="t('calendar.endTime')">
              <template #default="{ id }">
                <input :id="id" v-model="formData.endTime" type="time" :class="control" />
              </template>
            </SField>
          </div>

          <SNotice v-if="errorMessage" tone="danger" :title="editing ? t('calendar.toastUpdateError') : t('calendar.createError')">
            <p>{{ errorMessage }}</p>
          </SNotice>

          <div class="flex flex-wrap justify-end gap-3">
            <SButton type="submit" size="compact" :busy="busy">{{ editing ? t('calendar.save') : t('calendar.schedule') }}</SButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="showOverlapDialog" @update:open="showOverlapDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="type-h2">{{ t('calendar.overlapTitle') }}</AlertDialogTitle>
          <AlertDialogDescription class="type-body">{{ t('calendar.overlapBody') }}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter class="gap-3">
          <AlertDialogCancel as-child>
            <SButton variant="secondary" size="compact" @click="cancelOverlap">{{ t('calendar.overlapBack') }}</SButton>
          </AlertDialogCancel>
          <AlertDialogAction as-child>
            <SButton size="compact" @click="confirmOverlap">{{ t('calendar.overlapKeep') }}</SButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { sessionsService } from '../api/sessionsService'
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
import { SButton, SField, SNotice } from '@/components/sanctuary'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

/**
 * Schedule a session, or (with `session`) change the date of one. Native date and time inputs in
 * sanctuary fields (56px, 18px text); an overlap asks before keeping the time.
 */
interface SessionLike { id: number; start_date: string; end_date: string }
interface Props {
  open: boolean
  patients: Array<{ id: number; full_name: string }>
  existingSessions: Array<SessionLike>
  /** Edit mode: change the date and times of this session (the person stays the same). */
  session?: SessionLike | null
  /** Name shown in edit mode ("Sesión con {name}"). */
  sessionName?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'session-created'): void
  (e: 'session-updated'): void
}>()

const { t, locale } = usePrototypeLocale()
const { ensureUTCString, localToUTC, utcToLocalInput } = useDateHelpers()

const control =
  'min-h-14 w-full rounded-control border-2 border-input bg-card px-4 text-[1.125rem] text-foreground'

const editing = computed(() => Boolean(props.session))
const editingName = computed(() => props.sessionName || '')
const pad = (n: number) => String(n).padStart(2, '0')
const now = new Date()
const minDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

const empty = () => ({ patientId: null as number | null, date: '', startTime: '', endTime: '' })
const formData = ref(empty())
const busy = ref(false)
const showOverlapDialog = ref(false)
const overlapAction = ref<null | (() => Promise<void>)>(null)
const errorMessage = ref('')

const fill = () => {
  errorMessage.value = ''
  if (props.session) {
    const start = utcToLocalInput(props.session.start_date)
    const end = utcToLocalInput(props.session.end_date)
    formData.value = { patientId: null, date: start.date, startTime: start.time, endTime: end.time }
  } else {
    formData.value = empty()
  }
}
watch(() => props.open, (v) => { if (v) fill() }, { immediate: true })

const longDate = (iso: string) =>
  new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long' }).format(new Date(iso))

const handleSubmit = async () => {
  errorMessage.value = ''
  const f = formData.value
  if ((!editing.value && f.patientId == null) || !f.date || !f.startTime || !f.endTime) {
    errorMessage.value = t('calendar.fillAll')
    return
  }
  if (f.startTime >= f.endTime) {
    errorMessage.value = t('calendar.timeOrder')
    return
  }
  const start_date = localToUTC(f.date, f.startTime)
  const end_date = localToUTC(f.date, f.endTime)
  const newStart = new Date(start_date)
  const newEnd = new Date(end_date)
  const overlap = props.existingSessions.find((s) => {
    if (!s.start_date || !s.end_date || s.id === props.session?.id) return false
    return newStart < new Date(ensureUTCString(s.end_date)) && newEnd > new Date(ensureUTCString(s.start_date))
  })
  const run = () => save({ start_date, end_date })
  if (overlap) {
    overlapAction.value = run
    showOverlapDialog.value = true
    return
  }
  await run()
}

const save = async (data: { start_date: string; end_date: string }) => {
  busy.value = true
  try {
    if (props.session) {
      await sessionsService.updateSession(props.session.id, data)
      toast.success(t('calendar.toastMoved', { date: longDate(data.start_date) }))
      emit('session-updated')
    } else {
      await sessionsService.createSession(formData.value.patientId as number, data)
      toast.success(t('calendar.toastCreated', { date: longDate(data.start_date) }))
      emit('session-created')
    }
    handleClose()
  } catch (error: any) {
    console.error('Session could not be saved', error)
    errorMessage.value = error?.response?.data?.detail || (props.session ? t('calendar.toastUpdateError') : t('calendar.createError'))
  } finally {
    busy.value = false
  }
}

const confirmOverlap = async () => {
  showOverlapDialog.value = false
  const action = overlapAction.value
  overlapAction.value = null
  if (action) await action()
}

const cancelOverlap = () => {
  overlapAction.value = null
  showOverlapDialog.value = false
}

const handleClose = () => emit('update:open', false)
</script>
