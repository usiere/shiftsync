<template>
  <div class="text-center py-12">
    <v-icon
      size="120"
      color="grey-lighten-2"
      class="mb-6"
    >
      mdi-compass-off
    </v-icon>
    
    <h1 class="text-h2 font-weight-bold mb-4">404</h1>
    <h2 class="text-h4 font-weight-medium mb-6">Page Not Found</h2>
    
    <p class="text-h6 text-grey mb-8 mx-auto" style="max-width: 500px;">
      Sorry, the page you're looking for doesn't exist or has been moved.
    </p>
    
    <div class="d-flex justify-center gap-4 flex-wrap">
      <v-btn
        size="large"
        color="primary"
        prepend-icon="mdi-home"
        @click="goHome"
      >
        Go Home
      </v-btn>
      
      <v-btn
        size="large"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        @click="goBack"
      >
        Go Back
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => {
  if (authStore.isAuthenticated && authStore.user) {
    const redirectPath = authStore.getRedirectPath(authStore.user.role)
    router.push(redirectPath)
  } else {
    router.push('/login')
  }
}

const goBack = () => {
  router.go(-1)
}
</script>