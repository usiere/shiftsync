import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AppLayout from '../layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      redirect: (to) => {
        const authStore = useAuthStore()
        return authStore.userRole === 'STAFF' ? '/schedule' : '/dashboard'
      }
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView,
          meta: { requiredRoles: ['ADMIN', 'MANAGER'] }
        },
        {
          path: 'shifts',
          name: 'shifts',
          component: () => import('../views/ShiftsView.vue')
        },
        {
          path: 'time-off',
          name: 'time-off',
          component: () => import('../views/TimeOffView.vue')
        },
        {
          path: 'schedule',
          name: 'schedule',
          component: () => import('../views/ScheduleView.vue')
        },
        {
          path: 'swap-requests',
          name: 'swap-requests',
          component: () => import('../views/SwapRequestsView.vue')
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('../views/NotificationsView.vue')
        },
        {
          path: 'employees',
          name: 'employees',
          component: () => import('../views/EmployeesView.vue'),
          meta: { requiredRoles: ['ADMIN', 'MANAGER'] }
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('../views/AnalyticsView.vue'),
          meta: { requiredRoles: ['ADMIN', 'MANAGER'] }
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('../views/ReportsView.vue'),
          meta: { requiredRoles: ['ADMIN', 'MANAGER'] }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/SettingsView.vue'),
          meta: { requiredRoles: ['ADMIN'] }
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }

    // Check role requirements
    if (to.meta.requiredRoles && Array.isArray(to.meta.requiredRoles)) {
      if (!authStore.userRole || !to.meta.requiredRoles.includes(authStore.userRole)) {
        // Redirect STAFF to /schedule, others to /dashboard
        if (authStore.userRole === 'STAFF') {
          next('/schedule')
        } else {
          next('/dashboard')
        }
        return
      }
    }
  }

  // Check if route requires guest (unauthenticated user)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    if (authStore.userRole === 'STAFF') {
      next('/schedule')
    } else {
      next('/dashboard')
    }
    return
  }

  next()
})

export default router