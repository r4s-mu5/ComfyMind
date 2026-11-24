<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'
import { Check, Upload } from 'lucide-vue-next'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { comfyService } from '@/api/comfyService'
import { SButton, SNotice } from '@/components/sanctuary'
import { urlFor } from './images'

/**
 * Way in "Imagen": choose a starting image from Mis obras or the inspiration collection, or upload
 * one (a large drop zone that is also a real button). "Usar varias imágenes" turns on combining
 * 2 to 4 images. Emits `create` with the chosen file names; the parent picks the service call.
 */
const props = defineProps<{ userId: number | null; busy?: boolean }>()
const emit = defineEmits<{ create: [files: string[]] }>()
const description = defineModel<string>('description', { default: '' })
const { t } = usePrototypeLocale()
const descId = useId()
const multiId = useId()

const MAX = 4
const MIN_MULTI = 2
const PAGE = 12

interface Tile { fileName: string; src: string }
const source = ref<'mine' | 'templates'>('mine')
const mine = ref<Tile[]>([])
const templates = ref<Tile[]>([])
const loading = ref(true)
const loadError = ref(false)
const shown = ref(PAGE)
const multi = ref(false)
const selected = ref<string[]>([])
const uploading = ref(false)
const uploadError = ref(false)
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const tiles = computed(() => (source.value === 'mine' ? mine.value : templates.value))
const visible = computed(() => tiles.value.slice(0, shown.value))
const canCreate = computed(() => (multi.value ? selected.value.length >= MIN_MULTI : selected.value.length === 1))
const allTiles = computed(() => [...mine.value, ...templates.value])
const selectedTiles = computed(() => selected.value.map((f) => allTiles.value.find((x) => x.fileName === f)).filter(Boolean) as Tile[])

