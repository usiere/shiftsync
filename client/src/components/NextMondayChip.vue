<template>
  <div class="nm-chip" :title="tooltip">
    <v-icon size="14" class="nm-chip__icon">mdi-calendar-arrow-right</v-icon>
    <span class="nm-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

function nextMondayAt(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const daysUntil = day === 1 ? 7 : (8 - day) % 7 || 7
  d.setDate(d.getDate() + daysUntil)
  d.setHours(9, 0, 0, 0)
  return d
}

const remaining = computed(() => nextMondayAt(now.value).getTime() - now.value.getTime())

const label = computed(() => {
  const ms = Math.max(0, remaining.value)
  const totalMinutes = Math.floor(ms / 60_000)
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes / 60) % 24)
  const minutes = totalMinutes % 60
  if (days > 0) return `Mon in ${days}d ${hours}h`
  if (hours > 0) return `Mon in ${hours}h ${minutes}m`
  return `Mon in ${minutes}m`
})

const tooltip = computed(() => {
  const target = nextMondayAt(now.value)
  return `Next Monday: ${target.toLocaleString()}`
})

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
.nm-chip {
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

.nm-chip__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1200px) {
  .nm-chip {
    display: none;
  }
}
</style>
