/**
 * Fake WebSocket for demo mode. Same surface the views use (onopen, onmessage, onclose, onerror,
 * send, close, readyState, addEventListener). Talks to other tabs through BroadcastChannel; when
 * the other role is not connected, scripted "Marta" (or "Alex") replies keep the demo alive.
 */
import { post, subscribe } from './bus'
import { generatedName, hashString, ARTWORK_KEYS } from './images'
import { getDemoState } from './store'
import { usePrototypeLocale } from '@/composables/usePrototypeLocale'

const OPEN = 1
const CLOSED = 3
let seq = 0

const currentLocale = () => {
  try { return usePrototypeLocale().locale.value } catch { return 'es' }
}

// Gentle, open, supportive therapist replies (never directive or clinical).
const THERAPIST = {
  es: {
    greeting: (n) => [`Hola ${n}, me alegra verte. ¿Cómo te encuentras hoy?`],
    chat: [
      'Gracias por contármelo. ¿Qué es lo que más notas en el cuerpo ahora mismo?',
      'Te escucho. ¿Qué te gustaría explorar hoy con las imágenes?',
      'Me parece valioso que lo compartas. ¿Qué colores o formas te acompañan en este momento?',
    ],
    image: [
      'Gracias por compartirla. ¿Qué es lo primero que te transmite?',
      'Gracias por enseñármela. ¿Qué te hizo elegirla?',
      'La veo con calma. ¿Qué sientes al mirarla?',
    ],
    final: ['Gracias por llegar hasta aquí. ¿Cómo te sientes al darla por terminada?'],
  },
  ca: {
    greeting: (n) => [`Hola ${n}, m'alegra veure't. Com et trobes avui?`],
    chat: [
      'Gràcies per explicar-m\'ho. Què és el que més notes al cos ara mateix?',
      'T\'escolto. Què t\'agradaria explorar avui amb les imatges?',
      'Em sembla valuós que ho comparteixis. Quins colors o formes t\'acompanyen en aquest moment?',
    ],
    image: [
      'Gràcies per compartir-la. Què és el primer que et transmet?',
      'Gràcies per ensenyar-me-la. Què et va fer triar-la?',
      'La miro amb calma. Què sents quan la mires?',
    ],
    final: ['Gràcies per arribar fins aquí. Com et sents en donar-la per acabada?'],
  },
  en: {
    greeting: (n) => [`Hi ${n}, I'm glad to see you. How are you feeling today?`],
    chat: [
      'Thank you for telling me. What do you notice most in your body right now?',
      'I\'m listening. What would you like to explore with the images today?',
      'It means a lot that you shared that. What colours or shapes are with you right now?',
    ],
    image: [
      'Thank you for sharing it. What is the first thing it brings up for you?',
      'Thank you for showing me. What made you choose it?',
      'I\'m looking at it calmly. What do you feel when you look at it?',
    ],
    final: ['Thank you for getting this far. How does it feel to call it finished?'],
  },
}

const PATIENT = {
  es: ['Hola Marta, hoy estoy un poco cansado, pero con ganas de dibujar.', 'Esta imagen me recuerda a un lugar tranquilo.'],
  ca: ['Hola Marta, avui estic una mica cansat, però amb ganes de dibuixar.', 'Aquesta imatge em recorda un lloc tranquil.'],
  en: ['Hi Marta, I\'m a bit tired today, but I feel like drawing.', 'This image reminds me of a calm place.'],
}

const pick = (arr, text) => arr[hashString(String(text)) % arr.length]
const flag = (k) => { try { return sessionStorage.getItem(k) === '1' } catch { return false } }
const setFlag = (k) => { try { sessionStorage.setItem(k, '1') } catch { /* ignore */ } }

export class FakeSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  constructor(url) {
    this.url = url
    this.id = `sock-${Math.random().toString(36).slice(2, 8)}-${++seq}`
    this.readyState = 0
    this.onopen = this.onmessage = this.onclose = this.onerror = null
    this._listeners = {}
    this._peers = new Map()
    this._timers = new Set()
    this._pending = false

    const parts = String(url).split('?')[0].split('/').filter(Boolean) // ['ws','101','patient'] | ['ws','home']
    this.isHome = parts[1] === 'home'
    this.sessionId = this.isHome ? null : Number(parts[1])
    this.role = this.isHome ? 'home' : parts[2]

