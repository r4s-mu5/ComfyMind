<script setup lang="ts">
/**
 * Living style guide for the Sanctuary design system. Route: /design (also in demo mode).
 * Everything here reads the real tokens from style.css at runtime, so it can never go stale:
 * swatch hex values and contrast ratios are computed from the CSS custom properties.
 * (Copy on this page is English: it is a developer tool. App screens must use the locale file.)
 */
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Check } from 'lucide-vue-next'
import { resolveDemoImage } from '@/lib/demo/images'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import {
  AppShell, ArtworkMount, CalmProgress, DemoTag, MuseumLabel, ReflectionPrompt, SButton, SCard,
  SField, SNotice, SessionCard, VersionsStrip, WayInPicker,
} from '@/components/sanctuary'

const { t } = usePrototypeLocale()

// ---- token swatches -------------------------------------------------------------------------
interface Swatch { token: string; use: string; on?: string }
interface Group { title: string; scope?: 'dawn' | 'dusk'; items: Swatch[] }

const groups: Group[] = [
  {
    title: 'Dusk (thresholds)',
    scope: 'dusk',
    items: [
      { token: '--dusk-sky', use: 'page background', on: '--dusk-text' },
      { token: '--dusk-sky-deep', use: 'top of sky gradient', on: '--dusk-text' },
      { token: '--dusk-sky-mid', use: 'sky gradient', on: '--dusk-text' },
      { token: '--dusk-sky-low', use: 'sky gradient, near horizon', on: '--dusk-text' },
      { token: '--dusk-surface', use: 'panels, cards (92%+ opaque)', on: '--dusk-text' },
      { token: '--dusk-text', use: 'primary text (on sky)', on: '--dusk-sky' },
      { token: '--dusk-text-soft', use: 'secondary text (on sky)', on: '--dusk-sky' },
      { token: '--dusk-light', use: 'primary action fill', on: '--dusk-sky' },
      { token: '--dusk-teal', use: 'links, selection (on sky)', on: '--dusk-sky' },
      { token: '--dusk-lilac', use: 'highlights, tags (on sky)', on: '--dusk-sky' },
      { token: '--dusk-border', use: 'input borders (on sky)', on: '--dusk-sky' },
      { token: '--dusk-focus', use: 'focus ring (on sky)', on: '--dusk-sky' },
    ],
  },
  {
    title: 'Dawn (working screens)',
    scope: 'dawn',
    items: [
      { token: '--dawn-bg', use: 'page background', on: '--dawn-ink' },
      { token: '--dawn-bg-warm', use: 'top glow, hero bands', on: '--dawn-ink' },
      { token: '--dawn-surface', use: 'cards, mats, inputs', on: '--dawn-ink' },
      { token: '--dawn-surface-2', use: 'selected and soft fills', on: '--dawn-ink' },
      { token: '--dawn-ink', use: 'primary text, primary button', on: '--dawn-surface' },
      { token: '--dawn-ink-soft', use: 'secondary text (on bg)', on: '--dawn-bg' },
      { token: '--dawn-teal', use: 'links, active nav, progress (on bg)', on: '--dawn-bg' },
      { token: '--dawn-violet', use: 'wordmark, focus ring (on bg)', on: '--dawn-bg' },
      { token: '--dawn-border', use: 'control borders (on white)', on: '--dawn-surface' },
      { token: '--dawn-hairline', use: 'decorative dividers only' },
      { token: '--dawn-sun', use: 'sun motif, decorative only' },
    ],
  },
  {
    title: 'Semantic (dawn values)',
    scope: 'dawn',
    items: [
      { token: '--success-dawn', use: 'success (always with icon + text)', on: '--dawn-surface' },
      { token: '--warning-dawn', use: 'warning', on: '--dawn-surface' },
      { token: '--danger-dawn', use: 'danger, destructive actions', on: '--dawn-surface' },
    ],
  },
  {
    title: 'Semantic (dusk values)',
    scope: 'dusk',
    items: [
      { token: '--success-dusk', use: 'success on dusk', on: '--dusk-sky' },
      { token: '--warning-dusk', use: 'warning on dusk', on: '--dusk-sky' },
      { token: '--danger-dusk', use: 'danger on dusk', on: '--dusk-sky' },
    ],
  },
]

