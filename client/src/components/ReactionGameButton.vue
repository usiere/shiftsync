<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Reaction-time game"
        size="large"
      >
        <v-icon size="22">mdi-timer-alert-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Reaction time</div>
      <button class="rt-pad" :class="`rt-pad--${state}`" @click="onClick">
        <div class="rt-msg">{{ message }}</div>
      </button>
      <div class="text-caption text-medium-emphasis mt-2">
        Best: {{ best === Infinity ? '—' : best + ' ms' }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type State = 'idle' | 'waiting' | 'go' | 'result' | 'early'

const state = ref<State>('idle')
const last = ref<number | null>(null)
const best = ref<number>(Infinity)
let waitTimeout: ReturnType<typeof setTimeout> | null = null
let goAt = 0

const message = computed(() => {
  switch (state.value) {
    case 'idle': return 'Click to start'
    case 'waiting': return 'Wait for green…'
    case 'go': return 'CLICK!'
    case 'early': return 'Too early — retry'
    case 'result': return `${last.value} ms`
  }
})

function onClick() {
  if (state.value === 'idle' || state.value === 'result' || state.value === 'early') {
    startWait()
    return
  }
  if (state.value === 'waiting') {
    if (waitTimeout) clearTimeout(waitTimeout)
    waitTimeout = null
    state.value = 'early'
    return
  }
  if (state.value === 'go') {
    const ms = Math.round(performance.now() - goAt)
    last.value = ms
    if (ms < best.value) best.value = ms
    state.value = 'result'
  }
}

function startWait() {
  state.value = 'waiting'
  const bytes = new Uint16Array(1)
  crypto.getRandomValues(bytes)
  const delay = 1500 + (bytes[0] % 2500)
  waitTimeout = setTimeout(() => {
    state.value = 'go'
    goAt = performance.now()
  }, delay)
}

onBeforeUnmount(() => {
  if (waitTimeout) clearTimeout(waitTimeout)
  waitTimeout = null
})
</script>

<style scoped>
.rt-pad {
  width: 200px;
  height: 130px;
  margin: 0 auto;
  border: none;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 100ms ease;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 15px;
}

.rt-pad--idle { background: #1F2937; }
.rt-pad--waiting { background: #DC2626; }
.rt-pad--go { background: #16A34A; }
.rt-pad--result { background: #2563EB; }
.rt-pad--early { background: #B91C1C; }

.rt-msg {
  font-family: 'DM Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.05em;
}
</style>
