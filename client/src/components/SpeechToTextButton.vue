<template>
  <v-menu
    v-if="supported"
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
        :title="listening ? 'Speech-to-text (listening)' : 'Speech-to-text'"
        size="large"
      >
        <v-icon size="22" :color="listening ? 'error' : undefined">
          {{ listening ? 'mdi-microphone' : 'mdi-microphone-outline' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <div class="d-flex align-center mb-2">
        <v-btn
          v-if="!listening"
          color="primary"
          size="small"
          prepend-icon="mdi-microphone"
          @click="startListening"
        >
          Start
        </v-btn>
        <v-btn v-else color="error" size="small" prepend-icon="mdi-stop" @click="stopListening">
          Stop
        </v-btn>
        <span v-if="listening" class="text-caption text-medium-emphasis ms-3">
          Listening…
        </span>
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!transcript" @click="clear">
          Clear
        </v-btn>
      </div>
      <div class="stt-out mb-2">
        <div v-if="!transcript && !interim" class="text-caption text-medium-emphasis">
          Say something…
        </div>
        <div v-else>
          <span>{{ transcript }}</span>
          <span class="stt-interim">{{ interim }}</span>
        </div>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!transcript" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

interface SpeechEventResult {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechEvent {
  resultIndex: number
  results: ArrayLike<SpeechEventResult>
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((e: SpeechEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

interface WindowWithSR extends Window {
  SpeechRecognition?: new () => SpeechRecognitionLike
  webkitSpeechRecognition?: new () => SpeechRecognitionLike
}

const w = window as WindowWithSR
const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
const supported = !!Ctor
const open = ref(false)
const listening = ref(false)
const transcript = ref('')
const interim = ref('')
const notify = useNotificationStore()
let recognition: SpeechRecognitionLike | null = null

function startListening() {
  if (!Ctor) return
  recognition = new Ctor()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = navigator.language || 'en-US'
  recognition.onresult = (event) => {
    let finalPart = ''
    let interimPart = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i]
      if (r.isFinal) finalPart += r[0].transcript
      else interimPart += r[0].transcript
    }
    if (finalPart) transcript.value = (transcript.value + ' ' + finalPart).trim()
    interim.value = interimPart
  }
  recognition.onerror = () => {
    listening.value = false
  }
  recognition.onend = () => {
    listening.value = false
    interim.value = ''
  }
  try {
    recognition.start()
    listening.value = true
  } catch {
    listening.value = false
  }
}

function stopListening() {
  recognition?.stop()
  listening.value = false
}

function clear() {
  transcript.value = ''
  interim.value = ''
}

async function copy() {
  try {
    await navigator.clipboard.writeText(transcript.value)
    notify.showToast({
      type: 'success',
      title: 'Transcript copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}

onBeforeUnmount(() => {
  stopListening()
})
</script>

<style scoped>
.stt-out {
  min-height: 80px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  line-height: 1.5;
  max-height: 200px;
  overflow-y: auto;
}

.stt-interim {
  color: #94A3B8;
  font-style: italic;
  margin-left: 4px;
}
</style>
