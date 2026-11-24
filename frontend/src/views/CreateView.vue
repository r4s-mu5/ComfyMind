<script setup lang="ts">
/**
 * CreateView: the patient's creation workspace ("Taller"), in a session and on their own.
 * Routes: /session/:sessionId/patient (+ /canvas), /generation/, /canvas/. Legacy views: /legacy/*.
 *
 * Flow: way in (Palabras / Dibujo / Imagen) → Crear → waiting (dusk CalmProgress, Cancelar)
 * → result (Guardar en mis obras · Otra versión · Compartir · Anotar un pensamiento) → optional
 * reflection. Works with the real services and in demo mode (lib/demo). See DESIGN.md §7.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { userService } from '@/api/userService'
import { sessionsService } from '@/api/sessionsService'
import { comfyService } from '@/api/comfyService'
import { notesService } from '@/api/notesService'
import { createSocket } from '@/lib/config'
import { isDemo } from '@/lib/demo/isDemo'
import { demoProgress } from '@/lib/demo/progress'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { AppShell, CalmProgress, SButton, SNotice, WayInPicker } from '@/components/sanctuary'
import type { WayIn } from '@/components/sanctuary/WayInPicker.vue'
import SessionEndOverlay from '@/components/sanctuary/SessionEndOverlay.vue'
import WordsPanel from '@/components/create/WordsPanel.vue'
import DrawPanel from '@/components/create/DrawPanel.vue'
import ImagePanel from '@/components/create/ImagePanel.vue'
import ResultStage, { type ResultVersion } from '@/components/create/ResultStage.vue'
import SessionChat from '@/components/create/SessionChat.vue'
import { urlFor, type CreateKind } from '@/components/create/images'
import { useNavLink } from '@/components/create/useNavLink'

const route = useRoute()
const { t, locale } = usePrototypeLocale()
const { ensureUTCString } = useDateHelpers()
const nav = useNavLink()

const sid = Number(route.params.sessionId)
const inSession = Number.isFinite(sid)
const sessionIdOrNull = inSession ? sid : null

// ---------------------------------------------------------------- access
type Access = 'loading' | 'ready' | 'denied' | 'notStarted' | 'over' | 'error'
const access = ref<Access>('loading')
const user = ref<any>(null)
const session = ref<any>(null)
const therapistName = ref('')
const firstName = computed(() => user.value?.full_name?.split(/\s+/)[0] || '')
const sessionTime = (iso?: string) =>
  iso ? new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(new Date(ensureUTCString(iso))) : ''

const checkAccess = async () => {
  access.value = 'loading'
  try {
    user.value = await userService.getCurrentUser()
  } catch {
    access.value = 'error'
    return
  }
  if (!user.value || user.value.type !== 'patient') {
    access.value = 'denied'
    return
  }
  if (!inSession) {
    access.value = 'ready'
    return
  }
  try {
    session.value = await sessionsService.getSession(sid)
  } catch {
    access.value = 'denied'
    return
  }
  if (session.value?.patient_id !== user.value.id) {
    access.value = 'denied'
    return
  }
  if (session.value?.ended_at) {
    access.value = 'over'
    return
  }
  const active = await sessionsService.getActiveSession().catch(() => null)
  if (!active || active.id !== sid) {
    const starts = new Date(ensureUTCString(session.value.start_date)).getTime()
    access.value = starts > Date.now() ? 'notStarted' : 'over'
    return
  }
  try {
    therapistName.value = (await userService.getUserById(session.value.therapist_id))?.full_name?.split(/\s+/)[0] || ''
  } catch {
    therapistName.value = ''
  }
  if (!therapistName.value) therapistName.value = t('session.therapistFallback')
  access.value = 'ready'
  connect()
}

// ---------------------------------------------------------------- composing
const way = ref<WayIn | null>((route.meta.way as WayIn) ?? null)
const words = ref('')
const drawDesc = ref('')
const imageDesc = ref('')
type Stage = 'compose' | 'waiting' | 'result'
const stage = ref<Stage>('compose')
const phase = ref<'actions' | 'reflect' | 'done'>('actions')
const failed = ref(false)

interface Made { id: number; fileName: string; kind: CreateKind; date: string }
const made = ref<Made[]>([])
const currentId = ref<number | null>(null)
const kept = ref<string[]>([])
const shared = ref<string[]>([])
const noted = ref<string[]>([])
const busy = ref({ keep: false, share: false, note: false })
const shareFailed = ref(false)

const versions = computed<ResultVersion[]>(() =>
  made.value.map((m) => ({ id: m.id, fileName: m.fileName, src: urlFor(m.fileName), technique: t(`art.technique.${m.kind}`), date: m.date })),
)
const current = computed(() => versions.value.find((v) => v.id === currentId.value) ?? versions.value[versions.value.length - 1])

let lastRun: (() => Promise<any>) | null = null
let lastKind: CreateKind = 'words'
let runToken = 0
let versionSeq = 0

// Progress: the demo engine reports real progress; the real backend has no progress channel, so
// we show an estimate that slows down and never claims to be finished.
const elapsed = ref(0)
let tick: ReturnType<typeof setInterval> | null = null
const ESTIMATE_MS = 30000
const progress = computed(() =>
  isDemo ? (demoProgress.active ? demoProgress.progress : 0) : 0.95 * (1 - Math.exp(-elapsed.value / ESTIMATE_MS)),
)

const run = async (kind: CreateKind, fn: () => Promise<any>) => {
  lastRun = fn
  lastKind = kind
  failed.value = false
  const mine = ++runToken
  stage.value = 'waiting'
  const started = Date.now()
  elapsed.value = 0
  tick = setInterval(() => (elapsed.value = Date.now() - started), 500)
  try {
    const resp = await fn()
    if (mine !== runToken) return
    if (!resp?.file) throw new Error('no file')
    const m: Made = { id: ++versionSeq, fileName: resp.file, kind, date: new Date().toISOString() }
    made.value = [...made.value, m]
    currentId.value = m.id
    phase.value = 'actions'
    stage.value = 'result'
  } catch {
    if (mine !== runToken) return
    failed.value = true
    stage.value = made.value.length ? 'result' : 'compose'
  } finally {
    if (tick) clearInterval(tick)
    tick = null
  }
}

const cancel = () => {
  runToken++
  if (tick) clearInterval(tick)
  stage.value = made.value.length ? 'result' : 'compose'
}

const createFromWords = () => {
  if (!user.value || !words.value.trim()) return
  const uid = user.value.id
  const text = words.value.trim()
  run('words', () => comfyService.createImage({ promptText: text, seed: null, inputImage: null }, uid, sessionIdOrNull))
}

const createFromDrawing = (blob: Blob) => {
  if (!user.value) return
  const uid = user.value.id
  const file = new File([blob], `drawn_${Date.now()}.png`, { type: 'image/png' })
  const text = drawDesc.value.trim()
  let sketchName = ''
  run('sketch', async () => {
    if (!sketchName) sketchName = (await comfyService.uploadDrawnImage(file, uid)).file
    return comfyService.convertirBoceto({ sketchImage: urlFor(sketchName), sketchText: text }, uid, sessionIdOrNull)
  })
}

const createFromImages = (files: string[]) => {
  if (!user.value || !files.length) return
  const uid = user.value.id
  if (files.length === 1) {
    const text = imageDesc.value.trim()
    run('image', () => comfyService.createImage({ promptText: text, seed: null, inputImage: urlFor(files[0]) }, uid, sessionIdOrNull))
  } else {
    const payload = { data: files.map((fileName) => ({ fileName })) }
    run('mixed', () => comfyService.generateImageByMultiple(payload, files.length, uid, sessionIdOrNull))
  }
}

const another = () => {
  if (lastRun) run(lastKind, lastRun)
}

const fresh = () => {
  stage.value = 'compose'
  phase.value = 'actions'
}

// ---------------------------------------------------------------- result choices
const isKept = computed(() => !!current.value && kept.value.includes(current.value.fileName))
const isShared = computed(() => !!current.value && shared.value.includes(current.value.fileName))
const hasNote = computed(() => !!current.value && noted.value.includes(current.value.fileName))
const noteMeta = () => ({ userId: user.value?.id ?? null, sessionId: sessionIdOrNull })

const keep = async () => {
  const v = current.value
  if (!v) return
  busy.value.keep = true
  try {
    await notesService.keepArtwork(v.fileName, noteMeta())
  } catch { /* the image itself is already stored by the backend; the mark is best effort */ }
  busy.value.keep = false
  kept.value = [...kept.value, v.fileName]
  if (shared.value.includes(v.fileName)) wsSend({ event: 'confirm_artwork', fileName: v.fileName })
  phase.value = hasNote.value ? 'done' : 'reflect'
}

