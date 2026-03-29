import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: {
        layout: 'auth',
        requiresGuest: true
      }
    },
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: {
        requiresAuth: true,
        roles: ['ADMIN']
      }
    },
    {
      path: '/shifts',
      name: 'Shifts',
      component: () => import('@/views/Shifts.vue'),
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'MANAGER']
      }
    },
    {
      path: '/schedule',
      name: 'Schedule',
      component: () => import('@/views/Schedule.vue'),
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'MANAGER', 'STAFF']
      }
    },
    {
      path: '/swap-requests',
      name: 'SwapRequests',
      component: () => import('@/views/SwapRequests.vue'),
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'MANAGER', 'STAFF']
      }
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: () => import('@/views/Notifications.vue'),
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'MANAGER', 'STAFF']
      }
    },
    {
      path: '/analytics',
      name: 'Analytics',
      component: () => import('@/views/Analytics.vue'),
      meta: {
        requiresAuth: true,
        roles: ['ADMIN', 'MANAGER']
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Handle guest-only routes (like login)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    const redirectPath = authStore.getRedirectPath(authStore.user?.role || 'STAFF')
    return next(redirectPath)
  }

  // Handle routes that require authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Handle role-based access
  if (to.meta.roles && authStore.user) {
    const userRole = authStore.user.role
    const allowedRoles = to.meta.roles as string[]

    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate page based on role
      const redirectPath = authStore.getRedirectPath(userRole)
      return next(redirectPath)
    }
  }

  next()
})

export default router