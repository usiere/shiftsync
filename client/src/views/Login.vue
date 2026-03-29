<template>
  <v-form
    ref="form"
    v-model="valid"
    @submit.prevent="handleSubmit"
  >
    <v-text-field
      v-model="credentials.email"
      :rules="emailRules"
      label="Email"
      type="email"
      prepend-inner-icon="mdi-email"
      variant="outlined"
      class="mb-2"
      required
    ></v-text-field>

    <v-text-field
      v-model="credentials.password"
      :rules="passwordRules"
      :type="showPassword ? 'text' : 'password'"
      label="Password"
      prepend-inner-icon="mdi-lock"
      :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      variant="outlined"
      class="mb-4"
      required
      @click:append-inner="showPassword = !showPassword"
    ></v-text-field>

    <v-alert
      v-if="authStore.error"
      type="error"
      class="mb-4"
      variant="tonal"
    >
      {{ authStore.error }}
    </v-alert>

    <v-btn
      :loading="authStore.isLoading"
      :disabled="!valid"
      type="submit"
      color="primary"
      block
      size="large"
      class="mb-4"
    >
      Sign In
    </v-btn>

    <div class="text-center mb-4">
      <v-chip
        variant="outlined"
        size="small"
        class="me-2 mb-2"
        @click="fillDemoCredentials('admin')"
      >
        Demo Admin
      </v-chip>
      <v-chip
        variant="outlined"
        size="small"
        class="me-2 mb-2"
        @click="fillDemoCredentials('manager')"
      >
        Demo Manager
      </v-chip>
      <v-chip
        variant="outlined"
        size="small"
        class="mb-2"
        @click="fillDemoCredentials('staff')"
      >
        Demo Staff
      </v-chip>
    </div>

    <v-card variant="outlined" class="pa-4">
      <v-card-subtitle class="text-center mb-2">Test Credentials</v-card-subtitle>
      <div class="text-body-2">
        <div><strong>Admin:</strong> admin@coastaleats.com / password</div>
        <div><strong>Manager:</strong> manager1@coastaleats.com / password</div>
        <div><strong>Staff:</strong> staff1@coastaleats.com / password</div>
      </div>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref()
const valid = ref(false)
const showPassword = ref(false)

const credentials = reactive({
  email: '',
  password: ''
})

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

const fillDemoCredentials = (role: 'admin' | 'manager' | 'staff') => {
  const demoCredentials = {
    admin: { email: 'admin@coastaleats.com', password: 'password' },
    manager: { email: 'manager1@coastaleats.com', password: 'password' },
    staff: { email: 'staff1@coastaleats.com', password: 'password' }
  }

  credentials.email = demoCredentials[role].email
  credentials.password = demoCredentials[role].password
}

const handleSubmit = async () => {
  if (!valid.value) return

  const result = await authStore.login(credentials)

  if (result.success) {
    // Redirect based on user role
    const redirectPath = authStore.getRedirectPath(authStore.user?.role || 'STAFF')
    router.push(redirectPath)
  }
}
</script>

<style scoped>
.v-chip {
  cursor: pointer;
}

.v-chip:hover {
  opacity: 0.8;
}
</style>