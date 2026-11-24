import { reactive } from 'vue'

/** Reactive generation progress, so any view can show a calm waiting state:
 *  `demoProgress.active`, `demoProgress.progress` (0..1), `demoProgress.label`. */
export const demoProgress = reactive({ active: false, progress: 0, label: '', durationMs: 0 })

export const trackProgress = async (promiseFactory, durationMs, label = '') => {
  demoProgress.active = true
  demoProgress.progress = 0
  demoProgress.label = label
  demoProgress.durationMs = durationMs
  const start = Date.now()
  const timer = setInterval(() => {
    demoProgress.progress = Math.min(0.97, (Date.now() - start) / durationMs)
  }, 100)
  try {
    return await promiseFactory()
  } finally {
    clearInterval(timer)
    demoProgress.progress = 1
    demoProgress.active = false
  }
}
