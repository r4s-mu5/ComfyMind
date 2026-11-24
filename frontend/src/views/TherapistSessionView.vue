<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle2, Hourglass, Image as ImageIcon, Lock, Palette } from 'lucide-vue-next'
import { createSocket, imageUrl as fileUrl, API_URL } from '@/lib/config'
import { userService } from '@/api/userService'
import { sessionsService } from '@/api/sessionsService'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { getReflectionNote } from '@/lib/reflection'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { AppShell, ArtworkMount, SButton, SCard, SNotice, VersionsStrip } from '@/components/sanctuary'
import TherapistChat from '@/components/TherapistChat.vue'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

/**
 * Therapist live session: the patient's current shared obra and its versions as they arrive,
 * chat, private notes (concept) and "Finalizar sesión". The previous screen is kept at
 * /legacy/session/:sessionId/therapist (TherapistGenerationView.vue).
 */
const route = useRoute()
const router = useRouter()
const { t, locale } = usePrototypeLocale()
const { ensureUTCString } = useDateHelpers()

const sessionId = Number(route.params.sessionId)
const role = 'therapist'
const stateKey = Number.isFinite(sessionId) ? `tgen2_state_${sessionId}` : 'tgen2_state_default'
const notesKey = `comfymind.therapist.notes.${sessionId}`

interface Version { id: string; src: string; fileName: string }
const versions = ref<Version[]>([])
const currentId = ref<string | null>(null)
const chatMessages = ref<Array<{ sender: string; text: string }>>([])
const sessionInfo = ref<any>(null)
const patient = ref<any>(null)
const loading = ref(true)
const denied = ref(false)
const confirmed = ref(false)
const sharedNote = ref('')
const tab = ref<'chat' | 'notes'>('chat')
const notes = ref('')
const notesSavedAt = ref(false)
const showEnd = ref(false)
const endBusy = ref(false)
const endFailed = ref(false)
const ended = ref(false)
const asideOpen = ref(true)
const now = ref(Date.now())

const patientName = computed(() => (patient.value?.full_name || 'Alex').trim().split(/\s+/)[0])
const current = computed(() => versions.value.find((v) => v.id === currentId.value) ?? versions.value[versions.value.length - 1] ?? null)

// ---- time (minutes only, refreshed every 30 s: no ticking seconds)
let clock: ReturnType<typeof setInterval> | null = null
const startMs = computed(() => (sessionInfo.value ? +new Date(ensureUTCString(sessionInfo.value.start_date)) : 0))
const endMs = computed(() => (sessionInfo.value ? +new Date(ensureUTCString(sessionInfo.value.end_date)) : 0))
const hhmm = (ms: number) => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(new Date(ms))
const timeRange = computed(() => (startMs.value ? t('therapist.timeRange', { start: hhmm(startMs.value), end: hhmm(endMs.value) }) : ''))
const remainingMin = computed(() => Math.max(0, Math.ceil((endMs.value - now.value) / 60000)))
const progress = computed(() => {
  const total = endMs.value - startMs.value
  return total > 0 ? Math.min(100, Math.max(0, Math.round(((now.value - startMs.value) / total) * 100))) : 0
})
const remainingText = computed(() => (endMs.value && now.value >= endMs.value ? t('therapist.over') : t('therapist.remaining', { min: remainingMin.value })))

// ---- status chip (icon + text)
const status = computed(() => {
  const n = patientName.value
  if (confirmed.value) return { icon: CheckCircle2, text: t('therapist.statusConfirmed', { name: n }), tone: 'text-success border-success' }
  if (versions.value.length) return { icon: ImageIcon, text: t('therapist.statusShared'), tone: 'text-link border-link' }
  if (chatMessages.value.length) return { icon: Palette, text: t('therapist.statusWorking', { name: n }), tone: 'text-link border-link' }
  return { icon: Hourglass, text: t('therapist.statusWaiting', { name: n }), tone: 'text-muted-foreground border-border' }
})

