/**
 * In-memory, stateful fake backend for demo mode. Mirrors the response shapes of the FastAPI
 * backend (see docs/redesign/01_APP_INVENTORY.md section 6). State lives in sessionStorage so a
 * page reload keeps it; mutations are broadcast so a second tab stays in sync.
 */
import { post, subscribe, TAB_ID } from './bus'
import { demoProgress, trackProgress } from './progress'
import {
  ARTWORK_KEYS, SKETCH_KEYS, artworkKeyFor, generatedName, hashString,
  registerRuntimeImage, templateFileNames,
} from './images'

const KEY = 'comfymind.demo.state.v1'
const MAX_AGE_MS = 45 * 60000
const MIN = 60000

export const PATIENT_ID = 1
export const THERAPIST_ID = 2

const httpError = (status, detail) =>
  Object.assign(new Error(detail), { response: { status, data: { detail } } })

const iso = (ms) => new Date(ms).toISOString()

const seed = (now, currentUserId = null) => {
  let imageId = 1
  const images = []
  const addImage = (fileName, ownerId, sessionId) =>
    images.push({ id: imageId++, fileName, seed: 1000 + imageId, owner_id: ownerId, session_id: sessionId })

  const mkSession = (id, patientId, startOffsetMin, durMin, ended = false) => ({
    id,
    patient_id: patientId,
    therapist_id: THERAPIST_ID,
    created_at: iso(now - 3 * 86400000),
    start_date: iso(now + startOffsetMin * MIN),
    end_date: iso(now + (startOffsetMin + durMin) * MIN),
    ended_at: ended ? iso(now + (startOffsetMin + durMin) * MIN) : null,
  })

  const day = 24 * 60
  const sessions = [
    mkSession(101, PATIENT_ID, -10, 60),          // live now: started 10 min ago, ends in 50
    mkSession(102, PATIENT_ID, 180, 60),          // later today
    mkSession(103, PATIENT_ID, -1 * day, 60, true),
    mkSession(104, PATIENT_ID, -3 * day, 60, true),
    mkSession(105, PATIENT_ID, -7 * day, 60, true),
    mkSession(106, PATIENT_ID, -14 * day, 60, true),
    mkSession(107, PATIENT_ID, 1 * day + 30, 60), // tomorrow
    mkSession(108, 3, 1 * day + 120, 60),         // another patient, tomorrow
    mkSession(109, 3, -2 * day, 60, true),
  ]
  const past = { 103: [0, 3, 6], 104: [1, 8], 105: [4, 9, 11], 106: [2, 5] }
  Object.entries(past).forEach(([sid, idxs]) =>
    idxs.forEach((i, n) => addImage(generatedName(ARTWORK_KEYS[i], 100 + n), PATIENT_ID, Number(sid))))
  ;[7, 10, 5, 2].forEach((i, n) => addImage(generatedName(ARTWORK_KEYS[i], 200 + n), PATIENT_ID, null))
  SKETCH_KEYS.forEach((k, n) => addImage(`drawn_${k}_${300 + n}.jpg`, PATIENT_ID, null))

  return {
    v: 1,
    createdAt: now,
    currentUserId,
    nextId: 1000,
    users: [
      { id: PATIENT_ID, email: 'alex@demo.comfymind', full_name: 'Alex', type: 'patient', is_active: true },
      { id: THERAPIST_ID, email: 'marta@demo.comfymind', full_name: 'Marta Soler', type: 'therapist', is_active: true },
      { id: 3, email: 'jordi@demo.comfymind', full_name: 'Jordi Puig', type: 'patient', is_active: true },
    ],
    sessions,
    images,
  }
}

const load = () => {
  const now = Date.now()
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw)
      if (s?.v === 1 && now - s.createdAt < MAX_AGE_MS) return s
      if (s?.v === 1) return seed(now, s.currentUserId) // too old: relative times would be stale
    }
  } catch { /* ignore */ }
  return seed(now)
}

let state = load()

const save = () => {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore */ }
}
save()

const broadcastState = () => {
  const { users, sessions, images, nextId, notes } = state
  post({ kind: 'state', from: 'store', payload: { users, sessions, images, nextId, notes } })
}

const commit = () => {
  save()
  broadcastState()
}

subscribe((msg) => {
  if (msg.kind !== 'state' || msg.tabId === TAB_ID) return
  state = { ...state, ...msg.payload }
  save()
})

const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const nextId = () => state.nextId++

