<template>
  <v-btn
    v-if="canInstall"
    variant="tonal"
    color="primary"
    size="small"
    class="me-2 install-btn"
    prepend-icon="mdi-download"
    @click="install"
  >
    Install app
  </v-btn>
</template>

<script setup lang="ts">
import { canInstall, promptInstall } from '../utils/installPrompt'
import { useNotificationStore } from '../stores/notifications'

const notify = useNotificationStore()

async function install() {
  const outcome = await promptInstall()
  if (outcome === 'accepted') {
    notify.showToast({
      type: 'success',
      title: 'App installed',
      message: 'ShiftSync is now available from your home screen.',
    })
  } else if (outcome === 'unavailable') {
    notify.showToast({
      type: 'info',
      title: 'Install unavailable',
      message: 'Your browser has not offered an install prompt yet.',
    })
  }
}
</script>

<style scoped>
.install-btn {
  text-transform: none;
  font-weight: 500;
}
</style>
