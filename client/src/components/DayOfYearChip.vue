<template>
  <div class="doy-chip" :title="tooltip">
    <v-icon size="14" class="doy-chip__icon">mdi-calendar-today</v-icon>
    <span class="doy-chip__label">Day {{ dayOfYear }}</span>
    <span class="doy-chip__meta">/{{ totalDays }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

const dayOfYear = computed(() => {
  const start = new Date(now.value.getFullYear(), 0, 0)
  const diff = now.value.getTime() - start.getTime()
  return Math.floor(diff / 86_400_000)
})

const totalDays = computed(() => (isLeapYear(now.value.getFullYear()) ? 366 : 365))

const tooltip = computed(
  () =>
    `Day ${dayOfYear.value} of ${totalDays.value} in ${now.value.getFullYear()} ` +
    `(${((dayOfYear.value / totalDays.value) * 100).toFixed(1)}% through)`,
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
.doy-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.doy-chip__icon {
  color: #94A3B8 !important;
}

.doy-chip__meta {
  color: #94A3B8;
}

@media (max-width: 1200px) {
  .doy-chip {
    display: none;
  }
}
</style>
