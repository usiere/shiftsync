<template>
  <div class="tod-chip" :class="`tod-chip--${state.key}`" :title="tooltip">
    <v-icon size="14" class="tod-chip__icon">{{ state.icon }}</v-icon>
    <span class="tod-chip__label">{{ state.label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const state = computed(() => {
  const h = now.value.getHours()
  if (h < 5) return { key: 'night', label: 'Night', icon: 'mdi-weather-night' }
  if (h < 8) return { key: 'dawn', label: 'Dawn', icon: 'mdi-weather-sunset-up' }
  if (h < 12) return { key: 'morning', label: 'Morning', icon: 'mdi-weather-sunny' }
  if (h < 17) return { key: 'day', label: 'Afternoon', icon: 'mdi-white-balance-sunny' }
  if (h < 20) return { key: 'dusk', label: 'Dusk', icon: 'mdi-weather-sunset-down' }
  return { key: 'night', label: 'Night', icon: 'mdi-weather-night' }
})

const tooltip = computed(
  () => `Time of day: ${state.value.label} (based on local hour)`,
)

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
.tod-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.tod-chip__icon {
  color: #94A3B8 !important;
}

.tod-chip--dawn { background: #FEF3C7; border-color: #FDE68A; color: #92400E; }
.tod-chip--dawn .tod-chip__icon { color: #B45309 !important; }

.tod-chip--morning { background: #FFFBEB; border-color: #FDE68A; color: #A16207; }
.tod-chip--morning .tod-chip__icon { color: #EAB308 !important; }

.tod-chip--day { background: #EFF6FF; border-color: #BFDBFE; color: #1E40AF; }
.tod-chip--day .tod-chip__icon { color: #2563EB !important; }

.tod-chip--dusk { background: #FEE2E2; border-color: #FCA5A5; color: #991B1B; }
.tod-chip--dusk .tod-chip__icon { color: #DC2626 !important; }

.tod-chip--night { background: #E0E7FF; border-color: #C7D2FE; color: #3730A3; }
.tod-chip--night .tod-chip__icon { color: #4F46E5 !important; }

@media (max-width: 1200px) {
  .tod-chip {
    display: none;
  }
}
</style>