const share = () => {
  const v = current.value
  if (!v) return
  shareFailed.value = false
  if (!wsSend({ event: 'submit_image', fileName: v.fileName })) {
    shareFailed.value = true
    return
  }
  shared.value = [...shared.value, v.fileName]
  if (kept.value.includes(v.fileName)) wsSend({ event: 'confirm_artwork', fileName: v.fileName })
}

const saveNote = async (text: string) => {
  const v = current.value
  if (!v || !text.trim()) return
  busy.value.note = true
  try {
    await notesService.saveNote(v.fileName, text.trim(), noteMeta())
    noted.value = [...noted.value, v.fileName]
  } finally {
    busy.value.note = false
  }
  phase.value = isKept.value ? 'done' : 'actions'
}

const skipNote = () => {
  phase.value = isKept.value ? 'done' : 'actions'
}

const selectVersion = (id: number) => {
  currentId.value = id
  const v = versions.value.find((x) => x.id === id)
  phase.value = v && kept.value.includes(v.fileName) ? 'done' : 'actions'
}

// ---------------------------------------------------------------- session socket and chat
let ws: any = null
const connected = ref(false)
const messages = ref<{ sender: string; text: string }[]>([])
const ended = ref(false)
const chatKey = `comfymind.chat.${sid}`
const asideOpen = ref(true)

