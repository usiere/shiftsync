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
        title="Memory sequence game"
        size="large"
      >
        <v-icon size="22">mdi-gamepad-variant-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Repeat the sequence</div>
      <div class="pad-grid">
        <button
          v-for="i in 4"
          :key="i"
          class="pad-btn"
          :class="[`pad-btn--${i}`, { 'pad-btn--flash': flashIndex === i - 1 }]"
          :disabled="!accepting"
          @click="press(i - 1)"
        />
      </div>
      <div class="mt-3 d-flex justify-center gap-8">
        <v-btn color="primary" size="small" :disabled="playing" @click="start">
          {{ started ? 'Restart' : 'Start' }}
        </v-btn>
      </div>
      <div class="text-caption text-medium-emphasis mt-2">
        Level {{ level }} · Best {{ best }}
      </div>
      <div v-if="lost" class="text-error text-caption mt-1">Wrong! Sequence was {{ sequence.length }} steps.</div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const sequence = ref<number[]>([])
const input = ref<number[]>([])
const flashIndex = ref<number | null>(null)
const started = ref(false)
const playing = ref(false)
const accepting = ref(false)
const level = ref(0)
const best = ref(0)
const lost = ref(false)

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

async function playbackSequence() {
  accepting.value = false
  playing.value = true
  await delay(400)
  for (const idx of sequence.value) {
    flashIndex.value = idx
    await delay(400)
    flashIndex.value = null
    await delay(180)
  }
  playing.value = false
  accepting.value = true
  input.value = []
}

async function start() {
  started.value = true
  lost.value = false
  level.value = 0
  sequence.value = []
  await nextRound()
}

async function nextRound() {
  const bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes)
  sequence.value = [...sequence.value, bytes[0] % 4]
  level.value = sequence.value.length
  await playbackSequence()
}

async function press(idx: number) {
  if (!accepting.value) return
  flashIndex.value = idx
  setTimeout(() => { flashIndex.value = null }, 180)
  input.value.push(idx)
  const step = input.value.length - 1
  if (input.value[step] !== sequence.value[step]) {
    lost.value = true
    accepting.value = false
    if (sequence.value.length - 1 > best.value) best.value = sequence.value.length - 1
    return
  }
  if (input.value.length === sequence.value.length) {
    accepting.value = false
    await delay(400)
    await nextRound()
  }
}
</script>

<style scoped>
.pad-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 200px;
  margin: 0 auto;
}

.pad-btn {
  height: 80px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  opacity: 0.65;
  transition: opacity 120ms ease, transform 120ms ease;
}

.pad-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.pad-btn--flash {
  opacity: 1;
  transform: scale(1.05);
}

.pad-btn--1 { background: #EF4444; }
.pad-btn--2 { background: #22C55E; }
.pad-btn--3 { background: #EAB308; }
.pad-btn--4 { background: #3B82F6; }

.pad-btn:disabled {
  cursor: not-allowed;
}

.gap-8 {
  gap: 8px;
}
</style>
