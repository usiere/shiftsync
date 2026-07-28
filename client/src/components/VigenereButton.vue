<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Vigenère cipher"
        size="large"
      >
        <v-icon size="22">mdi-key-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Vigenère cipher</div>
      <v-text-field
        v-model="key"
        label="Key (letters)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-textarea
        v-model="text"
        label="Text"
        density="compact"
        variant="outlined"
        hide-details
        rows="3"
        no-resize
        class="mb-2"
      />
      <div class="vg-out mb-2">
        <div class="text-caption text-medium-emphasis">Encoded</div>
        <div class="vg-mono">{{ encoded || '—' }}</div>
      </div>
      <div class="vg-out">
        <div class="text-caption text-medium-emphasis">Decoded</div>
        <div class="vg-mono">{{ decoded || '—' }}</div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const key = ref('SHIFTSYNC')
const text = ref('')

function stripKey(k: string): string {
  return k.replace(/[^A-Za-z]/g, '').toUpperCase()
}

function shift(ch: string, k: number): string {
  const code = ch.charCodeAt(0)
  if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + k + 26) % 26) + 65)
  if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + k + 26) % 26) + 97)
  return ch
}

function process(t: string, k: string, direction: 1 | -1): string {
  const key = stripKey(k)
  if (!key) return t
  let ki = 0
  let out = ''
  for (const ch of t) {
    if (/[A-Za-z]/.test(ch)) {
      const shiftBy = (key.charCodeAt(ki % key.length) - 65) * direction
      out += shift(ch, shiftBy)
      ki++
    } else {
      out += ch
    }
  }
  return out
}

const encoded = computed(() => process(text.value, key.value, 1))
const decoded = computed(() => process(text.value, key.value, -1))
</script>

<style scoped>
.vg-out {
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
}

.vg-mono {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #1E40AF;
  word-break: break-all;
}
</style>