    this._unsub = subscribe((m) => this._onBus(m))
    this._onPageHide = () => this._bye()
    try { window.addEventListener('pagehide', this._onPageHide) } catch { /* ignore */ }
    this._later(40, () => this._open())
  }

  OPEN = OPEN

  addEventListener(type, fn) { (this._listeners[type] ||= new Set()).add(fn) }
  removeEventListener(type, fn) { this._listeners[type]?.delete(fn) }

  _emit(type, ev) {
    try { this[`on${type}`]?.(ev) } catch (e) { console.error(e) }
    this._listeners[type]?.forEach((fn) => { try { fn(ev) } catch (e) { console.error(e) } })
  }

  _later(ms, fn) {
    const t = setTimeout(() => { this._timers.delete(t); if (this.readyState !== CLOSED) fn() }, ms)
    this._timers.add(t)
  }

  _deliver(data) { if (this.readyState === OPEN) this._emit('message', { data, type: 'message' }) }

  _open() {
    this.readyState = OPEN
    this._emit('open', { type: 'open' })
    if (this.isHome) return
    post({ kind: 'hello', from: this.id, sessionId: this.sessionId, fromRole: this.role })
    this._later(1800, () => this._startScript())
  }

  _hasPeer(role) { return [...this._peers.values()].includes(role) }

  _onBus(m) {
    if (m.from === this.id || this.readyState === CLOSED) return
    if (this.isHome) {
      if (m.kind === 'home' && (m.toUserId == null || m.toUserId === getDemoState().currentUserId)) this._deliver(m.data)
      return
    }
    if (m.sessionId !== this.sessionId) return
    if (m.kind === 'hello') {
      if (m.fromRole === this.role) return
      this._peers.set(m.from, m.fromRole)
      if (!m.reply) post({ kind: 'hello', reply: true, from: this.id, sessionId: this.sessionId, fromRole: this.role })
    } else if (m.kind === 'bye') {
      this._peers.delete(m.from)
    } else if (m.kind === 'relay' && m.fromRole !== this.role) {
      this._deliver(m.data)
    }
  }

  _bye() { if (!this.isHome) post({ kind: 'bye', from: this.id, sessionId: this.sessionId }) }

  send(data) {
    if (this.readyState !== OPEN || this.isHome) return
    post({ kind: 'relay', from: this.id, sessionId: this.sessionId, fromRole: this.role, data: String(data) })
    if (this.role === 'patient' && !this._hasPeer('therapist')) this._scriptedTherapistReply(data)
  }

  close() {
    if (this.readyState === CLOSED) return
    this._bye()
    this.readyState = CLOSED
    this._unsub()
    this._timers.forEach(clearTimeout)
    this._timers.clear()
    try { window.removeEventListener('pagehide', this._onPageHide) } catch { /* ignore */ }
    this._emit('close', { type: 'close', code: 1000 })
  }

  // ------------------------------------------------------------ scripted counterpart
  _name() {
    const st = getDemoState()
    return st.users.find((u) => u.id === st.currentUserId)?.full_name?.split(' ')[0] || 'Alex'
  }

  _scriptedTherapistReply(raw) {
    if (this._pending) return
    let event = 'chat_message'
    let body = String(raw)
    try { const o = JSON.parse(raw); event = o.event; body = o.text || o.fileName || '' } catch { /* plain text */ }
    if (!['chat_message', 'submit_image', 'confirm_artwork'].includes(event)) return
    const set = THERAPIST[currentLocale()] || THERAPIST.es
    const list = event === 'submit_image' ? set.image : event === 'confirm_artwork' ? set.final : set.chat
    const text = pick(list, body + Date.now())
    this._pending = true
    this._later(3000 + (hashString(body) % 2000), () => {
      this._pending = false
      this._deliver(JSON.stringify({ event: 'chat_message', sender: 'therapist', text }))
    })
  }

  _startScript() {
    const key = `comfymind.demo.script.${this.role}.${this.sessionId}`
    if (this.isHome || flag(key)) return
    const locale = currentLocale()
    if (this.role === 'patient' && !this._hasPeer('therapist')) {
      setFlag(key)
      const set = THERAPIST[locale] || THERAPIST.es
      this._later(1200, () => this._deliver(JSON.stringify({
        event: 'chat_message', sender: 'therapist', text: set.greeting(this._name())[0],
      })))
    } else if (this.role === 'therapist' && !this._hasPeer('patient')) {
      setFlag(key)
      const lines = PATIENT[locale] || PATIENT.es
      const msg = (text) => JSON.stringify({ event: 'chat_message', sender: 'patient', text })
      this._later(3500, () => this._deliver(msg(lines[0])))
      this._later(11000, () => this._deliver(JSON.stringify({
        event: 'submit_image', fileName: generatedName(ARTWORK_KEYS[hashString(String(this.sessionId)) % ARTWORK_KEYS.length], 901),
      })))
      this._later(13500, () => this._deliver(msg(lines[1])))
    }
  }
}
