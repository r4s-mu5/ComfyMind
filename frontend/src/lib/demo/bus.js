// One BroadcastChannel shared by the store and the fake sockets: lets two browser tabs talk.
export const TAB_ID = Math.random().toString(36).slice(2, 10)
const listeners = new Set()
let channel = null
try {
  channel = new BroadcastChannel('comfymind-demo')
  channel.onmessage = (e) => listeners.forEach((fn) => fn(e.data))
} catch { /* BroadcastChannel unavailable: single-tab demo only */ }

export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Send to other tabs and to listeners in this tab (listeners filter on msg.from themselves). */
export const post = (msg) => {
  const full = { ...msg, tabId: TAB_ID }
  try { channel?.postMessage(full) } catch { /* ignore */ }
  listeners.forEach((fn) => fn(full))
}
