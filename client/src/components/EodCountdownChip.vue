<template>
  <div class="eod-chip" :class="stateClass" :title="tooltip">
    <v-icon size="14" class="eod-chip__icon">{{ icon }}</v-icon>
    <span class="eod-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const EOD_HOUR = 17

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const eod = computed(() => {
  const d = new Date(now.value)
  d.setHours(EOD_HOUR, 0, 0, 0)
  return d
})

const state = computed(() => {
  const dow = now.value.getDay()
  if (dow === 0 || dow === 6) return 'weekend'
  if (now.value.getTime() < eod.value.getTime()) return 'before'
  return 'after'
})

const label = computed(() => {
  if (state.value === 'weekend') return 'Weekend'
  if (state.value === 'after') return 'EOD reached'
  const ms = eod.value.getTime() - now.value.getTime()
  const totalMin = Math.max(0, Math.round(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `EOD in ${h}h ${m}m`
  return `EOD in ${m}m`
})

const icon = computed(() => {
  if (state.value === 'weekend') return 'mdi-beach'
  if (state.value === 'after') return 'mdi-flag-checkered'
  return 'mdi-briefcase-clock-outline'
})

const stateClass = computed(() => `eod-chip--${state.value}`)

const tooltip = computed(() => `Working day ends at ${EOD_HOUR}:00 local time`)

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
.eod-chip {
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

.eod-chip__icon {
  color: #94A3B8 !important;
}

.eod-chip--after {
  background: #F0FDF4;
  border-color: #86EFAC;
  color: #166534;
}

.eod-chip--after .eod-chip__icon { color: #16A34A !important; }

.eod-chip--weekend {
  background: #FEF3C7;
  border-color: #FDE68A;
  color: #92400E;
}

.eod-chip--weekend .eod-chip__icon { color: #B45309 !important; }

@media (max-width: 1300px) {
  .eod-chip {
    display: none;
  }
}
</style>
