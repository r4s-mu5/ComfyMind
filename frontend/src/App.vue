<template>
  <div id="app" class="font-sans text-foreground">
    <AppShell v-if="showHeader">
      <router-view />
    </AppShell>

    <div v-else>
      <router-view />
    </div>

    <!-- Toasts: bottom-left, 12 s, paused on hover and focus, errors stay until closed (ui/sonner). -->
    <Toaster position="bottom-left" :duration="12000" close-button expand />

    <!-- AlertDialog global para sesión expirada -->
    <AlertDialog :open="sessionExpiredDialog" @update:open="(val) => sessionExpiredDialog = val">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ t('global.sessionExpired') }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ t('global.sessionExpiredDescription') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div class="flex justify-end">
          <AlertDialogAction @click="handleSessionExpired">
            {{ t('global.loginAgain') }}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { sessionExpiredDialog } from '@/plugins/axios'
import { userService } from '@/api/userService'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'

import AppShell from './components/sanctuary/AppShell.vue'

const route = useRoute()
const router = useRouter()
const { t } = usePrototypeLocale()
const { locationWithDemo } = usePrototypeDemo()
const showHeader = computed(() => !route.meta.hideHeader)

const handleSessionExpired = () => {
  sessionExpiredDialog.value = false
  userService.logout()
  router.push(locationWithDemo('/login'))
}

document.title = 'ComfyMind'
</script>

<style>
html, body {
  overscroll-behavior: none;
}
</style>
