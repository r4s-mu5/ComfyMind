/**
 * @fileoverview Reflection notes and "kept" marks for artworks (B2).
 *
 * Demo mode: stored in the fake backend (`demoNotes` in src/lib/demo/store.js), shared with a
 * second tab, so the gallery and the therapist can read them.
 * Real backend: CONCEPT ONLY. The API has no notes endpoint yet, so notes are kept in this
 * browser's localStorage. Replace the local branch with API calls when the backend supports it.
 *
 * Every function is keyed by the image file name (the stable id returned by the comfy service).
 * Shape of a note: { fileName, text, kept, ownerId, sessionId, updatedAt }.
 * @module notesService
 */
import { isDemo } from '@/lib/demo/isDemo'
import { demoNotes } from '@/lib/demo/store'

const LOCAL_KEY = 'comfymind.notes.v1'
const nameOf = (v) => String(v ?? '').split('#').pop().split('/').pop()

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') || {} } catch { return {} }
}
const writeLocal = (map) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(map)) } catch { /* storage unavailable */ }
}
const upsertLocal = (fileName, patch) => {
  const map = readLocal()
  const key = nameOf(fileName)
  const prev = map[key] || { fileName: key, text: '', kept: false, ownerId: null, sessionId: null }
  map[key] = { ...prev, ...patch, fileName: key, updatedAt: new Date().toISOString() }
  writeLocal(map)
  return { ...map[key] }
}

export const notesService = {
  /** Save (or replace) the reflection note of an artwork. */
  async saveNote(fileName, text, { userId = null, sessionId = null } = {}) {
    if (isDemo) return demoNotes.saveNote(fileName, text, { userId, sessionId })
    return upsertLocal(fileName, { text: String(text ?? ''), ownerId: userId, sessionId })
  },

  /** Mark an artwork as kept in "Mis obras" (the patient pressed "Guardar en mis obras"). */
  async keepArtwork(fileName, { userId = null, sessionId = null } = {}) {
    if (isDemo) return demoNotes.keepArtwork(fileName, { userId, sessionId })
    return upsertLocal(fileName, { kept: true, ownerId: userId, sessionId })
  },

  /** The note for one artwork, or null. */
  async getNote(fileName) {
    if (isDemo) return demoNotes.getNote(fileName)
    const n = readLocal()[nameOf(fileName)]
    return n ? { ...n } : null
  },

  /** All notes of a user. */
  async getNotesForUser(userId) {
    if (isDemo) return demoNotes.getNotesForUser(userId)
    return Object.values(readLocal()).filter((n) => n.ownerId === Number(userId))
  },

  /** All notes made in a session (for the therapist view). */
  async getNotesForSession(sessionId) {
    if (isDemo) return demoNotes.getNotesForSession(sessionId)
    return Object.values(readLocal()).filter((n) => n.sessionId === Number(sessionId))
  },
}
