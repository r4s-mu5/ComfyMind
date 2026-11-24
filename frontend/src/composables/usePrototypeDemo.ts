import { computed } from 'vue'
import { isDemo as demoFlag } from '@/lib/demo/isDemo'

// Demo mode is global (build flag, legacy dev-preview flag or ?demo=1 remembered for the tab),
// so it no longer needs to be carried in the query string.
export const usePrototypeDemo = () => {
  const isDemo = computed(() => demoFlag)
  const locationWithDemo = (path: string) => ({ path })

  return { isDemo, locationWithDemo }
}