const values = reactive<Record<string, string>>({})

const parseHex = (v: string): [number, number, number] | null => {
  // Accepts #rrggbb and #rgb (the build minifies #FFFFFF to #fff).
  let hex = v.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1]
  if (!hex) return null
  if (hex.length === 3) hex = [...hex].map((c) => c + c).join('')
  const n = parseInt(hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const lum = ([r, g, b]: [number, number, number]) => {
  const f = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratioOf = (a: string, b?: string) => {
  const ca = a && parseHex(values[a] ?? ''); const cb = b && parseHex(values[b] ?? '')
  if (!ca || !cb) return null
  const [hi, lo] = [lum(ca), lum(cb)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
const grade = (r: number | null) => (r === null ? '' : r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large' : 'Fail')

onMounted(() => {
  const cs = getComputedStyle(document.documentElement)
  for (const g of groups) for (const s of g.items) values[s.token] = cs.getPropertyValue(s.token).trim()
})

// ---- type, space, shape ----------------------------------------------------------------------
const typeRoles = [
  { cls: 'type-wordmark', name: 'Wordmark', spec: 'Tenor Sans caps, +0.28em, 16px', sample: 'COMFYMIND' },
  { cls: 'type-display', name: 'Display', spec: 'Tenor caps +0.10em, clamp 28-44px. 8 words max, never running text', sample: 'Un lugar tranquilo para crear' },
  { cls: 'type-h1', name: 'Heading 1', spec: 'Tenor mixed case, 32-36px', sample: 'Buenas tardes, Alex' },
  { cls: 'type-h2', name: 'Heading 2', spec: 'Readex 600, 24px', sample: 'Tu obra está en camino' },
  { cls: 'type-h3', name: 'Heading 3', spec: 'Readex 600, 17px, sentence case: subsection headings, tile labels', sample: 'Versiones de esta sesión' },
  { cls: 'type-label', name: 'Museum label', spec: 'Tenor caps +0.14em, 17px. Only for museum labels and the date-leaf month', sample: 'Sin título' },
  { cls: 'type-body', name: 'Body', spec: 'Readex 400, 18px / 1.6, max 60ch', sample: 'Puedes tomarte el tiempo que necesites. No hay una manera correcta de crear.' },
  { cls: 'type-small', name: 'Small', spec: 'Readex 400, 15px, the minimum', sample: 'Marta puede ver lo que compartes.' },
  { cls: 'type-button', name: 'Button', spec: 'Readex 600, 18px, sentence case', sample: 'Entrar a la sesión' },
]
const spaces = [4, 8, 12, 16, 24, 32, 48, 64, 96]

const notice = ref(true)
const wayIn = ref<'words' | 'draw' | 'image' | null>('words')
const field = reactive({ text: '', pass: '', area: '' })
const versions = ['ComfyUI_00015_', 'simple_test_00145_', 'simple_test_00127_', 'simple_test_00211_'].map((k, i) => ({
  id: i + 1, src: resolveDemoImage(`${k}.jpg`), alt: '',
}))
const currentVersion = ref<number | null>(2)
const art = resolveDemoImage('ComfyUI_00015_.jpg')
const art2 = resolveDemoImage('simple_test_00160_.jpg')
const sessionDate = new Date()
const progress = ref(0.4)
const reflectionLog = ref('')
</script>

<template>
  <AppShell role="patient" :profile="false">
    <div class="flex flex-col gap-16 pb-16">
      <header class="flex flex-col gap-4">
        <h1 class="type-h1">Liminal Sanctuary: style guide</h1>
        <p class="type-body measure text-muted-foreground">
          Dusk outside, dawn inside. Tokens live in <code class="rounded-sm bg-secondary px-1.5">src/style.css</code>, components in
          <code class="rounded-sm bg-secondary px-1.5">src/components/sanctuary/</code>. Spec: <code class="rounded-sm bg-secondary px-1.5">docs/redesign/DESIGN.md</code>.
          Use the Comfort button above to try 125% / 150% text, motion off and the other modes: everything here must still work.
        </p>
        <nav aria-label="Sections" class="flex flex-wrap gap-2">
          <a v-for="s in ['colour', 'type', 'shape', 'atmosphere', 'components', 'modes']" :key="s" :href="`#${s}`"
             class="type-small inline-flex min-h-11 items-center rounded-control border-2 border-input bg-card px-4 font-semibold hover:bg-secondary">{{ s }}</a>
        </nav>
      </header>

      <!-- COLOUR -->
      <section id="colour" class="flex flex-col gap-8">
        <h2 class="type-h2">Colour</h2>
        <p class="type-body measure text-muted-foreground">
          Never hard-code a hex value. Tailwind classes: <code>bg-dawn-bg</code>, <code>text-dusk-text</code>, <code>border-dawn-border</code>.
          Mode-aware classes (<code>bg-background</code>, <code>text-foreground</code>, <code>bg-primary</code>, <code>text-link</code>, <code>text-danger</code>) follow
          the nearest <code>.dusk</code> container. Ratio shows the listed text/background pair.
        </p>
        <div v-for="g in groups" :key="g.title" class="flex flex-col gap-3">
          <h3 class="type-h3">{{ g.title }}</h3>
          <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="s in g.items" :key="s.token" class="flex items-stretch gap-3 rounded-card border-[1.5px] border-border bg-card p-3">
              <div
                class="flex size-16 shrink-0 items-center justify-center rounded-control border border-border font-display text-xl"
                :style="{ background: `var(${s.token})`, color: s.on ? `var(${s.on})` : 'inherit' }"
                aria-hidden="true"
              >Aa</div>
              <div class="min-w-0">
                <p class="type-small font-semibold">{{ s.token }}</p>
                <p class="type-small text-muted-foreground">{{ values[s.token] }}</p>
                <p class="type-small text-muted-foreground">{{ s.use }}</p>
                <p v-if="ratioOf(s.token, s.on) || ratioOf(s.on ?? '', s.token)" class="type-small font-semibold">
                  {{ (ratioOf(s.token, s.on) ?? 0).toFixed(1) }} : 1
                  <span class="ml-1 rounded-sm bg-secondary px-2 py-0.5">{{ grade(ratioOf(s.token, s.on)) }}</span>
                  <span class="sr-only"> contrast against {{ s.on }}</span>
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- TYPE -->
      <section id="type" class="flex flex-col gap-6">
        <h2 class="type-h2">Typography</h2>
        <p class="type-body measure text-muted-foreground">
          Tenor Sans caps only for the wordmark, the display line and museum labels; Readex Pro for everything people read, headings included. Use the <code>type-*</code> classes, or <code>font-display</code> /
          <code>font-body</code>, <code>text-body</code>, <code>text-small</code>. Sizes are rem, so Comfort text scaling works.
        </p>
        <div class="flex flex-col divide-y divide-border rounded-card border-[1.5px] border-border bg-card">
          <div v-for="r in typeRoles" :key="r.cls" class="grid gap-2 p-5 md:grid-cols-[14rem_1fr] md:gap-6">
            <div>
              <p class="type-small font-semibold">.{{ r.cls }}</p>
              <p class="type-small text-muted-foreground">{{ r.name }}: {{ r.spec }}</p>
            </div>
            <p :class="r.cls" class="min-w-0 break-words">{{ r.sample }}</p>
          </div>
        </div>
        <SCard class="flex flex-col gap-2">
          <p class="type-h3">Catalan and Spanish glyph check</p>
          <p class="type-h1" lang="ca">Col·legi, paral·lel, ŀl · ¿Qué? ¡Sí! «obra»</p>
          <p class="type-body" lang="ca">Col·legi, paral·lel, ŀl · ¿Qué? ¡Sí! «obra» · Ñandú, àèéíòóú ç</p>
          <p class="type-display" lang="ca">Col·legi · Ŀ · ¿Qué?</p>
        </SCard>
      </section>

      <!-- SHAPE -->
      <section id="shape" class="flex flex-col gap-6">
        <h2 class="type-h2">Space, shape, elevation, focus</h2>
        <div class="flex flex-col gap-3">
          <h3 class="type-h3">Spacing scale (px)</h3>
          <ul class="flex flex-col gap-2">
            <li v-for="(px, i) in spaces" :key="px" class="type-small flex items-center gap-4">
              <span class="w-24 font-semibold">{{ px }} px</span>
              <span class="h-4 rounded-sm bg-dawn-violet" :style="{ width: `${px}px` }" />
              <span class="text-muted-foreground">Tailwind step {{ [1, 2, 3, 4, 6, 8, 12, 16, 24][i] }}: <code>gap-{{ [1, 2, 3, 4, 6, 8, 12, 16, 24][i] }}</code></span>
            </li>
          </ul>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="flex flex-col gap-2"><div class="h-24 rounded-control border-2 border-input bg-card" /><p class="type-small"><code>rounded-control</code> 12px: inputs, buttons</p></div>
          <div class="flex flex-col gap-2"><div class="h-24 rounded-card border-[1.5px] border-border bg-card" /><p class="type-small"><code>rounded-card</code> 16px: cards</p></div>
          <div class="flex flex-col gap-2"><div class="h-24 rounded-pill border-2 border-transparent bg-primary" /><p class="type-small"><code>rounded-pill</code>: primary actions only</p></div>
          <div class="flex flex-col gap-2"><div class="niche h-24 border-2 border-input bg-card" /><p class="type-small"><code>.niche</code>: arch for featured art</p></div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-2"><div class="elev h-24 rounded-card bg-card" /><p class="type-small"><code>.elev</code> (dawn lift) / <code>shadow-lift</code>: floating panels only. Cards have no shadow.</p></div>
          <div class="flex flex-col gap-2"><div class="h-24 rounded-[2px] bg-dawn-surface shadow-hung" /><p class="type-small"><code>shadow-hung</code>: a frame on a wall. Artwork mats only.</p></div>
          <div class="dusk sky relative flex flex-col gap-2 overflow-hidden rounded-card p-4"><div class="elev h-16 rounded-card bg-card" /><p class="type-small"><code>.elev</code> inside <code>.dusk</code>: warm glow, no shadow</p></div>
        </div>
        <div class="flex flex-col gap-3">
          <h3 class="type-h3">Focus ring (tab to these)</h3>
          <div class="flex flex-wrap gap-3">
            <SButton variant="secondary">Focus me</SButton>
            <a href="#shape" class="type-body inline-flex min-h-11 items-center rounded-control px-3 font-semibold text-link underline underline-offset-4">A link</a>
            <p class="type-small text-muted-foreground">3 px ring, 3 px offset: violet at dawn, warm yellow at dusk. Never remove it.</p>
          </div>
        </div>
        <div class="flex flex-col gap-3">
          <h3 class="type-h3">Motion</h3>
          <p class="type-small measure text-muted-foreground">
            Dawn: 150 ms fades only (<code>--dur-fade</code>). Dusk: mist drift 40 s (<code>--dur-drift</code>), breathing sun 6 s (<code>--dur-breathe</code>).
            <code>prefers-reduced-motion</code> and Comfort &rarr; Motion off stop everything.
          </p>
        </div>
      </section>

      <!-- ATMOSPHERE -->
      <section id="atmosphere" class="flex flex-col gap-6">
        <h2 class="type-h2">Atmosphere utilities</h2>
        <p class="type-body measure text-muted-foreground">Pure CSS: the atrium at dusk. Layers go inside a <code>relative overflow-hidden</code> parent, back to front: <code>.sky</code> (sky, a 2px horizon line and a darker floor; height set by <code>--horizon</code>), <code>.mist</code> (low strata), <code>.sun-disc</code> (a crisp disc sitting on the horizon; <code>--sun-size</code>, <code>--sun-x</code>), <code>.dither</code> (4×4 Bayer overlay), <code>.grain</code>. Wall text sits directly on the upper sky, left-aligned. Use <code>.scrim</code> only behind forms.</p>
        <div class="dusk sky relative isolate flex min-h-80 items-start overflow-hidden rounded-card p-8 [--sun-x:72%]">
          <div class="mist" aria-hidden="true" /><div class="sun-disc is-breathing" aria-hidden="true" /><div class="dither" aria-hidden="true" /><div class="grain" aria-hidden="true" />
          <div class="relative z-10 max-w-md">
            <p class="type-display">Atrio</p>
            <p class="type-body mt-3">Wall text sits directly on the sky, no panel.</p>
          </div>
        </div>
        <div class="relative overflow-hidden rounded-card border-[1.5px] border-border bg-background p-8">
          <div class="dawn-glow absolute inset-x-0 top-0 h-48" aria-hidden="true" />
          <p class="type-h3 relative">.dawn-glow</p>
          <p class="type-small relative mb-4 text-muted-foreground">Warm glow at the top of working screens, then a flute rule:</p>
          <hr class="flute-rule relative" />
          <p class="type-small relative mt-4 text-muted-foreground"><code>.flute-rule</code> is three hairlines. Use it between sections.</p>
        </div>
      </section>

      <!-- COMPONENTS -->
      <section id="components" class="flex flex-col gap-12">
        <h2 class="type-h2">Components</h2>

        <div class="flex flex-col gap-4">
          <h3 class="type-h3">SButton</h3>
          <div class="flex flex-wrap items-center gap-3">
            <SButton>Crear</SButton>
            <SButton variant="secondary">Guardar en mis obras</SButton>
            <SButton variant="quiet">Anotar un pensamiento</SButton>
            <SButton variant="danger">Finalizar sesión</SButton>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <SButton size="compact">Compact 44px</SButton>
            <SButton size="compact" variant="secondary">Compact</SButton>
            <SButton disabled>Disabled</SButton>
            <SButton busy>Busy</SButton>
            <SButton to="/home" variant="secondary"><template #icon><ArrowRight aria-hidden="true" /></template>As router-link</SButton>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="type-h3">SField</h3>
          <div class="grid gap-6 md:grid-cols-2">
            <SField v-model="field.text" label="Correo electrónico" type="email" help="Lo usamos solo para entrar." autocomplete="email" />
            <SField v-model="field.pass" label="Contraseña" type="password" autocomplete="current-password" />
            <SField v-model="field.text" label="Con error" type="email" error="Escribe un correo válido, por ejemplo nombre@ejemplo.com." />
            <SField v-model="field.area" label="Tu nota" type="textarea" optional />
            <SField label="Desactivado" disabled model-value="No editable" />
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="type-h3">SNotice (persistent, dismissible)</h3>
          <div class="flex flex-col gap-3">
            <SNotice tone="info">Marta puede ver lo que compartes.</SNotice>
            <SNotice tone="success" title="Obra guardada" dismissible>Está en Mis obras.</SNotice>
            <SNotice tone="warning" title="Tu sesión termina pronto">Puedes seguir creando hasta el final.</SNotice>
            <SNotice v-if="notice" tone="danger" title="No hemos podido crear la obra esta vez" dismissible @dismiss="notice = false">Puedes probar de nuevo cuando quieras.</SNotice>
            <SButton v-else size="compact" variant="secondary" @click="notice = true">Show the dismissed notice again</SButton>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="type-h3">SCard</h3>
          <div class="grid gap-4 md:grid-cols-3">
            <SCard><p class="type-h2">Normal</p><p class="type-small mt-2 text-muted-foreground">One card, one thing. No shadow.</p></SCard>
            <SCard selected><p class="type-h2">Selected</p><p class="type-small mt-2 text-muted-foreground">2px ring outline.</p></SCard>
            <SCard raised padding="lg"><p class="type-h2">Raised, lg</p><p class="type-small mt-2 text-muted-foreground">Optional soft lift (<code>raised</code>).</p></SCard>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="type-h3">ArtworkMount + MuseumLabel</h3>
          <p class="type-small measure text-muted-foreground">A square-cornered white museum mat with a hung shadow, not a card. <code>niche</code> adds the arch.</p>
          <div class="grid items-start gap-8 md:grid-cols-3">
            <ArtworkMount :src="art" title="Bosque al amanecer" :technique="t('art.technique.words')" :date="sessionDate" made-by="Alex" niche mat="lg" ratio="4 / 5" />
            <ArtworkMount :src="art2" :technique="t('art.technique.sketch')" :date="sessionDate" made-by="Alex" mat="md" ratio="4 / 3" />
            <div class="flex flex-col gap-6">
              <ArtworkMount :src="art" title="Mat sm, no label" mat="sm" ratio="16 / 9" :label="false" />
              <MuseumLabel title="Solo la etiqueta" :technique="t('art.technique.image')" :date="sessionDate" made-by="Alex" />
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="type-h3">SessionCard</h3>
          <div class="flex flex-col gap-3">
            <SessionCard :date="sessionDate" time="17:00 – 18:00" therapist="Marta Soler" status="now">
              <template #action><SButton>{{ t('session.enter') }}</SButton></template>
            </SessionCard>
            <SessionCard :date="sessionDate" therapist="Marta Soler" status="today"><template #action><SButton variant="secondary" size="compact">Ver detalles</SButton></template></SessionCard>
            <SessionCard :date="new Date(Date.now() + 86400000 * 3)" time="11:30" therapist="Marta Soler" status="next" />
          </div>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="type-h3">WayInPicker (v-model: {{ wayIn }})</h3>
          <WayInPicker v-model="wayIn" />
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="type-h3">CalmProgress</h3>
          <div class="grid gap-4 md:grid-cols-2">
            <CalmProgress :progress="progress">
              <template #actions><SButton variant="secondary" size="compact" @click="progress = progress >= 1 ? 0.1 : Math.min(1, progress + 0.3)">+30% (demo)</SButton></template>
            </CalmProgress>
            <CalmProgress status="Tu obra está en camino" hint="Indeterminate: no promised time." />
          </div>
        </div>

        <div class="grid gap-10 md:grid-cols-2">
          <div class="flex flex-col gap-4">
            <h3 class="type-h3">ReflectionPrompt</h3>
            <SCard><ReflectionPrompt @save="reflectionLog = `saved: ${$event}`" @skip="reflectionLog = 'skipped'" /></SCard>
            <p class="type-small text-muted-foreground" aria-live="polite">Event: {{ reflectionLog || 'none yet' }}</p>
          </div>
          <div class="flex flex-col gap-8">
            <VersionsStrip v-model="currentVersion" :versions="versions" />
            <div class="flex flex-col gap-3">
              <h3 class="type-h3">DemoTag</h3>
              <div><DemoTag /></div>
              <p class="type-small text-muted-foreground">AppShell shows it automatically in demo mode.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- MODES -->
      <section id="modes" class="flex flex-col gap-6">
        <h2 class="type-h2">Dusk and dawn, side by side</h2>
        <p class="type-body measure text-muted-foreground">
          <code>&lt;DuskLayout&gt;</code> is a full-screen threshold layout:
          <RouterLink to="/design/dusk" class="font-semibold text-link underline underline-offset-4">see it live</RouterLink>.
        </p>
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="bg-background flex flex-col gap-4 rounded-card border-[1.5px] border-border p-6 text-foreground">
            <p class="type-h3">Dawn</p>
            <p class="type-h1">Buenas tardes, Alex</p>
            <p class="type-body">Tu sesión con Marta ya está lista.</p>
            <div class="flex flex-wrap gap-3"><SButton><template #icon><Check aria-hidden="true" /></template>Entrar</SButton><SButton variant="secondary">Más tarde</SButton></div>
            <SNotice tone="success">Obra guardada.</SNotice>
            <SField label="Nombre" model-value="Alex" />
          </div>
          <div class="dusk sky relative isolate flex flex-col gap-4 overflow-hidden rounded-card p-6">
            <div class="mist" aria-hidden="true" /><div class="sun-disc" aria-hidden="true" /><div class="dither" aria-hidden="true" /><div class="grain" aria-hidden="true" />
            <div class="scrim relative z-10 flex flex-col gap-4 p-5">
              <p class="type-h3">Dusk</p>
              <p class="type-display">Un lugar tranquilo para crear</p>
              <p class="type-body">Aquí puedes tomarte el tiempo que necesites.</p>
              <div class="flex flex-wrap gap-3"><SButton><template #icon><Check aria-hidden="true" /></template>Comenzar</SButton><SButton variant="secondary">Soy terapeuta</SButton></div>
              <SNotice tone="success">Obra guardada.</SNotice>
              <SField label="Nombre" model-value="Alex" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </AppShell>
</template>
