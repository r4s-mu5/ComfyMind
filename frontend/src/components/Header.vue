<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { Home, Image, Menu, Palette, UserRound } from 'lucide-vue-next'
import { userService } from '../api/userService'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import LanguageSelector from './LanguageSelector.vue'
import ProfileDropdown from './ProfileDropdown.vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const route = useRoute()
const user = ref<any>(null)
const mobileOpen = ref(false)
const { isDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()

onMounted(async () => {
  if (isDemo.value) {
    user.value = { full_name: 'Alex', type: 'patient' }
    return
  }
  try {
    user.value = await userService.getCurrentUser()
  } catch {
    user.value = null
  }
})

const isPatient = computed(() => isDemo.value || user.value?.type !== 'therapist')
const query = computed(() => isDemo.value ? { demo: '1' } : {})
const navItems = computed(() => isPatient.value
  ? [
      { label: t('nav.home'), path: '/home', icon: Home },
      { label: t('nav.session'), path: '/generation', icon: Palette },
      { label: t('nav.artwork'), path: '/freeimages', icon: Image },
    ]
  : [
      { label: t('nav.home'), path: '/home', icon: Home },
      { label: 'Calendario', path: '/calendar', icon: Image },
    ])

const isActive = (path: string) => {
  if (path === '/generation') return route.path === '/generation' || route.path.includes('/patient')
  if (path === '/freeimages') return route.path === '/freeimages' || /^\/session\/\d+$/.test(route.path)
  return route.path === path || route.path === `${path}/`
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="sticky top-0 z-40 border-b border-border/80 bg-white/95 backdrop-blur">
      <div class="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Sheet v-model:open="mobileOpen">
          <SheetTrigger as-child>
            <Button variant="outline" size="icon-lg" class="rounded-xl lg:hidden" :aria-label="t('nav.menu')">
              <Menu aria-hidden="true" class="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" class="w-80 p-5">
            <SheetHeader class="text-left">
              <SheetTitle class="flex items-center gap-3">
                <img src="/logo_comfymind.svg" alt="" class="size-10" /> ComfyMind
              </SheetTitle>
              <SheetDescription>{{ t('nav.main') }}</SheetDescription>
            </SheetHeader>
            <nav class="mt-8 grid gap-2" :aria-label="t('nav.main')">
              <RouterLink
                v-for="item in navItems"
                :key="item.path"
                :to="{ path: item.path, query }"
                class="flex min-h-12 items-center gap-3 rounded-xl px-4 font-semibold text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                :class="isActive(item.path) && 'bg-secondary text-secondary-foreground'"
                @click="mobileOpen = false"
              >
                <component :is="item.icon" aria-hidden="true" class="size-5" />
                {{ item.label }}
              </RouterLink>
            </nav>
          </SheetContent>
        </Sheet>

        <RouterLink :to="{ path: '/home', query }" class="flex items-center gap-3 rounded-lg" aria-label="ComfyMind">
          <img src="/logo_comfymind.svg" alt="" class="size-11" />
          <span class="hidden text-2xl font-extrabold tracking-tight text-[#17302d] sm:block">ComfyMind</span>
        </RouterLink>

        <nav class="ml-8 hidden items-center gap-1 lg:flex" :aria-label="t('nav.main')">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="{ path: item.path, query }"
            class="flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            :class="isActive(item.path) && 'bg-secondary text-secondary-foreground'"
          >
            <component :is="item.icon" aria-hidden="true" class="size-4" />
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="ml-auto flex items-center gap-2 sm:gap-3">
          <div class="hidden sm:block"><LanguageSelector /></div>
          <ProfileDropdown>
            <Button variant="outline" size="icon-lg" class="rounded-xl" :aria-label="t('profile.label')">
              <Avatar class="size-8">
                <AvatarFallback class="bg-secondary text-secondary-foreground">
                  <UserRound aria-hidden="true" class="size-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </ProfileDropdown>
        </div>
      </div>
      <div class="border-t border-border/70 px-4 py-2 sm:hidden">
        <LanguageSelector />
      </div>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
