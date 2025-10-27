import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import SurveyEditorView from '../views/SurveyEditorView.vue'
import SurveyTakeView from '../views/SurveyTakeView.vue'
import SurveyResultsView from '../views/SurveyResultsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/survey/:id',
    name: 'survey-editor',
    component: SurveyEditorView,
    meta: { requiresAuth: true }
  },
  {
    path: '/take/:id',
    name: 'survey-take',
    component: SurveyTakeView
    // No auth required - public access
  },
  {
    path: '/results/:id',
    name: 'survey-results',
    component: SurveyResultsView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }

    // Verify token is still valid
    const isValid = await authStore.checkAuth()
    if (!isValid) {
      next('/login')
      return
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }

  next()
})

export default router

