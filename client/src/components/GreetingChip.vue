<template>
  <div v-if="visible" class="greeting-chip" :title="fullLabel">
    <v-icon size="14" class="greeting-chip__icon">{{ icon }}</v-icon>
    <span class="greeting-chip__text">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const firstName = computed(() => {
  const name = authStore.userName || ''
  return name.trim().split(/\s+/)[0] || ''
})

const period = computed<'morning' | 'afternoon' | 'evening' | 'night'>(() => {
  const h = now.value.getHours()
  if (h < 5) return 'night'
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  if (h < 22) return 'evening'
  return 'night'
})

const icon = computed(() => {
  switch (period.value) {
    case 'morning': return 'mdi-weather-sunset-up'
    case 'afternoon': return 'mdi-weather-sunny'
    case 'evening': return 'mdi-weather-sunset-down'
    default: return 'mdi-weather-night'
  }
})

const greeting = computed(() => {
  switch (period.value) {
    case 'morning': return 'Good morning'
    case 'afternoon': return 'Good afternoon'
    case 'evening': return 'Good evening'
    default: return 'Working late'
  }
})

const label = computed(() =>
  firstName.value ? `${greeting.value}, ${firstName.value}` : greeting.value
)

const fullLabel = computed(() => `${label.value} — local time`)

const visible = computed(() => authStore.isAuthenticated && !!firstName.value)

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.greeting-chip {
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

.greeting-chip__icon {
  color: #F59E0B !important;
}

@media (max-width: 1000px) {
  .greeting-chip {
    display: none;
  }
}
</style>
