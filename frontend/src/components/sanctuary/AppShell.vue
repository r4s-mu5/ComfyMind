<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useSlots } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { UserRound } from 'lucide-vue-next'
import { userService } from '@/api/userService'
import { isDemo } from '@/lib/demo/isDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import LanguageSelector from '@/components/LanguageSelector.vue'
import ProfileDropdown from '@/components/ProfileDropdown.vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import ComfortPanel from './ComfortPanel.vue'
import DemoTag from './DemoTag.vue'
import SButton from './SButton.vue'

/**
 * Dawn page for working screens: warm glow on top, header on a solid background with a flute rule
 * (COMFYMIND wordmark, text-only role-based nav with the current page underlined + aria-current,
 * Comfort, language, profile, Demo tag), content up to 1120px and an optional collapsible right panel.
 *
 * Slots
 *   default  page content (rendered inside <main id="main">)
 *   aside    optional right side panel (chat, later the chatbot). It carries its own "Ocultar panel" button;
 *            when closed, a slim "Mostrar panel" tab takes its place at the right edge.
 *
 * Props
 *   role     'patient' | 'therapist'. If omitted it is read from the logged-in user.
 *   profile  false hides the profile menu and skips the user request (public pages such as /design).
 */
interface Props {
  role?: 'patient' | 'therapist'
  profile?: boolean
}
const props = withDefaults(defineProps<Props>(), { profile: true })
const asideOpen = defineModel<boolean>('asideOpen', { default: true })

const route = useRoute()
const { t } = usePrototypeLocale()
const userType = ref<string | null>(null)

onMounted(async () => {
  if (props.role || !props.profile) return
  try {
    userType.value = (await userService.getCurrentUser())?.type ?? null
  } catch {
    userType.value = null
  }
})

// 1120px content column; with a side panel the page grows by the panel width (22rem) and a 24px gap.
const slots = useSlots()
const wrapWidth = computed(() => (slots.aside ? 'max-w-[calc(1120px+24px+22rem)]' : 'max-w-[1120px]'))

const isTherapist = computed(() => (props.role ?? userType.value) === 'therapist')

interface NavItem { label: string; path?: string; help?: boolean }
// Nav per DESIGN.md §6. "Usuarios" (therapist) has no route yet: add it here when the screen exists.
const navItems = computed<NavItem[]>(() =>
  isTherapist.value
    ? [
        { label: t('nav.today'), path: '/home' },
        { label: t('nav.calendar'), path: '/calendar' },
      ]
    : [
        { label: t('nav.home'), path: '/home' },
        { label: t('nav.artwork'), path: '/freeimages' },
        { label: t('nav.help'), help: true },
      ],
)

const isActive = (path?: string) => {
  if (!path) return false
  if (path === '/freeimages') return route.path.startsWith('/freeimages') || /^\/session\/\d+\/?$/.test(route.path)
  return route.path === path || route.path === `${path}/`
}

const skipToMain = () => document.getElementById('main')?.focus()

// The panel toggle lives with the panel (not in the header). Focus follows the control that replaces it.
const setAside = async (open: boolean) => {
  asideOpen.value = open
  await nextTick()
  document.getElementById(open ? 'shell-panel-hide' : 'shell-panel-show')?.focus()
}

const navClass = (active: boolean) => [
  'type-small inline-flex min-h-11 items-center border-b-[3px] px-3 transition-colors hover:text-foreground',
  active ? 'border-foreground font-bold text-foreground' : 'border-transparent font-medium text-muted-foreground',
]
</script>

<template>
  <div class="relative isolate min-h-screen bg-background text-foreground">
    <div class="dawn-glow absolute inset-x-0 top-0 -z-10 h-[360px]" aria-hidden="true" />
    <div class="atmo-layer absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div class="mist opacity-25" />
    </div>

    <a
      href="#main"
      class="type-small absolute left-4 top-2 z-50 -translate-y-20 rounded-control bg-primary px-4 py-3 font-semibold text-primary-foreground focus:translate-y-0"
      @click.prevent="skipToMain"
    >
      {{ t('shell.skip') }}
    </a>

    <!-- Sticky at 100 %; static at 125 % and 150 % (style.css), so a taller header never covers the page. -->
    <header class="shell-header sticky top-0 z-40 bg-background">
      <!-- Container query in rem: the nav joins the first row only when there is room for it at the current text size. -->
      <div :class="[wrapWidth, '@container mx-auto flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6']">
        <RouterLink
          to="/home"
          class="type-wordmark rounded-control py-2 text-mark"
          :aria-label="t('shell.wordmark')"
        >
          {{ t('shell.wordmark') }}
        </RouterLink>

        <nav class="order-last flex w-full flex-wrap gap-1 p-1 @min-[56rem]:order-none @min-[56rem]:w-auto" :aria-label="t('nav.main')">
          <template v-for="item in navItems" :key="item.label">
            <Popover v-if="item.help">
              <PopoverTrigger as-child>
                <button type="button" :class="navClass(false)">
                  {{ item.label }}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" class="w-[min(22rem,calc(100vw-2rem))] rounded-card border-2 border-input p-5">
                <p class="type-h3 mb-2">{{ t('help.title') }}</p>
                <p class="type-small text-muted-foreground">{{ t('help.body') }}</p>
              </PopoverContent>
            </Popover>
            <RouterLink v-else :to="item.path!" :class="navClass(isActive(item.path))" :aria-current="isActive(item.path) ? 'page' : undefined">
              {{ item.label }}
            </RouterLink>
          </template>
        </nav>

        <div class="ml-auto flex flex-wrap items-center justify-end gap-2">
          <DemoTag v-if="isDemo" />
          <LanguageSelector />
          <ComfortPanel />
          <ProfileDropdown v-if="profile">
            <SButton variant="secondary" size="compact" :aria-label="t('profile.label')">
              <template #icon><UserRound aria-hidden="true" /></template>
              <span class="hidden 2xl:inline">{{ t('profile.label') }}</span>
            </SButton>
          </ProfileDropdown>
        </div>
      </div>
      <hr class="flute-rule" />
    </header>

    <div :class="[wrapWidth, 'shell-row mx-auto flex flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-start']">
      <main id="main" tabindex="-1" class="min-w-0 max-w-[1120px] flex-1 outline-none">
        <slot />
      </main>
      <aside
        v-if="$slots.aside"
        v-show="asideOpen"
        id="shell-aside"
        class="shell-aside flex w-full shrink-0 flex-col gap-2 lg:sticky lg:top-24 lg:w-[22rem]"
      >
        <SButton
          id="shell-panel-hide"
          variant="quiet"
          size="compact"
          class="self-end"
          aria-controls="shell-aside"
          :aria-expanded="true"
          @click="setAside(false)"
        >
          {{ t('shell.panelHide') }}
        </SButton>
        <slot name="aside" />
      </aside>
      <div v-if="$slots.aside && !asideOpen" class="shell-aside-tab flex shrink-0 justify-end lg:sticky lg:top-24">
        <SButton
          id="shell-panel-show"
          variant="secondary"
          size="compact"
          aria-controls="shell-aside"
          :aria-expanded="false"
          @click="setAside(true)"
        >
          {{ t('shell.panelShow') }}
        </SButton>
      </div>
    </div>
  </div>
</template>
