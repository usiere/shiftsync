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
        :title="running ? `Box breathing (${phase})` : 'Box breathing timer'"
        size="large"
      >
        <v-icon size="22" :color="running ? 'primary' : undefined">
          {{ running ? 'mdi-meditation' : 'mdi-lungs' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Box breathing (4·4·4·4)</div>
      <div class="breath-stage">
        <div class="breath-ring" :class="`breath-ring--${phase}`" />
        <div class="breath-label">
          <div class="breath-label__phase">{{ phaseLabel }}</div>
          <div class="breath-label__count">{{ secondsLeft }}</div>
        </div>
      </div>

      <div class="mt-3">
        <v-btn v-if="!running" color="primary" size="small" prepend-icon="mdi-play" @click="start">
          Start
        </v-btn>
        <v-btn v-else color="error" size="small" prepend-icon="mdi-stop" @click="stop">
          Stop
        </v-btn>
      </div>
      <div v-if="running" class="text-caption text-medium-emphasis mt-2">
        Cycle {{ cycles }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out'

const PHASE_ORDER: Phase[] = ['inhale', 'hold-in', 'exhale', 'hold-out']
const PHASE_LEN = 4

const open = ref(false)
const running = ref(false)
const phase = ref<Phase>('inhale')
const secondsLeft = ref(PHASE_LEN)
const cycles = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const phaseLabel = computed(() => {
  switch (phase.value) {
    case 'inhale': return 'Breathe in'
    case 'hold-in': return 'Hold'
    case 'exhale': return 'Breathe out'
    case 'hold-out': return 'Hold'
  }
})

function start() {
  running.value = true
  phase.value = 'inhale'
  secondsLeft.value = PHASE_LEN
  cycles.value = 1
  timer = setInterval(tick, 1000)
}

function stop() {
  running.value = false
  if (timer) clearInterval(timer)
  timer = null
}

function tick() {
  secondsLeft.value -= 1
  if (secondsLeft.value <= 0) {
    const idx = PHASE_ORDER.indexOf(phase.value)
    const next = PHASE_ORDER[(idx + 1) % PHASE_ORDER.length]
    phase.value = next
    secondsLeft.value = PHASE_LEN
    if (next === 'inhale') cycles.value++
  }
}

onBeforeUnmount(() => {
  stop()
})
</script>

<style scoped>
.breath-stage {
  position: relative;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breath-ring {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid #93C5FD;
  transition: transform 4s ease-in-out, background 400ms ease;
  background: #EFF6FF;
}

.breath-ring--inhale {
  transform: scale(1.4);
  background: #DBEAFE;
}

.breath-ring--hold-in {
  transform: scale(1.4);
  background: #DBEAFE;
}

.breath-ring--exhale {
  transform: scale(0.7);
  background: #F1F5F9;
}

.breath-ring--hold-out {
  transform: scale(0.7);
  background: #F1F5F9;
}

.breath-label {
  position: relative;
  z-index: 1;
  text-align: center;
}

.breath-label__phase {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #1E40AF;
}

.breath-label__count {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 22px;
  font-weight: 700;
  color: #1E40AF;
}
</style>
