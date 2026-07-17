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
        title="Morse code converter"
        size="large"
      >
        <v-icon size="22">mdi-morse-code</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-btn-toggle v-model="mode" mandatory density="compact" class="mb-2" divided>
        <v-btn value="encode" size="small">Text → Morse</v-btn>
        <v-btn value="decode" size="small">Morse → Text</v-btn>
      </v-btn-toggle>

      <v-textarea
        v-model="input"
        :label="mode === 'encode' ? 'Text' : 'Morse (dots/dashes)'"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />

      <div class="morse-out mb-2">
        <div v-if="error" class="text-error text-body-2">{{ error }}</div>
        <div v-else class="morse-out__value">{{ output || '—' }}</div>
      </div>

      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!output" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')
const notify = useNotificationStore()

const MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
  G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
  M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
  S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '@': '.--.-.',
}

const REVERSE = Object.fromEntries(Object.entries(MAP).map(([k, v]) => [v, k]))

const error = ref('')

const output = computed(() => {
  error.value = ''
  if (!input.value.trim()) return ''
  if (mode.value === 'encode') {
    return input.value
      .toUpperCase()
      .split('')
      .map((ch) => {
        if (ch === ' ') return ' / '
        return MAP[ch] ?? ''
      })
      .filter(Boolean)
      .join(' ')
  }
  const words = input.value.trim().split(/\s*\/\s*/)
  const parts: string[] = []
  for (const word of words) {
    const chars = word.trim().split(/\s+/).map((code) => {
      const c = REVERSE[code]
      if (!c && code) throw new Error(`Unknown code: ${code}`)
      return c ?? ''
    })
    parts.push(chars.join(''))
  }
  try {
    return parts.join(' ')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Decode failed'
    return ''
  }
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Morse copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.morse-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.morse-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
