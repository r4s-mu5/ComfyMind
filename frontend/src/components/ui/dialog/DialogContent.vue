<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"
import { usePrototypeLocale } from "@/composables/usePrototypeLocale"
import DialogOverlay from "./DialogOverlay.vue"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DialogContentProps & { class?: HTMLAttributes["class"], showCloseButton?: boolean }>(), {
  showCloseButton: true,
})
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, "class")

const forwarded = useForwardPropsEmits(delegatedProps, emits)
const { t } = usePrototypeLocale()
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-card text-card-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-none border-[1.5px] border-input p-8 shadow-[var(--overlay-shadow)] duration-200 sm:max-w-lg [&>[data-slot=dialog-header]]:pr-24',
          props.class,
        )"
    >
      <slot />

      <!-- A text close button (quiet: underlined, no box), never an icon-only X. -->
      <DialogClose
        v-if="showCloseButton"
        data-slot="dialog-close"
        class="type-small absolute top-5 right-7 inline-flex min-h-12 items-center px-1 font-semibold text-foreground underline decoration-1 underline-offset-[6px] hover:decoration-2 disabled:pointer-events-none"
      >
        {{ t('dialog.close') }}
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
