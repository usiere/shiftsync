<template>
  <v-btn
    v-if="wakeLockSupported"
    icon
    variant="text"
    class="me-2"
    :title="tooltip"
    size="large"
    @click="onClick"
  >
    <v-icon size="22" :color="wakeLockActive ? 'primary' : undefined">
      {{ wakeLockActive ? 'mdi-lock-check' : 'mdi-lock-open-outline' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationStore } from '../stores/notifications'
import { toggleWakeLock, wakeLockActive, wakeLockSupported } from '../utils/wakeLock'

const notify = useNotificationStore()

const tooltip = computed(() =>
  wakeLockActive.value
    ? 'Screen wake lock is ON — click to release'
    : 'Keep screen awake',
)

async function onClick() {
  const on = await toggleWakeLock()
  notify.showToast({
    type: on ? 'success' : 'info',
    title: on ? 'Screen wake lock on' : 'Screen wake lock off',
    message: on
      ? 'The screen will stay awake while this tab is open.'
      : 'The screen may sleep normally again.',
  })
}
</script>
