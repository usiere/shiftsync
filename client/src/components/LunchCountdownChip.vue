<template>
  <div class="lunch-chip" :class="stateClass" :title="tooltip">
    <v-icon size="14" class="lunch-chip__icon">{{ icon }}</v-icon>
    <span class="lunch-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const LUNCH_HOUR = 12
const LUNCH_MIN = 30
const LUNCH_END_HOUR = 13
const LUNCH_END_MIN = 30

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const lunchStart = computed(() => {
  const d = new Date(now.value)
  d.setHours(LUNCH_HOUR, LUNCH_MIN, 0, 0)
  return d
})

const lunchEnd = computed(() => {
  const d = new Date(now.value)
  d.setHours(LUNCH_END_HOUR, LUNCH_END_MIN, 0, 0)
  return d
})

const state = computed(() => {
  if (now.value < lunchStart.value) return 'before'
  if (now.value < lunchEnd.value) return 'during'
  return 'after'
})

const label = computed(() => {
  const ms =
    state.value === 'before'
      ? lunchStart.value.getTime() - now.value.getTime()
      : state.value === 'during'
        ? lunchEnd.value.getTime() - now.value.getTime()
        : 0
  const totalMin = Math.max(0, Math.round(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (state.value === 'after') return 'Lunch done'
  if (state.value === 'during') {
    if (h > 0) return `Lunch: ${h}h ${m}m left`
    return `Lunch: ${m}m left`
  }
  if (h > 0) return `Lunch in ${h}h ${m}m`
  return `Lunch in ${m}m`
})

const icon = computed(() => {
  if (state.value === 'during') return 'mdi-silverware-fork-knife'
  if (state.value === 'after') return 'mdi-food-apple-outline'
  return 'mdi-food-outline'
})

const stateClass = computed(() => `lunch-chip--${state.value}`)

const tooltip = computed(
  () => `Lunch window: ${LUNCH_HOUR}:${String(LUNCH_MIN).padStart(2, '0')}–${LUNCH_END_HOUR}:${String(LUNCH_END_MIN).padStart(2, '0')} local`,
)

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.lunch-chip {
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

.lunch-chip__icon {
  color: #94A3B8 !important;
}

.lunch-chip--during {
  background: #FEF3C7;
  border-color: #FDE68A;
  color: #92400E;
}

.lunch-chip--during .lunch-chip__icon { color: #B45309 !important; }

.lunch-chip--after {
  color: #94A3B8;
}

@media (max-width: 1300px) {
  .lunch-chip {
    display: none;
  }
}
</style>
