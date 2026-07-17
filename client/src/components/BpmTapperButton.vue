<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="BPM tapper"
        size="large"
      >
        <v-icon size="22">mdi-metronome</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Tap the beat</div>
      <button class="tap-pad" :class="{ 'tap-pad--pulse': pulse }" @click="tap">
        <v-icon size="30">mdi-hand-back-right</v-icon>
      </button>
      <div class="bpm-display mt-3">
        <span class="bpm-value">{{ bpm ? bpm.toFixed(0) : '—' }}</span>
        <span class="bpm-unit">BPM</span>
      </div>
      <div class="text-caption text-medium-emphasis mt-1">
        {{ tapCount }} tap{{ tapCount === 1 ? '' : 's' }}
      </div>
      <v-btn size="small" variant="text" class="mt-2" @click="reset">
        Reset
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const taps = ref<number[]>([])
const pulse = ref(false)

const tapCount = computed(() => taps.value.length)

const bpm = computed(() => {
  if (taps.value.length < 2) return 0
  const recent = taps.value.slice(-8)
  const diffs: number[] = []
  for (let i = 1; i < recent.length; i++) {
    diffs.push(recent[i] - recent[i - 1])
  }
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length
  if (avg <= 0) return 0
  return 60_000 / avg
})

function tap() {
  const t = performance.now()
  if (taps.value.length && t - taps.value[taps.value.length - 1] > 3000) {
    taps.value = []
  }
  taps.value.push(t)
  pulse.value = true
  setTimeout(() => { pulse.value = false }, 120)
}

function reset() {
  taps.value = []
}
</script>

<style scoped>
.tap-pad {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px solid rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.08);
  color: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 auto;
  transition: transform 100ms ease, background 100ms ease;
}

.tap-pad:hover {
  background: rgba(37, 99, 235, 0.14);
}

.tap-pad--pulse {
  transform: scale(1.08);
  background: rgba(37, 99, 235, 0.24);
}

.bpm-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
}

.bpm-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 32px;
  font-weight: 700;
}

.bpm-unit {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #94A3B8;
  letter-spacing: 0.05em;
}
</style>
