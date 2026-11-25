import { createApp } from 'vue'
import '@fontsource/tenor-sans/latin-400.css'
import '@fontsource/tenor-sans/latin-ext-400.css'
import './fonts.css'
import './style.css'
import App from './App.vue'
import { router } from './router'
import { initComfort } from '@/composables/useComfort'
import 'vue-sonner/style.css'

// Apply the saved Comfort settings (text size, motion, atmosphere, 3D) before first paint.
initComfort()

createApp(App).use(router).mount('#app')

// Dev builds only (--mode demodev): the dev / post-FX panel. Normal builds drop this branch and its chunk.
if (import.meta.env.VITE_DEV_PANEL === 'true') import('./dev/mountDevPanel').then((m) => m.mountDevPanel(router))
