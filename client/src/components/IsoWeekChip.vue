<template>
  <div class="iso-week" :title="fullLabel">
    <v-icon size="14" class="iso-week__icon">mdi-calendar-week</v-icon>
    <span class="iso-week__label">Wk {{ week }}</span>
    <span class="iso-week__year">'{{ shortYear }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

function isoWeekAndYear(d: Date): { week: number; year: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { week, year: date.getUTCFullYear() }
}

const iso = computed(() => isoWeekAndYear(now.value))
const week = computed(() => iso.value.week)
const shortYear = computed(() => String(iso.value.year).slice(-2))

const fullLabel = computed(
  () => `ISO week ${iso.value.week} of ${iso.value.year}`
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
.iso-week {
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

.iso-week__icon {
  color: #94A3B8 !important;
}

.iso-week__label {
  font-variant-numeric: tabular-nums;
}

.iso-week__year {
  color: #94A3B8;
  font-size: 10px;
  letter-spacing: 0.03em;
}

@media (max-width: 900px) {
  .iso-week {
    display: none;
  }
}
</style>
