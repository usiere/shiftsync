<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Rough network speed test"
        size="large"
      >
        <v-icon size="22">mdi-speedometer</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Rough download test</div>
      <div class="speed-display mb-3">
        <div class="speed-value">{{ mbps }}</div>
        <div class="speed-unit">Mbps</div>
      </div>
      <div class="text-caption text-medium-emphasis mb-2">
        {{ status }}
      </div>
      <v-btn color="primary" size="small" :disabled="running" @click="run">
        <v-icon start size="16">mdi-play</v-icon>
        {{ mbps ? 'Re-run' : 'Start' }}
      </v-btn>
      <div class="text-caption text-medium-emphasis mt-2">
        Fetches a small sample from your own origin — real speeds may differ.
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const running = ref(false)
const bytes = ref(0)
const elapsedMs = ref(0)
const status = ref('Ready.')

const mbps = computed(() => {
  if (!elapsedMs.value || !bytes.value) return '—'
  const bitsPerSec = (bytes.value * 8) / (elapsedMs.value / 1000)
  return (bitsPerSec / 1_000_000).toFixed(2)
})

async function run() {
  running.value = true
  status.value = 'Measuring…'
  bytes.value = 0
  elapsedMs.value = 0
  try {
    const start = performance.now()
    let total = 0
    // Cache-busted requests to small assets in the current origin
    for (let i = 0; i < 5; i++) {
      const url = `${window.location.origin}/favicon.ico?_=${Date.now()}-${i}`
      const res = await fetch(url, { cache: 'no-store' })
      const buf = await res.arrayBuffer()
      total += buf.byteLength
    }
    elapsedMs.value = performance.now() - start
    bytes.value = total
    status.value = `Downloaded ${(total / 1024).toFixed(1)} kB in ${elapsedMs.value.toFixed(0)} ms`
  } catch {
    status.value = 'Measurement failed.'
  } finally {
    running.value = false
  }
}
</script>

<style scoped>
.speed-display {
  padding: 12px;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.08);
}

.speed-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 32px;
  font-weight: 700;
  color: #1E40AF;
}

.speed-unit {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #64748B;
}
</style>