const strip = (u) => ({ ...u })
const me = () => state.users.find((u) => u.id === state.currentUserId) || null
const requireMe = () => {
  const u = me()
  if (!u) throw httpError(401, 'Not authenticated')
  return u
}
const isParticipant = (s, u) => s.patient_id === u.id || s.therapist_id === u.id
const mySessions = () => {
  const u = requireMe()
  return state.sessions.filter((s) => isParticipant(s, u))
}
const isActive = (s, now = Date.now()) =>
  !s.ended_at && new Date(s.start_date).getTime() <= now && now <= new Date(s.end_date).getTime()
const imageOut = ({ id, fileName, seed: sd }) => ({ id, fileName, seed: sd })
const listOut = (arr) => ({ data: arr.map(imageOut), count: arr.length })

// ---------------------------------------------------------------- users
export const demoUsers = {
  async getUsers() { return state.users.map(strip) },
  async getUserById(id) {
    const u = state.users.find((x) => x.id === Number(id))
    if (!u) throw httpError(404, 'Usuario no encontrado')
    return strip(u)
  },
  async createUser(data) {
    if (state.users.some((u) => u.email === data.email)) throw httpError(400, 'Email ya registrado')
    const user = {
      id: nextId(), email: data.email, full_name: data.full_name,
      type: data.type === 'therapist' ? 'therapist' : 'patient', is_active: true,
    }
    state.users.push(user)
    state.currentUserId = user.id
    setToken(user)
    commit()
    return strip(user)
  },
  async login({ email }) {
    const e = String(email || '').trim().toLowerCase()
    let user = state.users.find((u) => u.email.toLowerCase() === e)
    if (!user) user = state.users.find((u) => u.id === (/terap|therap|marta/.test(e) ? THERAPIST_ID : PATIENT_ID))
    state.currentUserId = user.id
    setToken(user)
    save()
    return { access_token: `demo-token-${user.id}`, token_type: 'bearer' }
  },
  async getCurrentUser() { return strip(requireMe()) },
  async logout() {
    state.currentUserId = null
    try { localStorage.removeItem('token') } catch { /* ignore */ }
    save()
  },
  isLoggedIn: () => Boolean(state.currentUserId),
}

const setToken = (user) => {
  try { localStorage.setItem('token', `demo-token-${user.id}`) } catch { /* ignore */ }
}

// ---------------------------------------------------------------- sessions
export const demoSessions = {
  async getActiveSession() { return mySessions().find((s) => isActive(s)) || null },
  async getNextSession() {
    const list = mySessions()
    const active = list.find((s) => isActive(s))
    if (active) return active
    const now = Date.now()
    return list
      .filter((s) => !s.ended_at && new Date(s.start_date).getTime() > now)
      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0] || null
  },
  async getSession(id) {
    const s = state.sessions.find((x) => x.id === Number(id))
    if (!s) throw httpError(404, 'Sesión no encontrada')
    if (!isParticipant(s, requireMe())) throw httpError(403, 'No autorizado')
    return { ...s }
  },
  async getMySessions() { return mySessions().map((s) => ({ ...s })) },
  async createSession(patientId, data) {
    const t = requireMe()
    if (t.type !== 'therapist') throw httpError(403, 'Solo los terapeutas pueden crear sesiones')
    if (!state.users.some((u) => u.id === Number(patientId))) throw httpError(404, 'Usuario no encontrado')
    if (new Date(data.start_date) >= new Date(data.end_date)) throw httpError(400, 'La fecha de inicio debe ser anterior a la de fin')
    const s = {
      id: nextId(), patient_id: Number(patientId), therapist_id: t.id, created_at: iso(Date.now()),
      start_date: data.start_date, end_date: data.end_date, ended_at: null,
    }
    state.sessions.push(s)
    commit()
    post({ kind: 'home', from: 'store', toUserId: s.patient_id, data: JSON.stringify({ event: 'new_session', sessionId: s.id }) })
    return { ...s }
  },
  async updateSession(id, data) {
    const s = state.sessions.find((x) => x.id === Number(id))
    if (!s) throw httpError(404, 'Sesión no encontrada')
    if (data.start_date) s.start_date = data.start_date
    if (data.end_date) s.end_date = data.end_date
    commit()
    return { ...s }
  },
  async deleteSession(id) {
    state.sessions = state.sessions.filter((x) => x.id !== Number(id))
    commit()
    return { message: 'Sesión eliminada' }
  },
  async endSession(id) {
    const s = state.sessions.find((x) => x.id === Number(id))
    if (!s) throw httpError(404, 'Sesión no encontrada')
    s.ended_at = iso(Date.now())
    commit()
    post({ kind: 'relay', from: 'store', sessionId: s.id, fromRole: 'server', data: 'session_ended' })
    return { ...s }
  },
  async getImagesForSession(id) {
    return listOut(state.images.filter((i) => i.session_id === Number(id)))
  },
  async getImagesNoSession(userId) {
    return listOut(state.images.filter((i) => i.owner_id === Number(userId) && i.session_id == null))
  },
}

