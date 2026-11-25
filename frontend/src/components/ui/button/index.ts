import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

// Restyled to the sanctuary look (DESIGN.md §4.5, VC4 §3.2): square-cut, 2px radius, the global 3px focus ring
// (no shadcn ring-offset), targets >= 44px. Prefer SButton in new code; this keeps stock dialogs on-brand.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-control border-2 border-transparent text-base font-semibold leading-tight transition-colors disabled:pointer-events-none disabled:border-dashed disabled:border-input disabled:bg-secondary disabled:text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5 shrink-0 [&_svg]:shrink-0 aria-invalid:border-danger",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover",
        destructive:
          "bg-danger text-danger-foreground hover:bg-danger/90",
        outline:
          "border-input bg-transparent text-foreground hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "text-foreground hover:bg-secondary",
        link: "rounded-none border-0 px-1 text-link underline decoration-1 underline-offset-[6px] hover:decoration-2",
      },
      size: {
        "default": "min-h-12 px-6 py-2",
        "sm": "min-h-11 px-4",
        "lg": "min-h-14 px-7 text-lg",
        "icon": "size-12",
        "icon-sm": "size-11",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)
export type ButtonVariants = VariantProps<typeof buttonVariants>
