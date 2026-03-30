<template>
  <v-app>
    <v-main>
      <div class="login-container">
        <!-- Left Panel -->
        <div class="login-left-panel">
          <div class="left-panel-content">
            <div class="logo-section">
              <div class="logo-mark">SS</div>
              <div class="brand-name">ShiftSync</div>
              <div class="tagline">Staff scheduling,<br>simplified.</div>
            </div>
            <div class="copyright">© 2026 ShiftSync</div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="login-right-panel">
          <div class="right-panel-content">
            <div class="login-header">
              <h1 class="welcome-title">Welcome back</h1>
              <p class="welcome-subtitle">Sign in to your account</p>
            </div>

            <form @submit.prevent="login" class="login-form">
              <div class="input-group">
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="Email"
                  class="login-input"
                  :disabled="loading"
                  autocomplete="email"
                  required
                />
              </div>

              <div class="input-group">
                <div class="password-wrapper">
                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Password"
                    class="login-input"
                    :disabled="loading"
                    autocomplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="password-toggle"
                    :disabled="loading"
                  >
                    <v-icon size="18" :color="showPassword ? '#2563EB' : '#94A3B8'">
                      {{ showPassword ? 'mdi-eye' : 'mdi-eye-off' }}
                    </v-icon>
                  </button>
                </div>
              </div>

              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="login-error"
              >
                {{ error }}
              </v-alert>

              <button
                type="submit"
                class="login-button"
                :disabled="loading"
              >
                <span v-if="loading">Signing in...</span>
                <span v-else>Sign In</span>
              </button>
            </form>

            <!-- Demo Accounts Toggle -->
            <div class="demo-section">
              <button
                type="button"
                @click="showDemo = !showDemo"
                class="demo-toggle"
              >
                Demo accounts ›
              </button>

              <div v-if="showDemo" class="demo-table">
                <table>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Admin</td>
                      <td>admin@shiftsync.com</td>
                      <td>admin123</td>
                    </tr>
                    <tr>
                      <td>Manager</td>
                      <td>manager.east@shiftsync.com</td>
                      <td>manager123</td>
                    </tr>
                    <tr>
                      <td>Staff</td>
                      <td>staff1@shiftsync.com</td>
                      <td>staff123</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'
import socketService from '../services/socketService'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showDemo = ref(false)

const _rules = {
  required: (value: string) => !!value || 'This field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Please enter a valid email address'
  }
}

async function login() {
  if (!form.value.email || !form.value.password) {
    error.value = 'Please fill in all fields'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.post('/auth/login', {
      email: form.value.email,
      password: form.value.password
    })

    if (response.data.token) {
      authStore.setToken(response.data.token)
      // Connect to socket after successful login
      socketService.connect()
      router.push('/dashboard')
    } else {
      error.value = 'Login failed: No token received'
    }
  } catch (err: any) {
    console.error('Login error:', err)
    if (err.response?.status === 401) {
      error.value = 'Invalid email or password'
    } else if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
/* Split Panel Layout */
.login-container {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
}

/* Left Panel - 40% width */
.login-left-panel {
  width: 40%;
  background: #0F172A;
  background-image: radial-gradient(circle, #ffffff08 1px, transparent 1px);
  background-size: 24px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 64px 48px;
  position: relative;
}

.left-panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  height: 100%;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  justify-content: center;
}

.logo-mark {
  width: 44px;
  height: 44px;
  background: #2563EB;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 18px;
  color: white;
  margin-bottom: 16px;
}

.brand-name {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 22px;
  color: white;
  margin-bottom: 24px;
}

.tagline {
  font-family: 'DM Sans', sans-serif;
  font-weight: 300;
  font-size: 32px;
  line-height: 1.3;
  color: #94A3B8;
}

.copyright {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #475569;
  margin-top: auto;
}

/* Right Panel - 60% width */
.login-right-panel {
  width: 60%;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px;
}

.right-panel-content {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.login-header {
  margin-bottom: 40px;
}

.welcome-title {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 28px;
  color: #0F172A;
  margin: 0 0 8px 0;
}

.welcome-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
}

/* Form Styling */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.login-input {
  height: 48px;
  border: 1.5px solid #E8ECEF;
  border-radius: 10px;
  padding: 0 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 400;
  color: #0F172A;
  background: white;
  transition: all 0.2s ease-in-out;
}

.login-input::placeholder {
  color: #94A3B8;
}

.login-input:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.login-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease-in-out;
}

.password-toggle:hover {
  background: rgba(37, 99, 235, 0.08);
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.login-error {
  margin: 0;
}

.login-button {
  height: 48px;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.login-button:hover:not(:disabled) {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Demo Section */
.demo-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #F1F5F9;
}

.demo-toggle {
  background: none;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s ease-in-out;
}

.demo-toggle:hover {
  color: #2563EB;
}

.demo-table {
  margin-top: 16px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #F1F5F9;
}

.demo-table table {
  width: 100%;
  border-collapse: collapse;
}

.demo-table th {
  background: #F8F9FB;
  padding: 8px 12px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
  text-align: left;
  border-bottom: 1px solid #F1F5F9;
}

.demo-table td {
  padding: 8px 12px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #64748B;
  border-bottom: 1px solid #F8F9FB;
}

.demo-table tr:last-child td {
  border-bottom: none;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left-panel {
    width: 100%;
    height: 120px;
    padding: 24px;
  }

  .left-panel-content {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: auto;
  }

  .logo-section {
    flex-direction: row;
    align-items: center;
    gap: 16px;
    flex: none;
  }

  .logo-mark {
    width: 36px;
    height: 36px;
    font-size: 14px;
    margin-bottom: 0;
  }

  .brand-name {
    font-size: 18px;
    margin-bottom: 0;
  }

  .tagline {
    display: none;
  }

  .copyright {
    margin-top: 0;
    font-size: 10px;
  }

  .login-right-panel {
    width: 100%;
    padding: 32px 24px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .tagline {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .login-right-panel {
    padding: 24px 16px;
  }

  .welcome-title {
    font-size: 22px;
  }
}
</style>