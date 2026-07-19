<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <button v-bind="props" class="mc-btn" :class="{ 'mc-btn--running': running }" :title="tooltip">
        <v-icon size="18" class="mc-btn__icon">mdi-cash-clock</v-icon>
        <span v-if="running || cost > 0" class="mc-btn__label">${{ Math.round(cost) }}</span>
      </button>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="d-flex gap-8 mb-3">
        <v-text-field
          v-model.number="attendees"
          type="number"
          label="Attendees"
          density="compact"
          variant="outlined"
          hide-details
          min="1"
        />
        <v-text-field
          v-model.number="rate"
          type="number"
          label="Rate ($/hr)"
          density="compact"
          variant="outlined"
          hide-details
          min="0"
        />
      </div>

      <div class="mc-display text-center mb-2">
        <div class="mc-total">${{ cost.toFixed(2) }}</div>
        <div class="mc-time">{{ formattedTime }}</div>
      </div>

      <div class="d-flex justify-center gap-8">
        <v-btn v-if="!running" color="primary" size="small" prepend-icon="mdi-play" @click="start">
          Start
        </v-btn>
        <v-btn v-else color="warning" size="small" prepend-icon="mdi-pause" @click="pause">
          Pause
        </v-btn>
        <v-btn size="small" variant="text" prepend-icon="mdi-refresh" @click="reset">
          Reset
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const attendees = ref(4)
const rate = ref(80)
const running = ref(false)
const accumulated = ref(0)
const startedAt = ref(0)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null

const elapsedMs = computed(() => {
  if (running.value) return accumulated.value + (now.value - startedAt.value)
  return accumulated.value
})

const cost = computed(() => {
  const hours = elapsedMs.value / 3_600_000
  return hours * rate.value * attendees.value
})

const formattedTime = computed(() => {
  const totalSec = Math.floor(elapsedMs.value / 1000)
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const s = String(totalSec % 60).padStart(2, '0')
  return `${m}:${s}`
})

const tooltip = computed(() =>
  running.value
    ? `Meeting cost so far: $${cost.value.toFixed(2)}`
    : 'Meeting cost timer',
)

function start() {
  running.value = true
  startedAt.value = Date.now()
  ticker = setInterval(() => { now.value = Date.now() }, 1000)
}

function pause() {
  if (!running.value) return
  accumulated.value += Date.now() - startedAt.value
  running.value = false
  if (ticker) clearInterval(ticker)
  ticker = null
}

function reset() {
  running.value = false
  accumulated.value = 0
  startedAt.value = 0
  if (ticker) clearInterval(ticker)
  ticker = null
}

onBeforeUnmount(reset)
</script>

<style scoped>
.mc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  margin-right: 8px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}

.mc-btn:hover {
  background: rgba(148, 163, 184, 0.08);
}

.mc-btn__icon {
  color: #94A3B8 !important;
}

.mc-btn--running {
  border-color: #FDE68A;
  background: #FEF3C7;
  color: #92400E;
}

.mc-btn--running .mc-btn__icon {
  color: #B45309 !important;
}

.mc-display {
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.mc-total {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 28px;
  font-weight: 700;
  color: #DC2626;
}

.mc-time {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #94A3B8;
  margin-top: 2px;
}

.gap-8 {
  gap: 8px;
}
</style>
