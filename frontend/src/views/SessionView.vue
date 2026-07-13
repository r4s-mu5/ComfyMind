<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CalendarDays, ImageIcon, Images, Info, Loader2, Plus, UserRound } from 'lucide-vue-next'
import { sessionsService } from '../api/sessionsService'
import { userService } from '../api/userService'
import { useDateHelpers } from '@/lib/useDateHelpers'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import demoArtworkOne from '@/assets/images/template_images/ComfyUI_00105_.png'
import demoArtworkTwo from '@/assets/images/template_images/ComfyUI_00094_.png'
import demoArtworkThree from '@/assets/images/template_images/ComfyUI_00177_.png'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

const route = useRoute()
const router = useRouter()
const sessionId = Number(route.params.sessionId)
const { formatLocalDate } = useDateHelpers()
const { isDemo, locationWithDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()

const sessionInfo = ref<any>(null)
const images = ref<any[]>([])
const isLoadingImages = ref(true)
const showDetails = ref(false)
const activeUser = ref<any>(null)
const otherUser = ref<any>(null)
const showUnauthorizedDialog = ref(false)
const selectedArtwork = ref<any>(null)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const setDemoData = () => {
  activeUser.value = { id: 'demo-patient', full_name: 'Alex', type: 'patient' }
  otherUser.value = { id: 'demo-therapist', full_name: 'Marta Soler', type: 'therapist' }
  sessionInfo.value = {
    id: 'demo-session',
    start_date: '2026-07-16T14:30:00Z',
    end_date: '2026-07-16T15:30:00Z',
  }
  images.value = [
    { id: 'demo-artwork-1', demoUrl: demoArtworkOne },
    { id: 'demo-artwork-2', demoUrl: demoArtworkTwo },
    { id: 'demo-artwork-3', demoUrl: demoArtworkThree },
  ]
  isLoadingImages.value = false
}

const getImageUrl = (image: any) => {
  if (image?.demoUrl) return image.demoUrl
  const fileName = image?.fileName
  if (!fileName) return ''
  if (fileName.startsWith('uploaded')) return `${API_URL}/images/uploaded_images/${fileName}`
  if (fileName.startsWith('generated')) return `${API_URL}/images/generated_images/${fileName}`
  if (fileName.startsWith('drawn')) return `${API_URL}/images/drawn_images/${fileName}`
  return `${API_URL}/images/template_images/${fileName}`
}

const loadSessionArtwork = async () => {
  sessionInfo.value = await sessionsService.getSession(sessionId)
  const patientId = sessionInfo.value?.patient_id ?? sessionInfo.value?.patient?.id
  const therapistId = sessionInfo.value?.therapist_id ?? sessionInfo.value?.therapist?.id
  const authorized = activeUser.value && [patientId, therapistId].includes(activeUser.value.id)
  if (!authorized) throw new Error('unauthorized')

  otherUser.value = await userService.getUserById(activeUser.value.type === 'therapist' ? patientId : therapistId)
  const response = await sessionsService.getImagesForSession(sessionId)
  const list = response?.data ?? response?.images ?? []
  images.value = Array.isArray(list) ? list.filter((image: any) => image.fileName?.startsWith('generated')) : []
}

const loadFreeArtwork = async () => {
  if (!activeUser.value || activeUser.value.type !== 'patient') throw new Error('unauthorized')
  const response = await sessionsService.getImagesNoSession(activeUser.value.id)
  const list = response?.data ?? response?.images ?? response ?? []
  images.value = Array.isArray(list) ? list.filter((image: any) => image.fileName?.startsWith('generated')) : []
}

onMounted(async () => {
  if (isDemo.value) {
    setDemoData()
    return
  }

  try {
    activeUser.value = await userService.getCurrentUser()
    if (Number.isFinite(sessionId)) await loadSessionArtwork()
    else await loadFreeArtwork()
  } catch (error) {
    console.warn('Unable to load artwork', error)
    showUnauthorizedDialog.value = true
  } finally {
    isLoadingImages.value = false
  }
})
</script>

<template>
  <div class="prototype-page">
    <header class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="prototype-eyebrow">{{ t('gallery.eyebrow') }}</p>
        <h1 class="prototype-title mt-3">{{ Number.isFinite(sessionId) ? t('gallery.sessionTitle') : t('gallery.title') }}</h1>
        <p class="prototype-lead mt-3">{{ t('gallery.description') }}</p>
      </div>
      <div class="flex flex-wrap gap-3">
        <Button
          v-if="Number.isFinite(sessionId)"
          variant="outline"
          class="h-11 rounded-xl bg-white"
          @click="showDetails = true"
        >
          <Info aria-hidden="true" /> {{ t('gallery.details') }}
        </Button>
        <Button class="h-11 rounded-xl" @click="router.push(locationWithDemo('/generation'))">
          <Plus aria-hidden="true" /> {{ t('gallery.create') }}
        </Button>
      </div>
    </header>

    <section v-if="isLoadingImages" class="flex min-h-80 items-center justify-center" aria-live="polite">
      <div class="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
        <Loader2 aria-hidden="true" class="size-6 animate-spin text-primary" />
        <span class="font-semibold">{{ t('gallery.loading') }}</span>
      </div>
    </section>

    <Card v-else-if="images.length === 0" class="border-dashed bg-white py-16 text-center shadow-none">
      <CardContent>
        <span class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-secondary text-primary">
          <Images aria-hidden="true" class="size-9" />
        </span>
        <h2 class="mt-6 text-2xl font-bold">{{ t('gallery.emptyTitle') }}</h2>
        <p class="mx-auto mt-2 max-w-md leading-7 text-muted-foreground">{{ t('gallery.emptyDescription') }}</p>
        <Button class="mt-6 h-12 rounded-xl px-6" @click="router.push(locationWithDemo('/generation'))">
          {{ t('gallery.create') }}
        </Button>
      </CardContent>
    </Card>

    <ul v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="(artwork, index) in images" :key="artwork.id || artwork.fileName">
        <button
          class="group w-full overflow-hidden rounded-2xl border border-border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          @click="selectedArtwork = artwork"
        >
          <span class="block aspect-square overflow-hidden bg-muted">
            <img
              :src="getImageUrl(artwork)"
              :alt="`${t('gallery.artworkAlt')} ${index + 1}`"
              class="size-full object-cover transition group-hover:scale-[1.02]"
            />
          </span>
          <span class="flex min-h-16 items-center justify-between gap-3 px-4 py-3">
            <span>
              <span class="block font-bold">{{ t('gallery.artworkAlt') }} {{ index + 1 }}</span>
              <span class="mt-0.5 block text-sm text-muted-foreground">16/07/2026</span>
            </span>
            <ImageIcon aria-hidden="true" class="size-5 text-primary" />
          </span>
        </button>
      </li>
    </ul>

    <div class="mt-8">
      <Button variant="ghost" class="h-11 rounded-xl" @click="router.push(locationWithDemo('/home'))">
        <ArrowLeft aria-hidden="true" /> {{ t('gallery.back') }}
      </Button>
    </div>

    <Dialog :open="Boolean(selectedArtwork)" @update:open="(open) => !open && (selectedArtwork = null)">
      <DialogContent class="max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>{{ t('gallery.title') }}</DialogTitle>
          <DialogDescription>{{ t('gallery.description') }}</DialogDescription>
        </DialogHeader>
        <img v-if="selectedArtwork" :src="getImageUrl(selectedArtwork)" :alt="t('gallery.artworkAlt')" class="max-h-[70vh] w-full rounded-xl bg-muted object-contain" />
      </DialogContent>
    </Dialog>

    <Dialog :open="showDetails" @update:open="showDetails = $event">
      <DialogContent class="rounded-2xl">
        <DialogHeader>
          <DialogTitle>{{ t('gallery.details') }}</DialogTitle>
          <DialogDescription>{{ t('gallery.sessionTitle') }}</DialogDescription>
        </DialogHeader>
        <dl class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl bg-muted p-4">
            <dt class="flex items-center gap-2 text-sm text-muted-foreground"><UserRound class="size-4" /> {{ t('home.therapist') }}</dt>
            <dd class="mt-1 font-bold">{{ otherUser?.full_name || 'Marta Soler' }}</dd>
          </div>
          <div class="rounded-xl bg-muted p-4">
            <dt class="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays class="size-4" /> {{ t('home.date') }}</dt>
            <dd class="mt-1 font-bold">{{ sessionInfo ? formatLocalDate(sessionInfo.start_date).slice(0, 8) : '16/07/2026' }}</dd>
          </div>
        </dl>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="showUnauthorizedDialog" @update:open="(open) => !open && router.push('/home')">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Acceso no autorizado</AlertDialogTitle>
          <AlertDialogDescription>No tienes acceso a esta biblioteca.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter><AlertDialogAction @click="router.push('/home')">Volver al inicio</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