const loadChat = () => {
  try { messages.value = JSON.parse(sessionStorage.getItem(chatKey) || '[]') } catch { messages.value = [] }
}
watch(messages, (m) => { try { sessionStorage.setItem(chatKey, JSON.stringify(m.slice(-80))) } catch { /* ignore */ } }, { deep: true })

const connect = () => {
  const token = localStorage.getItem('token')
  if (!token || !inSession) return
  loadChat()
  ws = createSocket(`/ws/${sid}/patient?token=${token}`)
  ws.onopen = () => (connected.value = true)
  ws.onclose = () => (connected.value = false)
  ws.onmessage = (ev: MessageEvent) => {
    let obj: any = null
    try { obj = JSON.parse(ev.data) } catch { obj = null }
    if (obj?.event === 'chat_message') {
      messages.value = [...messages.value, { sender: obj.sender, text: obj.text }]
    } else if (!obj && String(ev.data) === 'session_ended') {
      runToken++
      ended.value = true
      try { sessionStorage.removeItem(chatKey) } catch { /* ignore */ }
      ws?.close()
    }
  }
}

const wsSend = (obj: Record<string, unknown>) => {
  if (!ws || ws.readyState !== 1) return false
  ws.send(JSON.stringify(obj))
  return true
}

const sendChat = (text: string) => {
  if (wsSend({ event: 'chat_message', sender: 'patient', text })) {
    messages.value = [...messages.value, { sender: 'patient', text }]
  }
}

const endArtworks = computed(() => {
  const keptV = versions.value.filter((v) => kept.value.includes(v.fileName))
  return (keptV.length ? keptV : versions.value).slice(-6).map((v) => ({ id: v.id, src: v.src, technique: v.technique, date: v.date }))
})

// ---------------------------------------------------------------- focus management
const composeHeading = ref<HTMLElement | null>(null)
const waitRegion = ref<HTMLElement | null>(null)
const resultStage = ref<InstanceType<typeof ResultStage> | null>(null)
const panelHost = ref<HTMLElement | null>(null)

watch(stage, async (s, prev) => {
  await nextTick()
  if (s === 'waiting') waitRegion.value?.focus()
  else if (s === 'result') resultStage.value?.focus()
  else if (prev) composeHeading.value?.focus()
})
watch(way, async (w, prev) => {
  if (!w || !prev) return
  await nextTick()
  panelHost.value?.querySelector<HTMLElement>('h2, label')?.scrollIntoView({ block: 'nearest' })
})
watch(phase, async (p) => {
  if (p !== 'reflect') return
  await nextTick()
  document.querySelector<HTMLTextAreaElement>('#main form textarea')?.focus()
})

const galleryTo = computed(() => (inSession ? `/session/${sid}` : '/freeimages'))

onMounted(checkAccess)
onBeforeUnmount(() => {
  runToken++
  if (tick) clearInterval(tick)
  ws?.close()
})
</script>

