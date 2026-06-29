<template>
  <transition name="slide-down">
    <div v-if="visible" class="net-banner" :class="`net-banner--${state}`" role="status">
      <v-icon size="18" class="net-banner__icon">
        {{ state === 'offline' ? 'mdi-wifi-off' : 'mdi-wifi-check' }}
      </v-icon>
      <span class="net-banner__text">
        {{ state === 'offline'
          ? 'You are offline — changes may not be saved.'
          : 'Back online' }}
      </span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

type NetState = 'online' | 'offline'

const state = ref<NetState>(navigator.onLine ? 'online' : 'offline')
const visible = ref(state.value === 'offline')

let hideTimer: ReturnType<typeof setTimeout> | null = null

function clearHideTimer() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function handleOffline() {
  clearHideTimer()
  state.value = 'offline'
  visible.value = true
}

function handleOnline() {
  clearHideTimer()
  state.value = 'online'
  visible.value = true
  hideTimer = setTimeout(() => {
    visible.value = false
  }, 2500)
}

onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onBeforeUnmount(() => {
  clearHideTimer()
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
.net-banner {
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.12);
  pointer-events: none;
}

.net-banner--offline {
  background: #FEF2F2;
  color: #B91C1C;
  border: 1px solid #FECACA;
}

.net-banner--offline .net-banner__icon {
  color: #DC2626 !important;
}

.net-banner--online {
  background: #ECFDF5;
  color: #047857;
  border: 1px solid #A7F3D0;
}

.net-banner--online .net-banner__icon {
  color: #059669 !important;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 220ms ease, opacity 220ms ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translate(-50%, -120%);
  opacity: 0;
}
</style>
