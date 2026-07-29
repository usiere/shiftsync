<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="XOR cipher"
        size="large"
      >
        <v-icon size="22">mdi-xml</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">XOR cipher</div>
      <v-text-field
        v-model="key"
        label="Key"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-textarea
        v-model="text"
        label="Text (or paste hex to decode)"
        density="compact"
        variant="outlined"
        hide-details
        rows="3"
        no-resize
        class="mb-2"
      />
      <div class="xc-out">
        <div class="text-caption text-medium-emphasis">Encoded (hex)</div>
        <div class="xc-mono">{{ encodedHex || '—' }}</div>
      </div>
      <div class="xc-out">
        <div class="text-caption text-medium-emphasis">Decoded from hex</div>
        <div class="xc-mono">{{ decoded || '—' }}</div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const key = ref('secret')
const text = ref('')

function xorBytes(bytes: Uint8Array, k: string): Uint8Array {
  if (!k) return bytes
  const keyBytes = new TextEncoder().encode(k)
  const out = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    out[i] = bytes[i] ^ keyBytes[i % keyBytes.length]
  }
  return out
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex: string): Uint8Array | null {
  const clean = hex.replace(/\s+/g, '').toLowerCase()
  if (!clean || clean.length % 2 !== 0 || /[^0-9a-f]/.test(clean)) return null
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) out[i / 2] = parseInt(clean.substr(i, 2), 16)
  return out
}

const encodedHex = computed(() => {
  if (!text.value) return ''
  const bytes = new TextEncoder().encode(text.value)
  return toHex(xorBytes(bytes, key.value))
})

const decoded = computed(() => {
  const parsed = fromHex(text.value)
  if (!parsed) return ''
  try {
    return new TextDecoder().decode(xorBytes(parsed, key.value))
  } catch { return '' }
})
</script>

<style scoped>
.xc-out {
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
}

.xc-mono {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #1E40AF;
  word-break: break-all;
  max-height: 80px;
  overflow-y: auto;
}
</style>
