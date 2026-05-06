export const isDevPreviewMode = import.meta.env.VITE_DEV_PREVIEW_MODE === 'true'

export const withMockDelay = async (value, delayMs = 80) => {
  await new Promise((resolve) => setTimeout(resolve, delayMs))
  return value
}
