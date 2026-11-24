<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { Button } from '@/components/ui/button'
import { usePrototypeDemo } from '@/composables/usePrototypeDemo'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

const welcomeRoot = ref<HTMLElement | null>(null)
const router = useRouter()
const { locationWithDemo } = usePrototypeDemo()
const { t } = usePrototypeLocale()

let animationFrame: number | null = null
let pendingX = 0
let pendingY = 0
let reducedMotion: MediaQueryList | null = null
let narrowViewport: MediaQueryList | null = null

const interactiveSelector = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[role="menu"]',
  '[role="menuitem"]',
  '[role="listbox"]',
  '[role="option"]',
  '[role="dialog"]',
].join(',')

const openOverlaySelector = [
  '[role="menu"][data-state="open"]',
  '[role="listbox"][data-state="open"]',
  '[role="dialog"]',
  '[aria-modal="true"]',
].join(',')

const goToLogin = () => router.push(locationWithDemo('/login'))

const setMistOffsets = (x: number, y: number) => {
  const root = welcomeRoot.value
  if (!root) return

  const depths = narrowViewport?.matches ? [2, 4, 6] : [6, 12, 18]
  const layerNames = ['far', 'middle', 'near']

  layerNames.forEach((layer, index) => {
    root.style.setProperty(`--mist-${layer}-x`, `${(x * depths[index]).toFixed(2)}px`)
    root.style.setProperty(`--mist-${layer}-y`, `${(y * depths[index]).toFixed(2)}px`)
  })
}

const applyPointerPosition = () => {
  animationFrame = null
  if (reducedMotion?.matches) {
    pendingX = 0
    pendingY = 0
    setMistOffsets(0, 0)
    return
  }
  setMistOffsets(pendingX, pendingY)
}

const queuePointerPosition = (x: number, y: number) => {
  pendingX = x
  pendingY = y
  if (animationFrame === null) animationFrame = window.requestAnimationFrame(applyPointerPosition)
}

const handlePointerMove = (event: PointerEvent) => {
  const root = welcomeRoot.value
  if (!root || event.pointerType === 'touch' || reducedMotion?.matches) return

  const bounds = root.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return

  const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2))
  const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2))
  queuePointerPosition(x, y)
}

const resetPointerPosition = () => queuePointerPosition(0, 0)

const handleMotionPreferenceChange = () => {
  if (reducedMotion?.matches) resetPointerPosition()
}

const handleEnter = (event: KeyboardEvent) => {
  if (
    event.key !== 'Enter'
    || event.defaultPrevented
    || event.repeat
    || event.isComposing
    || event.altKey
    || event.ctrlKey
    || event.metaKey
    || event.shiftKey
  ) return

  const target = event.target
  if (target instanceof Element && target.closest(interactiveSelector)) return
  if (document.querySelector(openOverlaySelector)) return

  event.preventDefault()
  goToLogin()
}

onMounted(() => {
  const root = welcomeRoot.value
  if (!root) return

  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  narrowViewport = window.matchMedia('(max-width: 640px)')

  root.addEventListener('pointermove', handlePointerMove, { passive: true })
  root.addEventListener('pointerleave', resetPointerPosition)
  reducedMotion.addEventListener('change', handleMotionPreferenceChange)
  window.addEventListener('keydown', handleEnter)
})

onBeforeUnmount(() => {
  const root = welcomeRoot.value
  root?.removeEventListener('pointermove', handlePointerMove)
  root?.removeEventListener('pointerleave', resetPointerPosition)
  reducedMotion?.removeEventListener('change', handleMotionPreferenceChange)
  window.removeEventListener('keydown', handleEnter)

  if (animationFrame !== null) window.cancelAnimationFrame(animationFrame)
})
</script>

