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
        :title="speaking ? 'Text to speech (speaking)' : 'Text to speech'"
        size="large"
      >
        <v-icon size="22" :color="speaking ? 'primary' : undefined">
          {{ speaking ? 'mdi-volume-high' : 'mdi-text-to-speech' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-textarea
        v-model="text"
        label="Text"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />

      <div class="d-flex align-center gap-8 mb-2">
        <span class="text-caption text-medium-emphasis" style="width: 40px">Rate</span>
        <v-slider v-model="rate" :min="0.5" :max="2" :step="0.1" hide-details density="compact" class="flex-grow-1" />
        <span class="text-caption" style="width: 32px; text-align: right">{{ rate.toFixed(1) }}</span>
      </div>
      <div class="d-flex align-center gap-8 mb-3">
        <span class="text-caption text-medium-emphasis" style="width: 40px">Pitch</span>
        <v-slider v-model="pitch" :min="0" :max="2" :step="0.1" hide-details density="compact" class="flex-grow-1" />
        <span class="text-caption" style="width: 32px; text-align: right">{{ pitch.toFixed(1) }}</span>
      </div>

      <div class="d-flex">
        <v-btn v-if="!speaking" color="primary" size="small" prepend-icon="mdi-play" :disabled="!text" @click="speak">
          Speak
        </v-btn>
        <v-btn v-else color="error" size="small" prepend-icon="mdi-stop" @click="stop">
          Stop
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const supported = 'speechSynthesis' in window
const open = ref(false)
const text = ref('Hello — this is a spoken preview.')
const rate = ref(1)
const pitch = ref(1)
const speaking = ref(false)
let current: SpeechSynthesisUtterance | null = null

function speak() {
  if (!supported || !text.value) return
  window.speechSynthesis.cancel()
  current = new SpeechSynthesisUtterance(text.value)
  current.rate = rate.value
  current.pitch = pitch.value
  current.onstart = () => { speaking.value = true }
  current.onend = () => { speaking.value = false; current = null }
  current.onerror = () => { speaking.value = false; current = null }
  window.speechSynthesis.speak(current)
}

function stop() {
  if (!supported) return
  window.speechSynthesis.cancel()
  speaking.value = false
  current = null
}

onBeforeUnmount(() => {
  stop()
})
</script>

<style scoped>
.gap-8 {
  gap: 8px;
}
</style>
