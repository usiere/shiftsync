<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Chess clock"
        size="large"
      >
        <v-icon size="22">mdi-chess-king</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="cc-row">
        <button
          class="cc-side"
          :class="{ 'cc-side--active': active === 'w', 'cc-side--flag': msW <= 0 }"
          @click="switchTo('b')"
        >
          <div class="cc-label">White</div>
          <div class="cc-time">{{ fmt(msW) }}</div>
        </button>
        <button
          class="cc-side"
          :class="{ 'cc-side--active': active === 'b', 'cc-side--flag': msB <= 0 }"
          @click="switchTo('w')"
        >
          <div class="cc-label">Black</div>
          <div class="cc-time">{{ fmt(msB) }}</div>
        </button>
      </div>
      <div class="d-flex gap-8 mt-3">
        <v-text-field
          v-model.number="mins"
          type="number"
          label="Minutes"
          density="compact"
          variant="outlined"
          hide-details
          min="1"
        />
        <v-text-field
          v-model.number="incSec"
          type="number"
          label="+sec"
          density="compact"
          variant="outlined"
          hide-details
          min="0"
        />
        <v-btn size="small" variant="tonal" @click="reset">Reset</v-btn>
      </div>
      <div class="d-flex justify-center mt-2">
        <v-btn v-if="!running && !finished" color="primary" size="small" @click="start('w')">
          Start
        </v-btn>
        <v-btn v-else-if="running" size="small" variant="text" @click="pause">Pause</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const mins = ref(5)
const incSec = ref(3)
const msW = ref(5 * 60_000)
const msB = ref(5 * 60_000)
const active = ref<'w' | 'b' | null>(null)
const running = ref(false)
const finished = computed(() => msW.value <= 0 || msB.value <= 0)
let ticker: ReturnType<typeof setInterval> | null = null
let lastTick = 0

function fmt(ms: number): string {
  const clamped = Math.max(0, ms)
  const totalSec = Math.floor(clamped / 1000)
  const m = String(Math.floor(totalSec / 60)).padStart(2, '0')
  const s = String(totalSec % 60).padStart(2, '0')
  return `${m}:${s}`
}

function tick() {
  const now = performance.now()
  const dt = now - lastTick
  lastTick = now
  if (active.value === 'w') msW.value -= dt
  else if (active.value === 'b') msB.value -= dt
  if (msW.value <= 0 || msB.value <= 0) pause()
}

function start(side: 'w' | 'b') {
  reset()
  active.value = side
  running.value = true
  lastTick = performance.now()
  ticker = setInterval(tick, 100)
}

function pause() {
  running.value = false
  if (ticker) clearInterval(ticker)
  ticker = null
}

function switchTo(next: 'w' | 'b') {
  if (finished.value) return
  if (!running.value && !active.value) {
    start(next)
    return
  }
  if (!running.value || next === active.value) return
  if (active.value === 'w') msW.value += incSec.value * 1000
  else if (active.value === 'b') msB.value += incSec.value * 1000
  active.value = next
  lastTick = performance.now()
}

function reset() {
  pause()
  msW.value = mins.value * 60_000
  msB.value = mins.value * 60_000
  active.value = null
}

onBeforeUnmount(pause)
</script>

<style scoped>
.cc-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.cc-side {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: transparent;
  border-radius: 10px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}

.cc-side:hover {
  background: rgba(148, 163, 184, 0.08);
}

.cc-side--active {
  background: rgba(37, 99, 235, 0.12);
  border-color: #2563EB;
  color: #1E40AF;
}

.cc-side--flag {
  background: #FEF2F2;
  border-color: #FCA5A5;
  color: #991B1B;
}

.cc-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.cc-side--active .cc-label,
.cc-side--flag .cc-label {
  color: inherit;
}

.cc-time {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 24px;
  font-weight: 700;
}

.gap-8 {
  gap: 8px;
}
</style>
