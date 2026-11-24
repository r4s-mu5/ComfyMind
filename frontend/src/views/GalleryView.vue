<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Download, Plus, ArrowLeft, StickyNote } from 'lucide-vue-next'
import { imageUrl as fileUrl } from '@/lib/config'
import { userService } from '@/api/userService'
import { sessionsService } from '@/api/sessionsService'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { getReflectionNote } from '@/lib/reflection'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { ArtworkMount, SButton, SCard, SNotice } from '@/components/sanctuary'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

/**
 * "Mis obras": the patient's gallery (all, in sessions, on their own), one session's obras
 * (route /session/:sessionId, shared by patient and therapist) and the obra detail dialog.
 */
interface Obra { id: string | number; fileName: string; src: string; kind: 'session' | 'own'; date?: string; sessionId?: number }

const route = useRoute()
const router = useRouter()
const { t, locale } = usePrototypeLocale()
const { ensureUTCString } = useDateHelpers()

const sessionId = computed(() => (route.params.sessionId ? Number(route.params.sessionId) : null))
const isSessionView = computed(() => Number.isFinite(sessionId.value))

const loading = ref(true)
const failed = ref(false)
const user = ref<any>(null)
const owner = ref<any>(null) // whose obras these are (the patient)
const therapistName = ref('')
const sessionInfo = ref<any>(null)
const obras = ref<Obra[]>([])
const filter = ref<'all' | 'session' | 'own'>('all')
const selected = ref<Obra | null>(null)
const note = ref('')

const GENERATED = (i: any) => String(i?.fileName || '').startsWith('generated')
const toObra = (i: any, kind: Obra['kind'], date?: string, sid?: number): Obra => ({
  id: i.id ?? i.fileName,
  fileName: i.fileName,
  src: fileUrl('generated_images', i.fileName),
  kind,
  date,
  sessionId: sid,
})
const listOf = (r: any) => {
  const l = r?.data ?? r?.images ?? r ?? []
  return Array.isArray(l) ? l : []
}
const firstName = (n?: string) => (n || '').trim().split(/\s+/)[0] || ''

const load = async () => {
  loading.value = true
  failed.value = false
  try {
    user.value = await userService.getCurrentUser()
    if (isSessionView.value) {
      const s = await sessionsService.getSession(sessionId.value)
      sessionInfo.value = s
      const [patient, therapist] = await Promise.all([
        userService.getUserById(s.patient_id), userService.getUserById(s.therapist_id),
      ])
      owner.value = patient
      therapistName.value = therapist?.full_name || ''
      const list = listOf(await sessionsService.getImagesForSession(sessionId.value))
      obras.value = list.filter(GENERATED).map((i: any) => toObra(i, 'session', s.start_date, s.id))
    } else {
      owner.value = user.value
      const [sessions, free] = await Promise.all([
        sessionsService.getMySessions().catch(() => []),
        sessionsService.getImagesNoSession(user.value.id).catch(() => []),
      ])
      const sList = listOf(sessions).filter((s: any) => s.patient_id === user.value.id)
      const perSession = await Promise.all(
        sList.map(async (s: any) => ({ s, imgs: listOf(await sessionsService.getImagesForSession(s.id).catch(() => [])) })),
      )
      const seen = new Set<string>()
      const out: Obra[] = []
      perSession
        .sort((a, b) => +new Date(ensureUTCString(b.s.start_date)) - +new Date(ensureUTCString(a.s.start_date)))
        .forEach(({ s, imgs }) =>
          imgs.filter(GENERATED).forEach((i: any) => {
            if (seen.has(i.fileName)) return
            seen.add(i.fileName)
            out.push(toObra(i, 'session', s.start_date, s.id))
          }),
        )
      listOf(free).filter(GENERATED).forEach((i: any) => {
        if (seen.has(i.fileName)) return
        seen.add(i.fileName)
        out.push(toObra(i, 'own'))
      })
      obras.value = out
    }
  } catch (e) {
    console.warn('Gallery could not load', e)
    failed.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

const shown = computed(() => (filter.value === 'all' ? obras.value : obras.value.filter((o) => o.kind === filter.value)))
const madeBy = computed(() => firstName(owner.value?.full_name))
const isTherapist = computed(() => user.value?.type === 'therapist')
const filters = computed(() => [
  { id: 'all' as const, label: t('gallery.filterAll') },
  { id: 'session' as const, label: t('gallery.filterSession') },
  { id: 'own' as const, label: t('gallery.filterOwn') },
])
const technique = (o: Obra) => (o.kind === 'session' ? t('gallery.techSession') : t('gallery.techOwn'))
const countText = computed(() => (shown.value.length === 1 ? t('gallery.countOne') : t('gallery.count', { n: shown.value.length })))
const sessionDate = computed(() =>
  sessionInfo.value
    ? new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(ensureUTCString(sessionInfo.value.start_date)),
      )
    : '',
)

const widths = ['w-[17rem]', 'w-[21rem]', 'w-[15rem]', 'w-[19rem]']
const ratios = ['1 / 1', '4 / 5', '5 / 4', '1 / 1']
const dateLabel = (d?: string) =>
  d ? new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'long' }).format(new Date(ensureUTCString(d))) : ''
