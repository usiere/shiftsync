<template>
  <div class="we-chip" :class="stateClass" :title="tooltip">
    <v-icon size="14" class="we-chip__icon">{{ icon }}</v-icon>
    <span class="we-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const WEEKEND_HOUR = 17

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const state = computed(() => {
  const d = now.value.getDay()
  if (d === 0 || d === 6) return 'weekend'
  return 'weekday'
})

const nextFridayEnd = computed(() => {
  const d = new Date(now.value)
  const day = d.getDay()
  const untilFri = (5 - day + 7) % 7
  d.setDate(d.getDate() + untilFri)
  d.setHours(WEEKEND_HOUR, 0, 0, 0)
  return d
})

const label = computed(() => {
  if (state.value === 'weekend') return 'Weekend'
  const ms = nextFridayEnd.value.getTime() - now.value.getTime()
  const totalMin = Math.max(0, Math.round(ms / 60_000))
  const days = Math.floor(totalMin / (24 * 60))
  const hours = Math.floor((totalMin % (24 * 60)) / 60)
  const mins = totalMin % 60
  if (days > 0) return `Weekend in ${days}d ${hours}h`
  if (hours > 0) return `Weekend in ${hours}h ${mins}m`
  return `Weekend in ${mins}m`
})

const icon = computed(() => (state.value === 'weekend' ? 'mdi-beach' : 'mdi-calendar-arrow-right'))

const stateClass = computed(() => `we-chip--${state.value}`)

const tooltip = computed(
  () => `Countdown to Friday ${WEEKEND_HOUR}:00 (${nextFridayEnd.value.toLocaleString()})`,
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
.we-chip {
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

.we-chip__icon {
  color: #94A3B8 !important;
}

.we-chip--weekend {
  background: #FEF3C7;
  border-color: #FDE68A;
  color: #92400E;
}

.we-chip--weekend .we-chip__icon {
  color: #B45309 !important;
}

@media (max-width: 1300px) {
  .we-chip {
    display: none;
  }
}
</style>
