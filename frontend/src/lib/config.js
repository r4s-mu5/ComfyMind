/**
 * Central runtime config: API / WebSocket URLs, image URLs, socket factory.
 * In demo mode image URLs and sockets are served by src/lib/demo/*.
 */
import { isDemo } from '@/lib/demo/isDemo'
import { resolveDemoImage } from '@/lib/demo/images'
import { FakeSocket } from '@/lib/demo/fakeSocket'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const WS_URL = API_URL.replace(/^http/, 'ws')

/** URL of a file served by the backend (`/images/<folder>/<file>`), or a bundled image in demo mode. */
export const imageUrl = (folder, fileName) =>
  isDemo ? resolveDemoImage(fileName) : `${API_URL}/images/${folder}/${fileName}`

/** Open a WebSocket for `path` (e.g. `/ws/12/patient?token=...`); a fake BroadcastChannel socket in demo mode. */
export const createSocket = (path) => (isDemo ? new FakeSocket(path) : new WebSocket(`${WS_URL}${path}`))

/** Public asset (works with base './' and hosting in a sub-folder). */
export const publicUrl = (name) => `${import.meta.env.BASE_URL}${name}`