const rooms = computed(() => {
  if (isSessionView.value) return [{ key: 'one', title: '', items: shown.value }]
  const map = new Map<string, { key: string; title: string; items: Obra[] }>()
  shown.value.forEach((o) => {
    const key = o.sessionId ? `s${o.sessionId}` : 'own'
    if (!map.has(key)) map.set(key, { key, title: o.sessionId ? t('gallery.sessionOf', { date: dateLabel(o.date) }) : t('gallery.filterOwn'), items: [] })
    map.get(key)!.items.push(o)
  })
  return [...map.values()]
})

const open = async (o: Obra) => {
  selected.value = o
  note.value = ''
  note.value = await getReflectionNote(o.fileName, o.id)
}
const close = () => { selected.value = null }
const goCreate = () => router.push('/generation/')
const downloadName = (o: Obra) => o.fileName.replace(/^generated_/, 'obra_')
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-3">
      <template v-if="isSessionView">
        <SButton variant="quiet" size="compact" class="self-start -ml-3" :to="isTherapist ? '/calendar' : '/freeimages/'">
          <template #icon><ArrowLeft aria-hidden="true" /></template>
          {{ isTherapist ? t('calendar.title') : t('gallery.toGallery') }}
        </SButton>
        <h1 class="type-h1">{{ t('gallery.sessionOf', { date: sessionDate }) }}</h1>
        <p class="type-body text-muted-foreground">{{ t('gallery.withTherapist', { name: therapistName }) }} · {{ owner ? firstName(owner.full_name) : '' }}</p>
      </template>
      <template v-else>
        <h1 class="type-h1">{{ t('gallery.title') }}</h1>
        <p class="type-body measure text-muted-foreground">{{ t('gallery.description') }}</p>
      </template>
    </header>

    <p v-if="loading" role="status" class="type-body text-muted-foreground">{{ t('gallery.loading') }}</p>

    <SNotice v-else-if="failed" tone="danger" :title="t('gallery.errorTitle')">
      <p>{{ t('gallery.errorBody') }}</p>
      <SButton class="mt-3" variant="secondary" size="compact" @click="load">{{ t('gallery.retry') }}</SButton>
    </SNotice>

    <!-- Empty state: a soft dusk sky made of tokens (no figures), one primary action. -->
    <section
      v-else-if="obras.length === 0"
      class="dusk sky relative isolate overflow-hidden rounded-card"
      aria-labelledby="empty-title"
    >
      <div class="absolute inset-0 -z-10" aria-hidden="true">
        <div class="mist" />
        <div class="sun-disc" />
        <div class="grain" />
      </div>
      <div class="flex min-h-[26rem] items-center justify-center p-6">
        <div class="scrim flex max-w-[34rem] flex-col items-center gap-4 p-8 text-center">
          <h2 id="empty-title" class="type-h1 text-foreground">{{ t('gallery.emptyHere') }}</h2>
          <p class="type-body text-muted-foreground">{{ t('gallery.emptyHint') }}</p>
          <SButton v-if="!isTherapist" class="mt-2" @click="goCreate">
            <template #icon><Plus aria-hidden="true" /></template>
            {{ t('gallery.create') }}
          </SButton>
        </div>
      </div>
    </section>

    <template v-else>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div v-if="!isSessionView" role="group" :aria-label="t('gallery.filterLabel')" class="flex flex-wrap gap-6">
          <button
            v-for="f in filters"
            :key="f.id"
            type="button"
            :aria-pressed="filter === f.id"
            :class="[
              'min-h-12 border-b-[3px] px-2 text-lg',
              filter === f.id ? 'border-foreground font-bold text-foreground' : 'border-transparent font-medium text-muted-foreground hover:border-border hover:text-foreground',
            ]"
            @click="filter = f.id"
          >
            {{ f.label }}
          </button>
        </div>
        <p class="type-small text-muted-foreground" aria-live="polite">{{ countText }}</p>
      </div>

      <p v-if="shown.length === 0" class="type-body text-muted-foreground">{{ t('gallery.emptyFilter') }}</p>

      <!-- The wall: obras hang at different widths, grouped into rooms (one per session). -->
      <section v-for="room in rooms" :key="room.key" class="flex flex-col gap-8" :aria-label="room.title || t('gallery.title')">
        <template v-if="room.title">
          <h2 class="type-h3 text-muted-foreground">{{ room.title }}</h2>
          <hr class="flute-rule" />
        </template>
        <ul class="flex flex-wrap items-end gap-x-12 gap-y-14">
          <li v-for="(o, i) in room.items" :key="o.id" :class="widths[i % widths.length]">
            <button
              type="button"
              class="block w-full text-left"
              :aria-label="t('gallery.open', { title: t('art.untitled') })"
              @click="open(o)"
            >
              <ArtworkMount
                :src="o.src"
                :technique="technique(o)"
                :date="o.date ? ensureUTCString(o.date) : undefined"
                :made-by="madeBy"
                :ratio="ratios[i % ratios.length]"
                mat="sm"
              />
            </button>
          </li>
        </ul>
      </section>
    </template>

    <Dialog :open="Boolean(selected)" @update:open="(v: boolean) => !v && close()">
      <DialogContent :show-close-button="false" class="max-h-[92vh] max-w-[min(92vw,56rem)] overflow-y-auto rounded-card border-[1.5px] border-border bg-background p-6 sm:max-w-[min(92vw,56rem)] sm:p-8">
        <DialogTitle class="type-h2">{{ t('gallery.detailTitle') }}</DialogTitle>
        <DialogDescription class="sr-only">{{ t('gallery.description') }}</DialogDescription>
        <div v-if="selected" class="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <ArtworkMount
            :src="selected.src"
            :technique="technique(selected)"
            :date="selected.date ? ensureUTCString(selected.date) : undefined"
            :made-by="madeBy"
            mat="md"
            loading="eager"
          />
          <div class="flex flex-col gap-4">
            <h3 class="type-h3 flex items-center gap-2"><StickyNote aria-hidden="true" class="size-5" /> {{ t('gallery.reflection') }}</h3>
            <SCard v-if="note" :raised="false" padding="md"><p class="type-body">{{ note }}</p></SCard>
            <p v-else class="type-body text-muted-foreground">{{ t('gallery.noReflection') }}</p>
            <div class="mt-auto flex flex-wrap gap-3 pt-4">
              <SButton as="a" :href="selected.src.split('#')[0]" :download="downloadName(selected)" variant="primary">
                <template #icon><Download aria-hidden="true" /></template>
                {{ t('gallery.download') }}
              </SButton>
              <SButton variant="secondary" @click="close">{{ t('gallery.close') }}</SButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
