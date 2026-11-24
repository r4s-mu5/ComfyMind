import axios from 'axios'
import { ref } from 'vue'

export const sessionExpiredDialog = ref(false)

// Helper para saber la ruta actual
function getCurrentPath() {
  try {
    // Hash routing (static/demo hosting): the route lives after '#', e.g. '#/login?x=1'
    const hash = window.location.hash
    if (hash.startsWith('#/')) return hash.slice(1).split('?')[0]
    return window.location.pathname
  } catch {
    return ''
  }
}

function isLoginEntryPath(path) {
  return path === '/' || path === '/login' || path === '/login/'
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response && error.response.status === 401 &&
      !isLoginEntryPath(getCurrentPath())
    ) {
      sessionExpiredDialog.value = true
    }
    return Promise.reject(error)
  }
)

export default axios