const load = async () => {
  loading.value = true
  loadError.value = false
  try {
    const [userResp, tplResp] = await Promise.all([
      props.userId ? comfyService.getImagesForUser(props.userId) : Promise.resolve({ data: [] }),
      comfyService.getTemplateImages(),
    ])
    const list = ((userResp as any)?.data ?? (userResp as any)?.images ?? []) as { id: number; fileName: string }[]
    mine.value = [...list]
      .filter((i) => /^(generated|uploaded_image|drawn|uploaded_drawn)/.test(i.fileName))
      .sort((a, b) => b.id - a.id)
      .map((i) => ({ fileName: i.fileName, src: urlFor(i.fileName) }))
    templates.value = (((tplResp as any)?.images ?? []) as string[]).map((f) => ({ fileName: f, src: urlFor(f) }))
    if (!mine.value.length) source.value = 'templates'
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

const toggle = (fileName: string) => {
  const i = selected.value.indexOf(fileName)
  if (!multi.value) {
    selected.value = i >= 0 ? [] : [fileName]
    return
  }
  if (i >= 0) selected.value = selected.value.filter((f) => f !== fileName)
  else if (selected.value.length < MAX) selected.value = [...selected.value, fileName]
}

const setMulti = (on: boolean) => {
  multi.value = on
  if (!on && selected.value.length > 1) selected.value = selected.value.slice(-1)
}

const isFull = computed(() => multi.value && selected.value.length >= MAX)

const handleFile = async (file?: File | null) => {
  if (!file || !props.userId) return
  if (!file.type.startsWith('image/')) {
    uploadError.value = true
    return
  }
  uploading.value = true
  uploadError.value = false
  try {
    const resp = await comfyService.uploadImage(file, props.userId)
    const tile = { fileName: resp.file, src: urlFor(resp.file) }
    mine.value = [tile, ...mine.value]
    source.value = 'mine'
    if (multi.value) {
      if (selected.value.length < MAX) selected.value = [...selected.value, tile.fileName]
    } else selected.value = [tile.fileName]
  } catch {
    uploadError.value = true
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const onDrop = (e: DragEvent) => {
  dragOver.value = false
  handleFile(e.dataTransfer?.files?.[0])
}

const submit = () => {
  if (canCreate.value) emit('create', [...selected.value])
}

const sourceBtn = (active: boolean) => [
  'type-body inline-flex min-h-12 items-center rounded-control border-b-[3px] px-4 font-semibold transition-colors',
  active ? 'border-mark bg-secondary text-foreground' : 'border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
]
</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-1">
      <h2 class="type-h2">{{ t('create.imageTitle') }}</h2>
      <p class="type-small text-muted-foreground">{{ t('create.imageHelp') }}</p>
    </div>

    <button
      type="button"
      :class="[
        'flex min-h-28 w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-6 text-center transition-colors',
        dragOver ? 'border-ring bg-secondary' : 'border-input bg-card hover:bg-secondary',
      ]"
      :aria-busy="uploading || undefined"
      :disabled="uploading"
      @click="fileInput?.click()"
      @dragover.prevent="dragOver = true"
      @dragleave="dragOver = false"
      @drop.prevent="onDrop"
    >
      <Upload aria-hidden="true" class="size-6 text-mark" />
      <span class="type-body font-semibold">{{ uploading ? t('create.uploading') : t('create.uploadTitle') }}</span>
      <span class="type-small text-muted-foreground">{{ t('create.uploadHint') }}</span>
    </button>
    <input ref="fileInput" type="file" accept="image/*" class="sr-only" tabindex="-1" aria-hidden="true" @change="handleFile(($event.target as HTMLInputElement).files?.[0])" />
    <SNotice v-if="uploadError" tone="danger" :title="t('create.uploadErrorTitle')" dismissible @dismiss="uploadError = false">
      {{ t('create.uploadErrorBody') }}
    </SNotice>

    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-end justify-between gap-4 border-b border-border">
        <div role="group" :aria-label="t('create.sourceGroup')" class="flex gap-1">
          <button type="button" :class="sourceBtn(source === 'mine')" :aria-pressed="source === 'mine'" @click="source = 'mine'; shown = PAGE">
            {{ t('create.sourceMine') }}
          </button>
          <button type="button" :class="sourceBtn(source === 'templates')" :aria-pressed="source === 'templates'" @click="source = 'templates'; shown = PAGE">
            {{ t('create.sourceTemplates') }}
          </button>
        </div>
        <label :for="multiId" class="type-body mb-2 inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-control px-2">
          <input :id="multiId" type="checkbox" class="size-6 accent-[var(--dawn-violet)]" :checked="multi" @change="setMulti(($event.target as HTMLInputElement).checked)" />
          {{ t('create.multi') }}
        </label>
      </div>

      <p class="type-small text-muted-foreground" aria-live="polite">
        <template v-if="multi">{{ t('create.multiCount', { n: selected.length, max: MAX }) }}</template>
        <template v-else-if="selected.length">{{ t('create.singleChosen') }}</template>
        <template v-else>{{ t('create.singleHint') }}</template>
      </p>

      <p v-if="loading" class="type-body text-muted-foreground" aria-live="polite">{{ t('create.imagesLoading') }}</p>
      <SNotice v-else-if="loadError" tone="danger" :title="t('create.imagesErrorTitle')">
        <div class="flex flex-col items-start gap-3">
          <span>{{ t('create.imagesErrorBody') }}</span>
          <SButton variant="secondary" size="compact" @click="load">{{ t('create.imagesRetry') }}</SButton>
        </div>
      </SNotice>
      <p v-else-if="!tiles.length" class="type-body text-muted-foreground">{{ t('create.imagesEmpty') }}</p>
      <ul v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" role="list">
        <li v-for="(tile, i) in visible" :key="tile.fileName">
          <button
            type="button"
            :aria-pressed="selected.includes(tile.fileName)"
            :aria-label="t('create.tileLabel', { n: i + 1 })"
            :disabled="isFull && !selected.includes(tile.fileName)"
            :class="[
              'group relative block w-full rounded-control bg-dawn-surface p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              selected.includes(tile.fileName) ? 'outline outline-[3px] outline-offset-2 outline-ring' : 'border-2 border-input hover:border-ring',
            ]"
            @click="toggle(tile.fileName)"
          >
            <img :src="tile.src" alt="" loading="lazy" class="block aspect-square w-full rounded-sm object-cover" />
            <span
              v-if="selected.includes(tile.fileName)"
              class="type-small absolute left-3 top-3 inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1 font-semibold text-primary-foreground"
            >
              <Check aria-hidden="true" class="size-4" />
              {{ multi ? t('create.chosenN', { n: selected.indexOf(tile.fileName) + 1 }) : t('create.chosen') }}
            </span>
          </button>
        </li>
      </ul>
      <SButton v-if="tiles.length > shown" variant="quiet" class="self-start" @click="shown += PAGE">{{ t('create.showMore') }}</SButton>
    </div>

    <div v-if="selectedTiles.length && multi" class="flex flex-col gap-3">
      <p class="type-body font-semibold">{{ t('create.combineTitle') }}</p>
      <ul class="flex flex-wrap gap-3" role="list">
        <li v-for="tile in selectedTiles" :key="tile.fileName" class="size-20 rounded-control border-[1.5px] border-dawn-hairline bg-dawn-surface p-1">
          <img :src="tile.src" alt="" class="size-full rounded-sm object-cover" />
        </li>
      </ul>
      <p class="type-small text-muted-foreground">{{ t('create.combineNote') }}</p>
    </div>

    <div v-if="!multi" class="flex flex-col gap-2">
      <label :for="descId" class="type-body font-semibold">
        {{ t('create.imageDescLabel') }}
        <span class="type-small font-normal text-muted-foreground">{{ t('field.optional') }}</span>
      </label>
      <textarea
        :id="descId"
        v-model="description"
        rows="2"
        :placeholder="t('create.imageDescPlaceholder')"
        class="type-body w-full resize-y rounded-control border-2 border-input bg-card px-4 py-3 leading-relaxed text-foreground placeholder:text-muted-foreground"
      />
    </div>

    <hr class="flute-rule" />
    <div class="flex flex-wrap items-center gap-4">
      <SButton :disabled="!canCreate" :busy="busy" @click="submit">{{ t('create.create') }}</SButton>
      <p v-if="!canCreate" class="type-small text-muted-foreground">
        {{ multi ? t('create.multiNeeded') : t('create.imageNeeded') }}
      </p>
    </div>
  </div>
</template>