<template>
  <main ref="welcomeRoot" class="welcome-screen">
    <div class="welcome-atmosphere" aria-hidden="true">
      <div class="welcome-mist welcome-mist-far" />
      <div class="welcome-mist welcome-mist-middle" />
      <div class="welcome-mist welcome-mist-near" />
    </div>

    <div class="welcome-layout">
      <div class="welcome-toolbar">
        <LanguageSelector />
      </div>

      <section class="welcome-content" aria-labelledby="welcome-heading">
        <p class="welcome-brand">ComfyMind</p>
        <h1 id="welcome-heading">{{ t('welcome.heading') }}</h1>
        <p class="welcome-copy">{{ t('welcome.description') }}</p>

        <div class="welcome-actions">
          <Button type="button" class="welcome-primary" @click="goToLogin">
            {{ t('welcome.begin') }}
          </Button>
          <Button type="button" variant="outline" class="welcome-secondary" @click="goToLogin">
            {{ t('welcome.skip') }}
          </Button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.welcome-screen {
  --mist-far-x: 0px;
  --mist-far-y: 0px;
  --mist-middle-x: 0px;
  --mist-middle-y: 0px;
  --mist-near-x: 0px;
  --mist-near-y: 0px;
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow-x: hidden;
  isolation: isolate;
  color: #f7f7fa;
  background:
    radial-gradient(ellipse at 88% 10%, rgba(231, 205, 186, 0.3) 0%, rgba(231, 205, 186, 0) 34%),
    radial-gradient(ellipse at 18% 18%, rgba(53, 103, 113, 0.72) 0%, rgba(53, 103, 113, 0) 43%),
    radial-gradient(ellipse at 72% 76%, rgba(117, 108, 141, 0.54) 0%, rgba(117, 108, 141, 0) 46%),
    linear-gradient(145deg, #101827 0%, #172d3a 48%, #413f59 100%);
}

.welcome-atmosphere {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.welcome-mist {
  position: absolute;
  border-radius: 999px;
  filter: blur(18px);
  will-change: transform;
  transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.welcome-mist-far {
  top: 5%;
  left: -12%;
  width: 66vw;
  height: 24vw;
  min-height: 11rem;
  opacity: 0.32;
  background:
    radial-gradient(ellipse at 26% 54%, rgba(246, 244, 247, 0.9) 0%, rgba(165, 154, 175, 0.48) 28%, transparent 58%),
    radial-gradient(ellipse at 72% 42%, rgba(184, 211, 211, 0.66) 0%, rgba(91, 88, 117, 0.28) 32%, transparent 62%);
  transform: translate3d(var(--mist-far-x), var(--mist-far-y), 0);
}

.welcome-mist-middle {
  top: 20%;
  right: -22%;
  width: 72vw;
  height: 30vw;
  min-height: 14rem;
  opacity: 0.36;
  background:
    radial-gradient(ellipse at 30% 48%, rgba(246, 244, 247, 0.88) 0%, rgba(165, 154, 175, 0.46) 30%, transparent 60%),
    radial-gradient(ellipse at 74% 58%, rgba(231, 205, 186, 0.58) 0%, rgba(117, 108, 141, 0.32) 32%, transparent 64%);
  transform: translate3d(var(--mist-middle-x), var(--mist-middle-y), 0);
}

.welcome-mist-near {
  right: -12%;
  bottom: -13%;
  width: 88vw;
  height: 34vw;
  min-height: 17rem;
  opacity: 0.46;
  filter: blur(14px);
  background:
    radial-gradient(ellipse at 24% 50%, rgba(246, 244, 247, 0.92) 0%, rgba(231, 205, 186, 0.46) 30%, transparent 60%),
    radial-gradient(ellipse at 68% 42%, rgba(201, 216, 218, 0.72) 0%, rgba(117, 108, 141, 0.34) 34%, transparent 66%);
  transform: translate3d(var(--mist-near-x), var(--mist-near-y), 0);
}

.welcome-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: inherit;
  width: min(100%, 82rem);
  margin-inline: auto;
  padding: 1.5rem clamp(1rem, 4vw, 4rem) 3rem;
}

.welcome-toolbar {
  display: flex;
  justify-content: flex-end;
}

.welcome-toolbar :deep(.language-selector) {
  border-color: rgba(255, 255, 255, 0.68);
  background: rgba(247, 247, 250, 0.95);
  color: #172d3a;
}

.welcome-toolbar :deep(.language-selector:focus-within) {
  outline: 3px solid #f2d2bc;
  outline-offset: 3px;
}

.welcome-toolbar :deep(select:focus-visible) {
  outline: none;
}

.welcome-content {
  align-self: center;
  width: min(100%, 45rem);
  margin-block: clamp(2.5rem, 8vh, 7rem);
  padding: clamp(1.5rem, 4vw, 3.5rem);
  border: 1px solid rgba(247, 247, 250, 0.2);
  border-radius: clamp(1.25rem, 3vw, 2rem);
  background: linear-gradient(145deg, rgba(10, 22, 35, 0.78), rgba(23, 36, 58, 0.58));
  box-shadow: 0 28px 80px -42px rgba(2, 8, 18, 0.9);
}

.welcome-brand {
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #f2d2bc;
}

h1 {
  max-width: 12ch;
  margin-top: 1rem;
  font-size: clamp(2.4rem, 6vw, 4.75rem);
  font-weight: 750;
  line-height: 1.06;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.welcome-copy {
  max-width: 39rem;
  margin-top: 1.5rem;
  font-size: clamp(1rem, 1.5vw, 1.16rem);
  line-height: 1.75;
  color: #e7e7ed;
}

.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  margin-top: 2rem;
}

.welcome-primary,
.welcome-secondary {
  min-width: 9.5rem;
  min-height: 3rem;
  border-radius: 0.875rem;
  padding-inline: 1.75rem;
  font-size: 1rem;
  font-weight: 750;
}

.welcome-primary {
  background: #f2e5dc;
  color: #182c34;
  box-shadow: 0 14px 30px -20px rgba(242, 229, 220, 0.8);
}

.welcome-primary:hover {
  background: #fff8f3;
}

.welcome-secondary {
  border-color: rgba(247, 247, 250, 0.72);
  background: rgba(16, 24, 39, 0.38);
  color: #f7f7fa;
  box-shadow: none;
}

.welcome-secondary:hover {
  border-color: #ffffff;
  background: rgba(247, 247, 250, 0.14);
  color: #ffffff;
}

.welcome-screen :deep(button:focus-visible) {
  outline: 3px solid #f2d2bc;
  outline-offset: 4px;
}

@media (max-width: 640px) {
  .welcome-layout {
    padding: 1rem 1rem 2rem;
  }

  .welcome-content {
    margin-block: 2rem;
    padding: 1.5rem;
  }

  h1 {
    font-size: clamp(2.25rem, 12vw, 3.25rem);
  }

  .welcome-actions {
    flex-direction: column;
  }

  .welcome-primary,
  .welcome-secondary {
    width: 100%;
  }

  .welcome-mist-far {
    left: -34%;
    width: 115vw;
  }

  .welcome-mist-middle {
    right: -50%;
    width: 130vw;
  }

  .welcome-mist-near {
    right: -42%;
    width: 145vw;
  }
}

@media (prefers-reduced-motion: reduce) {
  .welcome-mist {
    transform: none !important;
    transition: none !important;
    will-change: auto;
  }
}
</style>
