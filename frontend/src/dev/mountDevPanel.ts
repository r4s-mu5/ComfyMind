import { createApp } from 'vue'
import type { Router } from 'vue-router'
import DevPanel from './DevPanel.vue'

/**
 * Mounts the dev panel as its own small app outside #app, so "Hide UI" can hide the whole app but not the
 * panel. Called from main.js only when VITE_DEV_PANEL is 'true' (the import is dynamic, so normal builds
 * do not contain this folder).
 */
export function mountDevPanel(router: Router) {
  const host = document.createElement('div')
  host.id = 'comfymind-dev'
  document.body.appendChild(host)
  createApp(DevPanel, { router }).mount(host)
}
