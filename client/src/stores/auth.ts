import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  userId: number
  email: string
  name: string
  role: string
  exp: number
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<JwtPayload | null>(null)

  const isAuthenticated = computed(() => {
    if (!token.value) return false

    try {
      const decoded = jwtDecode<JwtPayload>(token.value)
      if (decoded.exp * 1000 < Date.now()) {
        logout()
        return false
      }
      return true
    } catch {
      logout()
      return false
    }
  })

  const userId = computed(() => user.value?.userId)
  const userRole = computed(() => user.value?.role)
  const userName = computed(() => user.value?.name)
  const expiresAt = computed(() => (user.value?.exp ? user.value.exp * 1000 : null))

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)

    try {
      user.value = jwtDecode<JwtPayload>(newToken)
    } catch (error) {
      console.error('Failed to decode token:', error)
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  // Initialize user data if token exists
  if (token.value) {
    try {
      const decoded = jwtDecode<JwtPayload>(token.value)
      // Check if token is not expired
      if (decoded.exp * 1000 > Date.now()) {
        user.value = decoded
      } else {
        logout()
      }
    } catch (error) {
      console.error('Failed to decode stored token:', error)
      logout()
    }
  }

  return {
    token,
    user,
    isAuthenticated,
    userId,
    userRole,
    userName,
    expiresAt,
    setToken,
    logout
  }
})