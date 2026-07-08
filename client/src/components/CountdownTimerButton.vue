<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <button v-bind="props" class="cd-btn" :class="{ 'cd-btn--running': timerRunning }" :title="tooltip">
        <v-icon size="18" class="cd-btn__icon">mdi-timer-sand</v-icon>
        <span v-if="timerRunning" class="cd-btn__label">{{ timerLabel }}</span>
      </button>
    </template>

    <v-list density="compact" min-width="220">
      <v-list-subheader>Countdown timer</v-list-subheader>
      <template v-if="!timerRunning">
        <v-list-item v-for="opt in options" :key="opt" @click="startCountdown(opt)">
          <template v-slot:prepend>
            <v-icon size="18">mdi-play</v-icon>
          </template>
          <v-list-item-title>{{ opt }} minute{{ opt === 1 ? '' : 's' }}</v-list-item-title>
        </v-list-item>
      </template>
      <template v-if="timerRunning">
        <v-list-item>
          <template v-slot:prepend>
            <v-icon size="18">mdi-timer-outline</v-icon>
          </template>
          <v-list-item-title>{{ timerLabel }} left</v-list-item-title>
        </v-list-item>
        <v-list-item @click="stopCountdown">
          <template v-slot:prepend>
            <v-icon size="18" color="error">mdi-stop</v-icon>
          </template>
          <v-list-item-title>Cancel timer</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  onCountdownExpiry,
  startCountdown,
  stopCountdown,
  timerLabel,
  timerRunning,
} from '../utils/countdownTimer'
import { useNotificationStore } from '../stores/notifications'

const notify = useNotificationStore()
const options = [1, 5, 10, 15, 25, 45, 60]

let unsub: (() => void) | null = null

onMounted(() => {
  unsub = onCountdownExpiry(() => {
    notify.showToast({
      type: 'success',
      title: 'Timer done',
      message: 'Your countdown finished.',
      timeout: 8000,
    })
  })
})

onBeforeUnmount(() => {
  unsub?.()
  unsub = null
})

const tooltip = computed(() =>
  timerRunning.value ? `Countdown: ${timerLabel.value} left` : 'Start a countdown timer',
)
</script>

<style scoped>
.cd-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  margin-right: 8px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}

.cd-btn:hover {
  background: rgba(148, 163, 184, 0.08);
}

.cd-btn__icon {
  color: #94A3B8 !important;
}

.cd-btn--running {
  border-color: #93C5FD;
  background: #EFF6FF;
  color: #1E40AF;
}

.cd-btn--running .cd-btn__icon {
  color: #2563EB !important;
}
</style>
