<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import { userService } from '../api/userService'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

const initials = computed(() => displayUser.value?.full_name
  ?.split(/\s+/)
  .map((part: string) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase() || 'CM')

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
    <DropdownMenuContent class="w-72 rounded-card p-2" align="end">
      <DropdownMenuLabel class="flex items-center gap-3 px-3 py-3 font-normal">
        <Avatar class="size-11 bg-secondary">
          <AvatarFallback class="bg-secondary font-bold text-secondary-foreground">{{ initials }}</AvatarFallback>
        </Avatar>
        <div class="min-w-0">
          <p class="truncate font-bold text-foreground">{{ displayUser?.full_name || t('profile.label') }}</p>
          <p class="type-small truncate text-muted-foreground">{{ displayUser?.email }}</p>
          <p v-if="displayUser?.type === 'therapist'" class="type-small mt-0.5 font-semibold text-link">{{ t('profile.roleTherapist') }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="min-h-11 cursor-pointer rounded-control px-3 text-base text-danger" @click="logout">
        <LogOut aria-hidden="true" class="size-5" />
        {{ t('profile.logout') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
