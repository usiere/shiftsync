import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import axios from '@/services/api'

interface JwtPayload {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
  iat: number
  exp: number
}

interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

interface LoginCredentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => {
    if (!token.value) return false

    try {
      const decoded = jwtDecode<JwtPayload>(token.value)
      // Check if token is expired
      const currentTime = Date.now() / 1000
      return decoded.exp > currentTime
    } catch {
      return false
    }
  })

  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  const isManager = computed(() => user.value?.role === 'MANAGER')
  const isStaff = computed(() => user.value?.role === 'STAFF')
  const isManagerOrAdmin = computed(() => isManager.value || isAdmin.value)

  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`
  })

  const userInitials = computed(() => {
    if (!user.value || !user.value.firstName || !user.value.lastName) return '??'
    return `${user.value.firstName[0]}${user.value.lastName[0]}`.toUpperCase()
  })

  // Actions
  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)

    // Decode token to get user info
    try {
      const decoded = jwtDecode<JwtPayload>(newToken)
      user.value = {
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        role: decoded.role
      }
    } catch (err) {
      console.error('Failed to decode token:', err)
      clearAuth()
    }
  }

  const clearAuth = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  const login = async (credentials: LoginCredentials) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.post('/auth/login', credentials)
      const { token: authToken, user: userData } = response.data

      setToken(authToken)

      // Update user data with response data (in case JWT doesn't have all fields)
      if (userData) {
        user.value = {
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      }

      return { success: true }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true

    try {
      // Call logout endpoint to invalidate token on server
      await axios.post('/auth/logout')
    } catch (err) {
      // Even if logout fails on server, clear local data
      console.error('Logout request failed:', err)
    } finally {
      clearAuth()
      isLoading.value = false
    }
  }

  const fetchCurrentUser = async () => {
    if (!isAuthenticated.value) return

    try {
      const response = await axios.get('/auth/me')
      const userData = response.data.user

      user.value = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err)
      // If fetching user fails, token might be invalid
      clearAuth()
    }
  }

  const checkAuthOnLoad = () => {
    if (token.value && isAuthenticated.value) {
      // Try to decode existing token
      try {
        const decoded = jwtDecode<JwtPayload>(token.value)
        user.value = {
          id: decoded.id,
          email: decoded.email,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          role: decoded.role
        }
      } catch (err) {
        console.error('Failed to decode stored token:', err)
        clearAuth()
      }
    } else {
      clearAuth()
    }
  }

  const getRedirectPath = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '/dashboard'
      case 'MANAGER':
        return '/shifts'
      case 'STAFF':
        return '/schedule'
      default:
        return '/schedule'
    }
  }

  // Initialize auth state on store creation
  checkAuthOnLoad()

  return {
    // State
    token: computed(() => token.value),
    user: computed(() => user.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),

    // Getters
    isAuthenticated,
    isAdmin,
    isManager,
    isStaff,
    isManagerOrAdmin,
    userFullName,
    userInitials,

    // Actions
    login,
    logout,
    fetchCurrentUser,
    checkAuthOnLoad,
    getRedirectPath,
    setToken,
    clearAuth
  }
})