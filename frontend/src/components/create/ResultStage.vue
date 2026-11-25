<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { ArtworkMount, FramePicker, ReflectionPrompt, SButton, VersionsStrip, frameFor, setFrameFor } from '@/components/sanctuary'

/**
 * The obra just made: a large mounted piece in its niche and, beside it, the choices.
 * phase 'actions'  Guardar en mis obras (primary) · Otra versión · Compartir (in session) · Anotar un pensamiento
 * phase 'reflect'  the optional ReflectionPrompt (after Guardar, or from "Anotar un pensamiento")
 * phase 'done'     what happened, then Crear otra obra / Ver mis obras
 * No ranking and no "regenerate": versions are only listed, the current one outlined.
 * Each stack of choices has one fill, at most one outline, and the rest are quiet text buttons.
 * After the choices, a quiet "Marco" row changes the mount live; the choice is remembered per obra (frames.ts).
 */
export interface ResultVersion { id: number; fileName: string; src: string; technique: string; date: string }

const props = defineProps<{
  version: ResultVersion
  versions: ResultVersion[]
  madeBy: string
  phase: 'actions' | 'reflect' | 'done'
  kept: boolean
  shared: boolean
  hasNote: boolean
  inSession: boolean
  therapistName: string
  galleryTo: string
  busy?: { keep?: boolean; share?: boolean; note?: boolean }
}>()
const emit = defineEmits<{
  keep: []
  another: []
  share: []
  note: []
  saveNote: [text: string]
  skipNote: []
  select: [id: number]
  fresh: []
}>()
const { t } = usePrototypeLocale()
const noteDraft = ref('')
const heading = ref<HTMLElement | null>(null)

const current = computed({
  get: () => props.version.id as string | number | null,
  set: (id) => id != null && emit('select', Number(id)),
})
// A new obra is the featured piece: it opens in its niche (arch) until the person picks another frame.
const frame = computed({
  get: () => frameFor(props.version.fileName, 'arch'),
  set: (shape) => setFrameFor(props.version.fileName, shape),
})
const strip = computed(() => props.versions.map((v) => ({ id: v.id, src: v.src, alt: '' })))

defineExpose({ focus: () => heading.value?.focus() })
</script>

<template>
  <!-- Container query: side by side only when the column itself is wide enough (aside open, 150% text). -->
  <div class="@container">
  <div class="grid gap-10 @[40rem]:grid-cols-[minmax(0,3fr)_minmax(15rem,2fr)] @[40rem]:items-start">
    <div class="mx-auto w-full max-w-[min(36rem,50vh)] @[40rem]:max-w-[36rem]">
      <ArtworkMount
        :src="version.src"
        :technique="version.technique"
        :date="version.date"
        :made-by="madeBy"
        :frame="frame"
        mat="lg"
        loading="eager"
      />
    </div>

    <div class="flex flex-col gap-8">
      <div class="flex flex-col gap-2">
        <h2 ref="heading" tabindex="-1" class="type-h2 outline-offset-4">{{ t('create.resultTitle') }}</h2>
        <p v-if="!kept" class="type-body text-muted-foreground">{{ t('create.resultLede') }}</p>
      </div>

      <ul v-if="kept || shared || hasNote" class="flex flex-col gap-2" role="list">
        <li v-if="kept" class="type-body flex items-center gap-3 font-semibold text-success">
          <Check aria-hidden="true" class="size-5 shrink-0" /> {{ t('create.keptStatus') }}
        </li>
        <li v-if="hasNote" class="type-body flex items-center gap-3 font-semibold text-success">
          <Check aria-hidden="true" class="size-5 shrink-0" /> {{ t('create.noteStatus') }}
        </li>
        <li v-if="shared" class="type-body flex items-center gap-3 font-semibold text-success">
          <Check aria-hidden="true" class="size-5 shrink-0" /> {{ t('create.sharedStatus', { name: therapistName }) }}
        </li>
      </ul>

      <!-- choices -->
      <div v-if="phase === 'actions'" class="flex flex-col gap-4">
        <SButton v-if="!kept" class="self-start" :busy="busy?.keep" @click="emit('keep')">{{ t('create.keep') }}</SButton>
        <div class="flex flex-wrap gap-3">
          <SButton variant="secondary" @click="emit('another')">{{ t('create.another') }}</SButton>
          <SButton v-if="inSession && !shared" variant="quiet" :busy="busy?.share" @click="emit('share')">
            {{ t('create.share', { name: therapistName }) }}
          </SButton>
          <SButton v-if="!hasNote" variant="quiet" @click="emit('note')">{{ t('create.addThought') }}</SButton>
        </div>
        <p v-if="inSession" class="type-small text-muted-foreground">{{ t('session.canSee', { name: therapistName }) }}</p>
      </div>

      <div v-else-if="phase === 'reflect'" data-reflect class="mat p-6 sm:p-8">
        <ReflectionPrompt v-model="noteDraft" :busy="busy?.note" @save="(n) => emit('saveNote', n)" @skip="emit('skipNote')" />
      </div>

      <div v-else class="flex flex-col gap-4">
        <SButton class="self-start" @click="emit('fresh')">{{ t('create.fresh') }}</SButton>
        <div class="flex flex-wrap gap-3">
          <SButton variant="secondary" :to="galleryTo">{{ t('create.toGallery') }}</SButton>
          <SButton v-if="inSession && !shared" variant="quiet" :busy="busy?.share" @click="emit('share')">
            {{ t('create.share', { name: therapistName }) }}
          </SButton>
          <SButton variant="quiet" @click="emit('another')">{{ t('create.another') }}</SButton>
        </div>
        <p v-if="inSession" class="type-small text-muted-foreground">{{ t('session.canSee', { name: therapistName }) }}</p>
      </div>

      <!-- A quiet row after the choices (chips, no fill): it never competes with Guardar. -->
      <FramePicker v-if="phase !== 'reflect'" v-model="frame" />

      <template v-if="versions.length > 1">
        <hr class="flute-rule" />
        <VersionsStrip v-model="current" :versions="strip" />
      </template>
    </div>
  </div>
  </div>
</template>
