import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { isDemo } from '@/lib/demo/isDemo'
import { demoUsers } from '@/lib/demo/store'
import SignupView from '../views/SignupView.vue'
import TherapistGenerationView from '../views/TherapistGenerationView.vue'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import CanvasView from '../views/CanvasView.vue'
import GenerationView from '../views/GenerationView.vue'
import CalendarView from '../views/CalendarView.vue'
import SessionView from '../views/SessionView.vue'
import WelcomeView from '../views/WelcomeView.vue'
import GalleryView from '../views/GalleryView.vue'
import TherapistSessionView from '../views/TherapistSessionView.vue'

const routes = [
  { path: '/', component: WelcomeView, meta: { hideHeader: true } },
  { path: '/login', component: LoginView, meta: { hideHeader: true } },
  { path: '/signup/', component: SignupView, meta: { hideHeader: true } },
  { path: '/home/', component: HomeView },
  { path: '/canvas/', component: CanvasView },
  { path: '/generation/', component: GenerationView },
  { path: '/freeimages/', component: GalleryView },
  // session-specific routes (use sessionId param)
  { path: '/session/:sessionId/patient', component: GenerationView, props: true },
  { path: '/session/:sessionId/patient/canvas', component: CanvasView, props: true },
  { path: '/session/:sessionId/therapist', component: TherapistSessionView, props: true, meta: { hideHeader: true } },
  { path: '/session/:sessionId', component: GalleryView, props: true },
  // Previous (pre-redesign) screens, kept reachable.
  { path: '/legacy/session/:sessionId/therapist', component: TherapistGenerationView, props: true },
  { path: '/legacy/session/:sessionId', component: SessionView, props: true },
  { path: '/legacy/freeimages/', component: SessionView },
  { path: '/calendar', component: CalendarView },
  // Living style guide (tokens + components). Public, also in demo mode.
  { path: '/design', component: () => import('../views/DesignView.vue'), meta: { hideHeader: true } },
  { path: '/design/dusk', component: () => import('../views/DesignDuskView.vue'), meta: { hideHeader: true } },
]

// Demo mode is meant for static hosting, where history-mode URLs would 404 on reload.
export const router = createRouter({
  history: isDemo ? createWebHashHistory() : createWebHistory(),
  routes,
})

// Demo mode has no token expiry: send visitors without a demo user to the login screen.
if (isDemo) {
  const publicPaths = ['/', '/login', '/signup', '/signup/', '/design', '/design/dusk']
  router.beforeEach((to) => {
    if (publicPaths.includes(to.path) || demoUsers.isLoggedIn()) return true
    return { path: '/login' }
  })
}
