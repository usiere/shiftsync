<template>
  <v-btn
    v-if="email"
    icon
    variant="text"
    class="me-2"
    :title="`Copy ${email}`"
    size="large"
    @click="copyEmail"
  >
    <v-icon size="22">mdi-email-outline</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

const authStore = useAuthStore()
const notify = useNotificationStore()

const email = computed(() => authStore.user?.email ?? '')

async function copyEmail() {
  if (!email.value) return
  try {
    await navigator.clipboard.writeText(email.value)
    notify.showToast({
      type: 'success',
      title: 'Email copied',
      message: email.value,
    })
  } catch {
    notify.showToast({
      type: 'warning',
      title: 'Copy failed',
      message: 'Could not access clipboard.',
    })
  }
}
</script>