// ---- socket (real WebSocket in normal mode, fake BroadcastChannel socket in demo mode)
let socket: any = null
const mountFor = (name: string) => (name.includes('generated') ? 'generated_images' : name.includes('uploaded') ? 'uploaded_images' : 'template_images')
const addVersion = (src: string, fileName: string) => {
  const id = fileName || src
  if (!versions.value.some((v) => v.id === id)) versions.value.push({ id, src, fileName })
  currentId.value = id
  sharedNote.value = ''
  getReflectionNote(fileName).then((n) => { if (currentId.value === id) sharedNote.value = n })
}
const connectSocket = () => {
  const token = localStorage.getItem('token')
  if (!token || !Number.isFinite(sessionId)) return
  socket = createSocket(`/ws/${sessionId}/${role}?token=${token}`)
  socket.onmessage = (event: MessageEvent) => {
    const raw = event.data
    try {
      const obj = JSON.parse(raw)
      if (obj.event === 'submit_image' && obj.fileName) {
        addVersion(fileUrl(mountFor(obj.fileName), obj.fileName), obj.fileName)
      } else if (obj.event === 'confirm_artwork') {
        confirmed.value = true
      } else if (obj.event === 'chat_message') {
        chatMessages.value.push({ sender: obj.sender, text: obj.text })
      } else if (['reflection_note', 'share_note', 'note'].includes(obj.event) && obj.text) {
        sharedNote.value = String(obj.text)
      }
    } catch {
      const data = String(raw)
      if (data === 'session_ended') {
        clearState()
        socket?.close()
      } else if (data.startsWith('new_image:')) {
        const name = data.split(':')[1]
        addVersion(`${API_URL}/images/${name}`, name)
      }
    }
  }
}
const sendChat = (text: string) => {
  if (!text || !socket || socket.readyState !== 1) return
  const msg = { sender: role, text }
  socket.send(JSON.stringify({ event: 'chat_message', ...msg }))
  chatMessages.value.push(msg)
}

// ---- local persistence
const persist = () => {
  try {
    localStorage.setItem(stateKey, JSON.stringify({ versions: versions.value, currentId: currentId.value, chat: chatMessages.value, confirmed: confirmed.value }))
  } catch { /* ignore */ }
}
const clearState = () => { try { localStorage.removeItem(stateKey) } catch { /* ignore */ } }
const restore = () => {
  try {
    const s = JSON.parse(localStorage.getItem(stateKey) || 'null')
    if (!s) return
    if (Array.isArray(s.versions)) versions.value = s.versions
    if (typeof s.currentId === 'string') currentId.value = s.currentId
    if (Array.isArray(s.chat)) chatMessages.value = s.chat
    confirmed.value = Boolean(s.confirmed)
  } catch { /* ignore */ }
  try { notes.value = localStorage.getItem(notesKey) || '' } catch { /* ignore */ }
}
watch([versions, currentId, chatMessages, confirmed], persist, { deep: true })
let notesTimer: ReturnType<typeof setTimeout> | null = null
watch(notes, (v) => {
  notesSavedAt.value = false
  if (notesTimer) clearTimeout(notesTimer)
  notesTimer = setTimeout(() => {
    try { localStorage.setItem(notesKey, v); notesSavedAt.value = true } catch { /* ignore */ }
  }, 400)
})

onMounted(async () => {
  restore()
  clock = setInterval(() => { now.value = Date.now() }, 30000)
  try {
    const me = await userService.getCurrentUser()
    sessionInfo.value = await sessionsService.getSession(sessionId)
    if (sessionInfo.value?.ended_at) { clearState(); ended.value = true; return }
    patient.value = await userService.getUserById(sessionInfo.value.patient_id).catch(() => null)
    const active = await sessionsService.getActiveSession()
    if (me?.type !== 'therapist' || me.id !== sessionInfo.value.therapist_id || !active || active.id !== sessionId) {
      denied.value = true
      return
    }
    connectSocket()
    if (current.value) getReflectionNote(current.value.fileName).then((n) => { sharedNote.value = n })
  } catch (e) {
    console.warn('Therapist session could not load', e)
    denied.value = true
  } finally {
    loading.value = false
  }
})
onBeforeUnmount(() => {
  if (clock) clearInterval(clock)
  if (notesTimer) clearTimeout(notesTimer)
  socket?.close()
})

