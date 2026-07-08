<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <button v-bind="props" class="sw-btn" :class="{ 'sw-btn--running': running }" title="Stopwatch">
        <v-icon size="18" class="sw-btn__icon">mdi-timer-check-outline</v-icon>
        <span v-if="running || elapsedMs > 0" class="sw-btn__label">{{ label }}</span>
      </button>
    </template>

    <v-card min-width="240" class="pa-3">
      <div class="sw-display text-h5 mb-3">{{ labelDetail }}</div>
      <div class="d-flex gap-8 mb-3">
        <v-btn
          v-if="!running"
          color="primary"
          size="small"
          prepend-icon="mdi-play"
          @click="start"
        >
          {{ elapsedMs > 0 ? 'Resume' : 'Start' }}
        </v-btn>
        <v-btn v-else color="warning" size="small" prepend-icon="mdi-pause" @click="pause">
          Pause
        </v-btn>
        <v-btn size="small" variant="text" prepend-icon="mdi-flag-outline" :disabled="!running" @click="lap">
          Lap
        </v-btn>
        <v-btn size="small" variant="text" color="error" prepend-icon="mdi-refresh" @click="reset">
          Reset
        </v-btn>
      </div>

      <div v-if="laps.length" class="sw-laps">
        <div v-for="(l, i) in laps" :key="i" class="sw-lap-row">
          <span class="sw-lap-idx">#{{ laps.length - i }}</span>
          <span class="sw-lap-total">{{ format(l.total) }}</span>
          <span class="sw-lap-split text-medium-emphasis">+{{ format(l.split) }}</span>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

interface Lap {
  total: number
  split: number
}

const running = ref(false)
const startedAt = ref(0)
const accumulated = ref(0)
const nowTs = ref(Date.now())
const laps = ref<Lap[]>([])
let ticker: ReturnType<typeof setInterval> | null = null

const elapsedMs = computed(() => {
  if (running.value) return accumulated.value + (nowTs.value - startedAt.value)
  return accumulated.value
})

function format(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  const ds = Math.floor((ms % 1000) / 100)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ds}`
}

const label = computed(() => format(elapsedMs.value))
const labelDetail = computed(() => format(elapsedMs.value))

function start() {
  if (running.value) return
  running.value = true
  startedAt.value = Date.now()
  ticker = setInterval(() => {
    nowTs.value = Date.now()
  }, 100)
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
  laps.value = []
  if (ticker) clearInterval(ticker)
  ticker = null
}

function lap() {
  const total = elapsedMs.value
  const prev = laps.value[0]?.total ?? 0
  laps.value.unshift({ total, split: total - prev })
}

onBeforeUnmount(() => {
  if (ticker) clearInterval(ticker)
  ticker = null
})
</script>

<style scoped>
.sw-btn {
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

.sw-btn:hover {
  background: rgba(148, 163, 184, 0.08);
}

.sw-btn__icon {
  color: #94A3B8 !important;
}

.sw-btn--running {
  border-color: #86EFAC;
  background: #F0FDF4;
  color: #166534;
}

.sw-btn--running .sw-btn__icon {
  color: #16A34A !important;
}

.sw-display {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.sw-laps {
  max-height: 160px;
  overflow-y: auto;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  padding-top: 8px;
}

.sw-lap-row {
  display: flex;
  gap: 12px;
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  padding: 2px 0;
}

.sw-lap-idx {
  width: 32px;
  color: #94A3B8;
}

.sw-lap-total {
  flex: 1;
}

.gap-8 {
  gap: 8px;
}
</style>
