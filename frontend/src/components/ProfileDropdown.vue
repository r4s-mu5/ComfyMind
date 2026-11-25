<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import { userService } from '../api/userService'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const user = ref<any>(null)
const router = useRouter()
const { locationWithDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()

const displayUser = computed(() => user.value)

onMounted(async () => {
  try {
    user.value = await userService.getCurrentUser()
  } catch {
    user.value = null
  }
})

const logout = () => {
  userService.logout()
  router.push(locationWithDemo('/login'))
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-72 p-2" align="end">
      <DropdownMenuLabel class="px-3 py-3 font-normal">
        <div class="min-w-0">
          <p class="truncate font-bold text-foreground">{{ displayUser?.full_name || t('profile.label') }}</p>
          <p class="type-small truncate text-muted-foreground">{{ displayUser?.email }}</p>
          <p v-if="displayUser?.type === 'therapist'" class="type-small mt-0.5 font-semibold text-link">{{ t('profile.roleTherapist') }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="min-h-12 cursor-pointer rounded-none px-3 text-base font-semibold text-danger" @click="logout">
        <LogOut aria-hidden="true" class="size-5" />
        {{ t('profile.logout') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