const endSession = async () => {
  endBusy.value = true
  endFailed.value = false
  try {
    await sessionsService.endSession(sessionId)
    socket?.close()
    clearState()
    showEnd.value = false
    ended.value = true
  } catch (e) {
    console.error(e)
    endFailed.value = true
  } finally {
    endBusy.value = false
  }
}
const tabs = computed(() => [
  { id: 'chat' as const, label: t('therapist.tabChat') },
  { id: 'notes' as const, label: t('therapist.tabNotes') },
])
const onTabKey = (e: KeyboardEvent) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return
  tab.value = tab.value === 'chat' ? 'notes' : 'chat'
  ;(document.getElementById(`ttab-${tab.value}`) as HTMLElement | null)?.focus()
}
</script>

<template>
  <AppShell role="therapist" v-model:aside-open="asideOpen">
    <p v-if="loading" role="status" class="type-body text-muted-foreground">{{ t('therapist.loading') }}</p>

    <SNotice v-else-if="denied && !ended" tone="warning" :title="t('therapist.deniedTitle')">
      <p>{{ t('therapist.deniedBody') }}</p>
      <SButton class="mt-3" variant="secondary" size="compact" to="/home">{{ t('therapist.endedBack') }}</SButton>
    </SNotice>

    <div v-else-if="!ended" class="flex flex-col gap-6">
      <!-- Header strip: a plain ledger line between two rules, no card -->
      <header class="flex flex-wrap items-end gap-x-8 gap-y-4 border-y-[1.5px] border-border py-5">
        <div class="min-w-0 flex-1">
          <p class="type-h3 text-muted-foreground">{{ timeRange }}</p>
          <h1 class="type-h1 mt-1">{{ t('therapist.sessionWith', { name: patientName }) }}</h1>
        </div>
        <div class="w-full min-w-[14rem] sm:w-64">
          <p class="text-[1.0625rem] font-semibold">{{ remainingText }}</p>
          <div
            class="mt-2 h-1.5 w-full bg-secondary"
            role="progressbar"
            :aria-label="t('therapist.remainingLabel')"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="progress"
          >
            <div class="h-full bg-foreground" :style="{ width: `${progress}%` }" />
          </div>
        </div>
        <p :class="['inline-flex min-h-11 items-center gap-2 rounded-control border-2 px-4 text-[1.0625rem] font-semibold', status.tone]" role="status">
          <component :is="status.icon" aria-hidden="true" class="size-5" />
          {{ status.text }}
        </p>
        <SButton variant="danger" size="compact" @click="showEnd = true; endFailed = false">{{ t('therapist.end') }}</SButton>
      </header>

      <!-- Current obra -->
      <section v-if="current" class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]" :aria-label="t('therapist.currentTitle', { name: patientName })">
        <div class="mx-auto flex w-full max-w-[34rem] flex-col gap-6">
          <ArtworkMount
            :src="current.src"
            :technique="t('therapist.technique')"
            :made-by="patientName"
            mat="md"
            loading="eager"
          />
          <div v-if="sharedNote" class="border-l-[3px] border-foreground pl-5">
            <h2 class="type-h3">{{ t('therapist.reflectionTitle', { name: patientName }) }}</h2>
            <p class="type-body mt-2" style="font-size: 1.0625rem">{{ sharedNote }}</p>
          </div>
        </div>
        <VersionsStrip v-if="versions.length" :versions="versions" v-model="currentId" class="lg:pt-2" />
      </section>

      <!-- Empty: nothing shared yet -->
      <section v-else class="dusk sky relative isolate overflow-hidden rounded-card" aria-labelledby="t-empty">
        <div class="absolute inset-0 -z-10" aria-hidden="true">
          <div class="mist" />
          <div class="sun-disc" />
          <div class="grain" />
        </div>
        <div class="flex min-h-[22rem] items-center justify-center p-6">
          <div class="scrim flex max-w-[32rem] flex-col items-center gap-3 p-8 text-center">
            <h2 id="t-empty" class="type-h2 text-foreground">{{ t('therapist.emptyTitle', { name: patientName }) }}</h2>
            <p class="type-body text-muted-foreground" style="font-size: 1.0625rem">{{ t('therapist.emptyHint') }}</p>
          </div>
        </div>
      </section>
    </div>

    <template #aside>
      <SCard v-if="!loading && !denied && !ended" padding="md" class="flex flex-col gap-4" :aria-label="t('therapist.panelLabel')" as="section">
        <div role="tablist" :aria-label="t('therapist.panelLabel')" class="flex gap-2" @keydown="onTabKey">
          <button
            v-for="x in tabs"
            :id="`ttab-${x.id}`"
            :key="x.id"
            type="button"
            role="tab"
            :aria-selected="tab === x.id"
            :aria-controls="`tpanel-${x.id}`"
            :tabindex="tab === x.id ? 0 : -1"
            :class="['inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-control border-2 px-3 text-base font-semibold', tab === x.id ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-card text-foreground hover:bg-secondary']"
            @click="tab = x.id"
          >
            {{ x.label }}
          </button>
        </div>

        <div v-show="tab === 'chat'" id="tpanel-chat" role="tabpanel" aria-labelledby="ttab-chat" class="flex min-h-0 flex-col gap-3">
          <h2 class="type-h3">{{ t('therapist.chatTitle', { name: patientName }) }}</h2>
          <TherapistChat :messages="chatMessages" :role="role" :other-name="patientName" @send="sendChat" />
        </div>

        <div v-show="tab === 'notes'" id="tpanel-notes" role="tabpanel" aria-labelledby="ttab-notes" class="flex flex-col gap-3">
          <h2 class="type-h3 flex flex-wrap items-center gap-2">
            {{ t('therapist.notesTitle') }}
            <span class="inline-flex items-center gap-1 rounded-control border-[1.5px] border-border bg-secondary px-3 py-0.5 text-[0.9375rem] font-semibold">
              <Lock aria-hidden="true" class="size-4" /> {{ t('therapist.onlyYou') }}
            </span>
          </h2>
          <p class="type-small text-muted-foreground">{{ t('therapist.notesHint', { name: patientName }) }}</p>
          <label for="therapist-notes" class="sr-only">{{ t('therapist.notesTitle') }}</label>
          <textarea
            id="therapist-notes"
            v-model="notes"
            rows="10"
            class="min-h-48 w-full rounded-control border-2 border-input bg-card p-4 text-[1.0625rem] leading-relaxed text-foreground"
          />
          <p class="type-small flex items-center gap-2 text-muted-foreground" aria-live="polite">
            <CheckCircle2 v-if="notesSavedAt" aria-hidden="true" class="size-4 text-success" />
            <span v-if="notesSavedAt">{{ t('therapist.notesSaved') }} · </span>{{ t('therapist.notesConcept') }}
          </p>
        </div>
      </SCard>
    </template>

    <!-- End session: danger trigger above, danger confirm here -->
    <Dialog :open="showEnd" @update:open="(v: boolean) => !endBusy && (showEnd = v)">
      <DialogContent class="max-w-[32rem] rounded-card border-[1.5px] border-border bg-background p-8 sm:max-w-[32rem]">
        <DialogTitle class="type-h2">{{ t('therapist.endTitle') }}</DialogTitle>
        <DialogDescription class="type-body">{{ t('therapist.endBody', { name: patientName }) }}</DialogDescription>
        <SNotice v-if="endFailed" tone="danger" :title="t('therapist.endErrorTitle')"><p>{{ t('therapist.endErrorBody') }}</p></SNotice>
        <div class="mt-2 flex flex-wrap justify-end gap-3">
          <SButton variant="secondary" size="compact" :disabled="endBusy" @click="showEnd = false">{{ t('therapist.endCancel') }}</SButton>
          <SButton variant="danger" size="compact" :busy="endBusy" @click="endSession">{{ t('therapist.end') }}</SButton>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog :open="ended">
      <DialogContent :show-close-button="false" class="max-w-[32rem] rounded-card border-[1.5px] border-border bg-background p-8 sm:max-w-[32rem]" @interact-outside.prevent @escape-key-down.prevent>
        <DialogTitle class="type-h2">{{ t('therapist.endedTitle') }}</DialogTitle>
        <DialogDescription class="type-body">{{ t('therapist.endedBody') }}</DialogDescription>
        <div class="mt-2 flex justify-end">
          <SButton size="compact" @click="router.push('/home')">{{ t('therapist.endedBack') }}</SButton>
        </div>
      </DialogContent>
    </Dialog>
  </AppShell>
</template>
