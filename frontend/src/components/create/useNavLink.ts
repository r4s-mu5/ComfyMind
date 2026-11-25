import { useRouter } from 'vue-router'

/**
 * Props for an SButton that navigates: a real <a> with a working href (keyboard-focusable, opens in a
 * new tab) and client-side routing on click. Use as <SButton v-bind="nav('/home')">.
 * Deprecated: SButton's own `to` now renders a RouterLink with a real href, so prefer
 * <SButton to="/home">. The Taller no longer uses this; HomeView still does (delete this file once it moves).
 */
export const useNavLink = () => {
  const router = useRouter()
  return (path: string) => ({
    as: 'a',
    href: router.resolve(path).href,
    onClick: (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return
      e.preventDefault()
      router.push(path)
    },
  })
}
