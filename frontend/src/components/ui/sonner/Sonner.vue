<script lang="ts">
import { toast } from "vue-sonner"

// Errors never auto-close (DESIGN.md §9): the person dismisses them with "Cerrar".
const baseError = toast.error
toast.error = ((message, data) => baseError(message, { ...data, duration: Number.POSITIVE_INFINITY })) as typeof toast.error
</script>

<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { computed } from "vue"
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-vue-next"
import { Toaster as Sonner } from "vue-sonner"
import { cn } from "@/lib/utils"
import { usePrototypeLocale } from "@/composables/usePrototypeLocale"

/**
 * Toasts in the SNotice look: a square mat with a 2px border in the tone colour on all four sides, a tone
 * icon, 18px text and a text "Cerrar" button. Paused while hovered or focused (focus is forwarded to the
 * same pause sonner uses for hover). Unstyled sonner, so no stock radius, shadow or rich colours.
 */
const props = defineProps<ToasterProps>()
const { t } = usePrototypeLocale()

const toastOptions = computed(() => ({
  unstyled: true,
  closeButtonAriaLabel: t("dialog.close"),
  ...props.toastOptions,
  classes: {
    toast: "font-body flex w-[var(--width)] items-start gap-4 rounded-none border-2 border-input bg-card p-4 pr-3 text-card-foreground shadow-[var(--overlay-shadow)]",
    success: "border-success",
    info: "border-link",
    warning: "border-warning",
    error: "border-danger",
    icon: "mt-0.5 shrink-0",
    content: "flex min-w-0 flex-1 flex-col gap-1",
    title: "type-body font-semibold",
    description: "type-body text-muted-foreground",
    closeButton: "type-small order-last -my-2 inline-flex min-h-12 shrink-0 items-center px-1 font-semibold text-foreground underline decoration-1 underline-offset-[6px] hover:decoration-2",
    actionButton: "type-small inline-flex min-h-12 shrink-0 items-center rounded-control border-2 border-input px-4 font-semibold",
    cancelButton: "type-small inline-flex min-h-12 shrink-0 items-center px-1 font-semibold underline underline-offset-[6px]",
    ...props.toastOptions?.classes,
  },
}))

// Sonner pauses on mouseenter; send the same signal when keyboard focus enters the list, and release on leave.
const forward = (type: "mouseenter" | "mouseleave") => (e: FocusEvent) => {
  const list = e.currentTarget as HTMLElement
  if (type === "mouseleave" && list.contains(e.relatedTarget as Node)) return
  list.dispatchEvent(new MouseEvent(type))
}
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    v-bind="props"
    :toast-options="toastOptions"
    :style="{ '--width': 'min(26rem, calc(100vw - 2rem))', ...(props.style as object) }"
    @focusin="forward('mouseenter')($event)"
    @focusout="forward('mouseleave')($event)"
  >
    <template #success-icon>
      <CircleCheckIcon aria-hidden="true" class="size-6 text-success" />
    </template>
    <template #info-icon>
      <InfoIcon aria-hidden="true" class="size-6 text-link" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon aria-hidden="true" class="size-6 text-warning" />
    </template>
    <template #error-icon>
      <OctagonXIcon aria-hidden="true" class="size-6 text-danger" />
    </template>
    <template #loading-icon>
      <Loader2Icon aria-hidden="true" class="size-6 animate-spin" />
    </template>
    <template #close-icon>
      {{ t("dialog.close") }}
    </template>
  </Sonner>
</template>
