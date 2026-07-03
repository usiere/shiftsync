<template>
  <div v-if="visible" class="uptime-chip" :title="fullLabel">
    <v-icon size="14" class="uptime-chip__icon">mdi-timer-sand</v-icon>
    <span class="uptime-chip__value">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { formatUptime, getSessionStart, markSessionStart } from '../utils/sessionUptime'

const authStore = useAuthStore()
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const start = computed(() => getSessionStart())

const visible = computed(() => authStore.isAuthenticated && start.value != null)

const label = computed(() => {
  if (start.value == null) return ''
  return formatUptime(now.value - start.value)
})

const fullLabel = computed(() => {
  if (start.value == null) return ''
  const started = new Date(start.value).toLocaleString()
  return `Signed in ${label.value} ago — since ${started}`
})

onMounted(() => {
  if (authStore.isAuthenticated) {
    markSessionStart()
  }
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.uptime-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.uptime-chip__icon {
  color: #94A3B8 !important;
}

.uptime-chip__value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1200px) {
  .uptime-chip {
    display: none;
  }
}
</style>