// ---------------------------------------------------------------- comfy
const genCounts = new Map()

const generate = async (seedText, userId, sessionId, durationMs) => {
  const duration = durationMs ?? 2500 + (hashString(seedText) % 1500)
  return trackProgress(async () => {
    await wait(duration)
    const n = genCounts.get(seedText) || 0
    genCounts.set(seedText, n + 1)
    const key = artworkKeyFor(seedText, n)
    const file = generatedName(key, nextId())
    const record = { id: nextId(), fileName: file, seed: hashString(seedText + n) % 1000000, owner_id: Number(userId), session_id: sessionId ?? null }
    state.images.push(record)
    commit()
    return { message: 'Imagen generada', file, fullPath: `demo/${file}`, seed: record.seed }
  }, duration, 'generating')
}

const nameOf = (v) => String(v ?? '').split('#').pop().split('/').pop()

export const demoComfy = {
  createImage: (prompt, userId, sessionId) =>
    generate(`${prompt?.promptText || ''}|${nameOf(prompt?.inputImage)}`, userId, sessionId),
  convertirBoceto: (prompt, userId, sessionId) =>
    generate(`${prompt?.sketchText || ''}|${nameOf(prompt?.sketchImage)}`, userId, sessionId),
  generateImageByMultiple: (images, count, userId, sessionId) => {
    const list = images?.data ?? images ?? []
    return generate(`multi${count}|${list.map((i) => nameOf(i.fileName || i)).join(',')}`, userId, sessionId)
  },
  async uploadImage(file, userId, isDrawnImage = false) {
    await wait(300)
    const ext = (file?.name || 'x.png').split('.').pop().toLowerCase()
    const name = `${isDrawnImage ? 'uploaded_drawn' : 'uploaded_image'}_${nextId()}.${ext}`
    registerRuntimeImage(name, file)
    state.images.push({ id: nextId(), fileName: name, seed: null, owner_id: Number(userId), session_id: null })
    commit()
    return { message: 'Imagen subida', file: name, fullPath: `demo/${name}`, seed: null }
  },
  async uploadDrawnImage(file, userId) {
    await wait(300)
    const name = `drawn_${nextId()}.png`
    registerRuntimeImage(name, file)
    state.images.push({ id: nextId(), fileName: name, seed: null, owner_id: Number(userId), session_id: null })
    commit()
    return { message: 'Dibujo guardado', file: name, fullPath: `demo/${name}`, seed: null }
  },
  async getImagesForUser(userId) {
    return listOut(state.images.filter((i) => i.owner_id === Number(userId)))
  },
  async getTemplateImages() { return { images: templateFileNames() } },
  async linkImageToSession(imageFileName, userId, sessionId) {
    const rec = { id: nextId(), fileName: imageFileName, seed: null, owner_id: Number(userId), session_id: Number(sessionId) }
    state.images.push(rec)
    commit()
    return imageOut(rec)
  },
}

// ---------------------------------------------------------------- notes (B2: reflection notes + "kept")
// One entry per image file name: { fileName, text, kept, ownerId, sessionId, updatedAt }.
// Read by the gallery (Mis obras detail) and the therapist view. See DEMO_MODE.md.
const notesMap = () => (state.notes ||= {})
const noteOut = (n) => (n ? { ...n } : null)
const upsertNote = (fileName, patch) => {
  const key = nameOf(fileName)
  const prev = notesMap()[key] || { fileName: key, text: '', kept: false, ownerId: null, sessionId: null }
  notesMap()[key] = { ...prev, ...patch, fileName: key, updatedAt: iso(Date.now()) }
  commit()
  return noteOut(notesMap()[key])
}

export const demoNotes = {
  async saveNote(fileName, text, { userId = null, sessionId = null } = {}) {
    return upsertNote(fileName, { text: String(text ?? ''), ownerId: userId ?? me()?.id ?? null, sessionId: sessionId ?? null })
  },
  async keepArtwork(fileName, { userId = null, sessionId = null } = {}) {
    return upsertNote(fileName, { kept: true, ownerId: userId ?? me()?.id ?? null, sessionId: sessionId ?? null })
  },
  async getNote(fileName) { return noteOut(notesMap()[nameOf(fileName)]) },
  async getNotesForUser(userId) {
    return Object.values(notesMap()).filter((n) => n.ownerId === Number(userId)).map(noteOut)
  },
  async getNotesForSession(sessionId) {
    return Object.values(notesMap()).filter((n) => n.sessionId === Number(sessionId)).map(noteOut)
  },
}

export { demoProgress }
export const getDemoState = () => state