<template>
  <AppShell role="patient" v-model:aside-open="asideOpen">
    <div class="flex flex-col gap-10">
      <header class="flex flex-col gap-2">
        <h1 class="type-h1">{{ t('create.title') }}</h1>
        <p class="type-body text-muted-foreground">
          <template v-if="inSession && access === 'ready'">{{ t('create.contextSession', { name: therapistName, end: sessionTime(session?.end_date) }) }}</template>
          <template v-else-if="!inSession">{{ t('create.contextOwn') }}</template>
        </p>
      </header>

      <p v-if="access === 'loading'" class="type-body text-muted-foreground" aria-live="polite">{{ t('create.loading') }}</p>

      <div v-else-if="access !== 'ready'" class="flex max-w-[40rem] flex-col gap-6">
        <SNotice :tone="access === 'error' ? 'danger' : 'info'" :title="t(`create.access.${access}Title`)">
          {{ t(`create.access.${access}Body`, { time: sessionTime(session?.start_date) }) }}
        </SNotice>
        <div class="flex flex-wrap gap-3">
          <SButton v-bind="nav('/home')">{{ t('create.backHome') }}</SButton>
          <SButton v-if="access !== 'error'" variant="secondary" v-bind="nav('/generation')">{{ t('create.ownInstead') }}</SButton>
        </div>
      </div>

      <template v-else>
        <SNotice v-if="failed" tone="danger" :title="t('create.errorTitle')" dismissible @dismiss="failed = false">
          {{ t('create.errorBody') }}
        </SNotice>
        <SNotice v-if="shareFailed" tone="danger" :title="t('create.shareErrorTitle', { name: therapistName })" dismissible @dismiss="shareFailed = false">
          {{ t('create.shareErrorBody') }}
        </SNotice>

        <!-- 1. compose -->
        <section v-show="stage === 'compose'" class="flex flex-col gap-8" aria-labelledby="compose-title">
          <div class="flex flex-col gap-4">
            <h2 id="compose-title" ref="composeHeading" tabindex="-1" class="type-h2 outline-offset-4">{{ t('create.wayTitle') }}</h2>
            <WayInPicker v-model="way" />
          </div>

          <div v-if="way" ref="panelHost" class="rounded-card border-[1.5px] border-border bg-card p-6 sm:p-8">
            <WordsPanel v-if="way === 'words'" v-model="words" @create="createFromWords" />
            <DrawPanel v-else-if="way === 'draw'" v-model:description="drawDesc" @create="createFromDrawing" />
            <ImagePanel v-else v-model:description="imageDesc" :user-id="user?.id ?? null" @create="createFromImages" />
          </div>
          <p v-else class="type-body text-muted-foreground">{{ t('create.wayHint') }}</p>
        </section>

        <!-- 2. waiting: a dusk pause inside the workspace -->
        <section v-if="stage === 'waiting'" ref="waitRegion" tabindex="-1" class="outline-offset-4" :aria-label="t('progress.label')">
          <CalmProgress :progress="progress" class="min-h-[min(70vh,34rem)] justify-center">
            <template #actions>
              <SButton variant="secondary" @click="cancel">{{ t('progress.cancel') }}</SButton>
            </template>
          </CalmProgress>
        </section>

        <!-- 3. result and reflection -->
        <ResultStage
          v-if="stage === 'result' && current"
          ref="resultStage"
          :version="current"
          :versions="versions"
          :made-by="firstName"
          :phase="phase"
          :kept="isKept"
          :shared="isShared"
          :has-note="hasNote"
          :in-session="inSession"
          :therapist-name="therapistName"
          :gallery-to="galleryTo"
          :busy="busy"
          @keep="keep"
          @another="another"
          @share="share"
          @note="phase = 'reflect'"
          @save-note="saveNote"
          @skip-note="skipNote"
          @select="selectVersion"
          @fresh="fresh"
        />
      </template>
    </div>

    <!-- Always pass the slot in a session: AppShell sizes its columns from the slot when it mounts. -->
    <template v-if="inSession" #aside>
      <SessionChat v-if="access === 'ready'" :messages="messages" :therapist-name="therapistName" :connected="connected" @send="sendChat" />
    </template>
  </AppShell>

  <SessionEndOverlay v-if="ended" :artworks="endArtworks" :name="firstName" home-to="/home" />
</template>
