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
        title="Flip text upside-down"
        size="large"
      >
        <v-icon size="22">mdi-format-textdirection-l-to-r</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-textarea
        v-model="input"
        label="Text"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />
      <div class="flip-out mb-2">
        <div class="flip-out__value">{{ output || '—' }}</div>
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
const input = ref('')
const notify = useNotificationStore()

const MAP: Record<string, string> = {
  a: 'ɐ', b: 'q', c: 'ɔ', d: 'p', e: 'ǝ', f: 'ɟ', g: 'ƃ', h: 'ɥ',
  i: 'ᴉ', j: 'ɾ', k: 'ʞ', l: 'ʃ', m: 'ɯ', n: 'u', o: 'o', p: 'd',
  q: 'b', r: 'ɹ', s: 's', t: 'ʇ', u: 'n', v: 'ʌ', w: 'ʍ', x: 'x',
  y: 'ʎ', z: 'z',
  A: '∀', B: 'ᙠ', C: 'Ↄ', D: 'ᗡ', E: 'Ǝ', F: 'Ⅎ', G: '⅁', H: 'H',
  I: 'I', J: 'ſ', K: 'ʞ', L: '˥', M: 'W', N: 'N', O: 'O', P: 'Ԁ',
  Q: 'Ό', R: 'ᴚ', S: 'S', T: '⊥', U: '∩', V: 'Λ', W: 'M', X: 'X',
  Y: '⅄', Z: 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ',
  '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': "'", '?': '¿', '!': '¡', "'": ',', '"': ',,',
  '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '&': '⅋', '_': '‾',
}

const output = computed(() => {
  const flipped = input.value.split('').map((c) => MAP[c] ?? c).reverse()
  return flipped.join('')
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Flipped text copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.flip-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.flip-out__value {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
