import { computed } from 'vue'
import { useRoute } from 'vue-router'

export const usePrototypeDemo = () => {
  const route = useRoute()
  const isDemo = computed(() => route.query.demo === '1')
  const locationWithDemo = (path: string) => isDemo.value
    ? { path, query: { demo: '1' } }
    : { path }

  return { isDemo, locationWithDemo }
}
