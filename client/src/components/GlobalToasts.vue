<template>
  <div class="global-toasts">
    <v-snackbar
      v-for="toast in visibleToasts"
      :key="toast.id"
      v-model="toast.show"
      :color="getSnackbarColor(toast.type)"
      :timeout="toast.timeout || 5000"
      location="top right"
      variant="elevated"
      class="toast-item"
      multi-line
    >
      <div class="d-flex align-center">
        <v-icon v-if="toast.icon" class="me-3" size="24">
          {{ toast.icon }}
        </v-icon>
        <div>
          <div class="font-weight-medium text-body-1">{{ toast.title }}</div>
          <div class="text-body-2 text-medium-emphasis">{{ toast.message }}</div>
        </div>
      </div>

      <template v-slot:actions>
        <v-btn
          variant="text"
          size="small"
          @click="notificationStore.removeToast(toast.id)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '../stores/notifications'
import { doNotDisturb } from '../utils/dnd'

const notificationStore = useNotificationStore()

const visibleToasts = computed(() =>
  doNotDisturb.value ? [] : notificationStore.toasts
)

function getSnackbarColor(type: string): string {
  switch (type) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'primary'
  }
}
</script>

<style scoped>
.global-toasts {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  margin-bottom: 8px;
}

:deep(.v-snackbar__wrapper) {
  min-width: 350px;
  max-width: 500px;
}

:deep(.v-snackbar__content) {
  padding: 16px 16px 16px 20px;
}
</style>