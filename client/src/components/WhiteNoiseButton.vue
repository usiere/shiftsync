<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="playing ? `Playing ${flavor} noise` : 'Ambient noise'"
        size="large"
      >
        <v-icon size="22" :color="playing ? 'primary' : undefined">
          {{ playing ? 'mdi-volume-high' : 'mdi-waveform' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="text-subtitle-2 mb-2">Ambient noise</div>
      <v-btn-toggle
        :model-value="flavor"
        @update:model-value="setFlavor"
        mandatory
        density="compact"
        class="mb-3"
        divided
      >
        <v-btn value="white" size="small">White</v-btn>
        <v-btn value="pink" size="small">Pink</v-btn>
        <v-btn value="brown" size="small">Brown</v-btn>
      </v-btn-toggle>

      <div class="d-flex align-center gap-8 mb-3">
        <v-icon size="16">mdi-volume-low</v-icon>
        <v-slider
          v-model="volume"
          :min="0"
          :max="1"
          :step="0.01"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <v-icon size="16">mdi-volume-high</v-icon>
      </div>

      <div class="d-flex">
        <v-btn v-if="!playing" color="primary" size="small" prepend-icon="mdi-play" @click="start">
          Play
        </v-btn>
        <v-btn v-else color="error" size="small" prepend-icon="mdi-stop" @click="stop">
          Stop
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

type Flavor = 'white' | 'pink' | 'brown'

const playing = ref(false)
const flavor = ref<Flavor>('white')
const volume = ref(0.4)

let ctx: AudioContext | null = null
let source: AudioBufferSourceNode | null = null
let gain: GainNode | null = null

function makeBuffer(context: AudioContext, kind: Flavor): AudioBuffer {
  const seconds = 2
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate)
  const data = buffer.getChannelData(0)
  if (kind === 'white') {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  } else if (kind === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + w * 0.0555179
      b1 = 0.99332 * b1 + w * 0.0750759
      b2 = 0.96900 * b2 + w * 0.1538520
      b3 = 0.86650 * b3 + w * 0.3104856
      b4 = 0.55000 * b4 + w * 0.5329522
      b5 = -0.7616 * b5 - w * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
      b6 = w * 0.115926
    }
  } else {
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02
      data[i] = last * 3.5
    }
  }
  return buffer
}

function start() {
  stop()
  ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  source = ctx.createBufferSource()
  source.buffer = makeBuffer(ctx, flavor.value)
  source.loop = true
  gain = ctx.createGain()
  gain.gain.value = volume.value
  source.connect(gain).connect(ctx.destination)
  source.start()
  playing.value = true
}

function stop() {
  try { source?.stop() } catch { /* ignore */ }
  source?.disconnect()
  gain?.disconnect()
  ctx?.close()
  source = null
  gain = null
  ctx = null
  playing.value = false
}

function setFlavor(v: Flavor) {
  flavor.value = v
  if (playing.value) start()
}

watch(volume, (v) => {
  if (gain) gain.gain.value = v
})

onBeforeUnmount(() => {
  stop()
})
</script>

<style scoped>
.gap-8 {
  gap: 8px;
}
</style>
