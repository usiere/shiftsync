<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Word scramble puzzle"
        size="large"
      >
        <v-icon size="22">mdi-shuffle-disabled</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Unscramble the word</div>
      <div class="scramble-display mb-2">
        <span v-for="(ch, i) in scrambled" :key="i" class="scramble-ch">{{ ch }}</span>
      </div>
      <v-text-field
        v-model="guess"
        label="Your guess"
        density="compact"
        variant="outlined"
        hide-details
        autofocus
        class="mb-2"
        @keydown.enter.prevent="check"
      />
      <div v-if="verdict" class="text-center mb-2" :class="`verdict verdict--${verdict}`">
        {{ verdict === 'ok' ? '✓ Correct!' : '✗ Try again' }}
      </div>
      <div class="d-flex justify-space-between">
        <v-btn size="small" variant="text" @click="hint">Hint</v-btn>
        <span class="text-caption text-medium-emphasis">
          Solved: {{ score }} · Round: {{ round }}
        </span>
        <v-btn size="small" variant="tonal" @click="skip">Skip</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const WORDS = [
  'javascript', 'component', 'browser', 'keyboard', 'terminal',
  'database', 'function', 'variable', 'closure', 'promise',
  'array', 'object', 'iterator', 'shadow', 'layout',
  'lightning', 'schedule', 'weekend', 'balance', 'command',
]

const answer = ref('')
const scrambled = ref<string[]>([])
const guess = ref('')
const verdict = ref<'' | 'ok' | 'no'>('')
const score = ref(0)
const round = ref(0)
let hintUsed = false

function shuffle(word: string): string[] {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const bytes = new Uint8Array(1)
    crypto.getRandomValues(bytes)
    const j = bytes[0] % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function newRound() {
  const bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes)
  answer.value = WORDS[bytes[0] % WORDS.length]
  let s = shuffle(answer.value)
  while (s.join('') === answer.value) s = shuffle(answer.value)
  scrambled.value = s
  guess.value = ''
  verdict.value = ''
  hintUsed = false
  round.value++
}

function check() {
  if (!guess.value) return
  if (guess.value.trim().toLowerCase() === answer.value) {
    verdict.value = 'ok'
    if (!hintUsed) score.value++
    setTimeout(newRound, 900)
  } else {
    verdict.value = 'no'
  }
}

function hint() {
  hintUsed = true
  guess.value = answer.value.slice(0, Math.min(2, answer.value.length))
}

function skip() {
  newRound()
}

onMounted(newRound)
</script>

<style scoped>
.scramble-display {
  display: flex;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.1);
}

.scramble-ch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 34px;
  border-radius: 4px;
  background: white;
  border: 1px solid rgba(148, 163, 184, 0.4);
  font-family: 'DM Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
}

.verdict {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
}

.verdict--ok { color: #16A34A; }
.verdict--no { color: #DC2626; }
</style>
