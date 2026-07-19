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
        :title="recording ? 'Voice recording' : 'Voice recorder'"
        size="large"
      >
        <v-icon size="22" :color="recording ? 'error' : undefined">
          {{ recording ? 'mdi-record-circle' : 'mdi-microphone-plus' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Voice recorder</div>
      <div class="rec-time mb-3">{{ formatted }}</div>
      <div class="d-flex justify-center gap-8 mb-2">
        <v-btn
          v-if="!recording"
          color="error"
          size="small"
          prepend-icon="mdi-record"
          :disabled="!supported"
          @click="start"
        >
          Record
        </v-btn>
        <v-btn v-else color="primary" size="small" prepend-icon="mdi-stop" @click="stop">
          Stop
        </v-btn>
      </div>
      <audio v-if="url" :src="url" controls class="rec-audio" />
      <div v-if="url" class="d-flex justify-center gap-8 mt-2">
        <v-btn size="small" variant="text" :href="url" :download="`recording-${stamp}.webm`">
          <v-icon start size="16">mdi-download</v-icon>
          Save
        </v-btn>
        <v-btn size="small" variant="text" @click="clear">
          Clear
        </v-btn>
      </div>
      <div v-if="!supported" class="text-caption text-error mt-2">
        MediaRecorder not supported here.
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const open = ref(false)
const supported = typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
const recording = ref(false)
const url = ref('')
const elapsedMs = ref(0)
const stamp = ref('')
let recorder: MediaRecorder | null = null
let stream: MediaStream | null = null
let chunks: BlobPart[] = []
let startedAt = 0
let ticker: ReturnType<typeof setInterval> | null = null

const formatted = computed(() => {
  const total = Math.floor(elapsedMs.value / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
})

async function start() {
  if (!supported) return
  clear()
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    return
  }
  chunks = []
  recorder = new MediaRecorder(stream)
  recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'audio/webm' })
    url.value = URL.createObjectURL(blob)
    stamp.value = new Date().toISOString().replace(/[:.]/g, '-')
    stream?.getTracks().forEach((t) => t.stop())
    stream = null
  }
  recorder.start()
  recording.value = true
  startedAt = performance.now()
  elapsedMs.value = 0
  ticker = setInterval(() => { elapsedMs.value = performance.now() - startedAt }, 250)
}

function stop() {
  if (!recorder) return
  recorder.stop()
  recording.value = false
  if (ticker) clearInterval(ticker)
  ticker = null
  recorder = null
}

function clear() {
  if (url.value) URL.revokeObjectURL(url.value)
  url.value = ''
  elapsedMs.value = 0
}

onBeforeUnmount(() => {
  stop()
  clear()
})
</script>

<style scoped>
.rec-time {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 26px;
  font-weight: 700;
}

.rec-audio {
  width: 100%;
  margin-top: 8px;
}

.gap-8 {
  gap: 8px;
}
</style>
