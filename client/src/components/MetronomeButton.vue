<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="playing ? `Metronome ${bpm} BPM` : 'Metronome'"
        size="large"
      >
        <v-icon size="22" :color="playing ? 'primary' : undefined">
          {{ playing ? 'mdi-metronome-tick' : 'mdi-metronome' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Metronome</div>
      <div class="metro-display">
        <span class="metro-bpm">{{ bpm }}</span>
        <span class="metro-unit">BPM</span>
      </div>
      <div class="metro-dots mb-2">
        <div
          v-for="i in beats"
          :key="i"
          class="metro-dot"
          :class="{ 'metro-dot--active': playing && (i - 1) === (beatIndex % beats) }"
        />
      </div>
      <div class="d-flex align-center gap-8 mb-2">
        <v-icon size="16">mdi-minus</v-icon>
        <v-slider v-model="bpm" :min="30" :max="240" :step="1" hide-details density="compact" class="flex-grow-1" />
        <v-icon size="16">mdi-plus</v-icon>
      </div>
      <v-select v-model="beats" :items="[2, 3, 4, 6, 8]" label="Beats" density="compact" variant="outlined" hide-details class="mb-2" />
      <v-btn v-if="!playing" color="primary" size="small" block prepend-icon="mdi-play" @click="start">
        Start
      </v-btn>
      <v-btn v-else color="error" size="small" block prepend-icon="mdi-stop" @click="stop">
        Stop
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const playing = ref(false)
const bpm = ref(90)
const beats = ref(4)
const beatIndex = ref(0)
let ctx: AudioContext | null = null
let timer: ReturnType<typeof setInterval> | null = null

function click(strong: boolean) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = strong ? 1200 : 800
  gain.gain.value = strong ? 0.4 : 0.25
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.09)
}

function tick() {
  const strong = beatIndex.value % beats.value === 0
  click(strong)
  beatIndex.value++
}

function start() {
  stop()
  ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  beatIndex.value = 0
  playing.value = true
  tick()
  timer = setInterval(tick, 60_000 / bpm.value)
}

function stop() {
  playing.value = false
  if (timer) clearInterval(timer)
  timer = null
  ctx?.close()
  ctx = null
}

watch(bpm, () => {
  if (playing.value) {
    if (timer) clearInterval(timer)
    timer = setInterval(tick, 60_000 / bpm.value)
  }
})

watch(beats, () => {
  beatIndex.value = 0
})

onBeforeUnmount(stop)
</script>

<style scoped>
.metro-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 8px;
}

.metro-bpm {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 28px;
  font-weight: 700;
}

.metro-unit {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #94A3B8;
}

.metro-dots {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.metro-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: transparent;
  transition: background 80ms ease;
}

.metro-dot--active {
  background: #2563EB;
  border-color: #2563EB;
}

.gap-8 {
  gap: 8px;
}
</style>
