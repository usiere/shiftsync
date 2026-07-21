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
        title="AES-GCM text cipher"
        size="large"
      >
        <v-icon size="22">mdi-shield-key-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <v-btn-toggle v-model="mode" mandatory density="compact" class="mb-2" divided>
        <v-btn value="encrypt" size="small">Encrypt</v-btn>
        <v-btn value="decrypt" size="small">Decrypt</v-btn>
      </v-btn-toggle>
      <v-text-field
        v-model="password"
        type="password"
        label="Password"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-textarea
        v-model="input"
        :label="mode === 'encrypt' ? 'Text' : 'Encrypted (base64)'"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />
      <div v-if="error" class="text-error text-body-2 mb-2">{{ error }}</div>
      <div class="aes-out mb-2">
        <div v-if="pending" class="text-caption text-medium-emphasis">Working…</div>
        <div v-else class="aes-out__value">{{ output || '—' }}</div>
      </div>
      <div class="d-flex">
        <v-btn size="small" variant="tonal" color="primary" @click="run" :disabled="!password || !input">
          {{ mode === 'encrypt' ? 'Encrypt' : 'Decrypt' }}
        </v-btn>
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
import { ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const mode = ref<'encrypt' | 'decrypt'>('encrypt')
const password = ref('')
const input = ref('')
const output = ref('')
const error = ref('')
const pending = ref(false)
const notify = useNotificationStore()

async function keyFrom(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 200_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

function toBase64(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function fromBase64(s: string): Uint8Array {
  const bin = atob(s.trim())
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function run() {
  error.value = ''
  output.value = ''
  pending.value = true
  try {
    if (mode.value === 'encrypt') {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const key = await keyFrom(password.value, salt)
      const cipher = new Uint8Array(
        await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(input.value)),
      )
      const combined = new Uint8Array(salt.length + iv.length + cipher.length)
      combined.set(salt, 0)
      combined.set(iv, salt.length)
      combined.set(cipher, salt.length + iv.length)
      output.value = toBase64(combined)
    } else {
      const bytes = fromBase64(input.value)
      if (bytes.length < 29) throw new Error('Ciphertext too short')
      const salt = bytes.slice(0, 16)
      const iv = bytes.slice(16, 28)
      const cipher = bytes.slice(28)
      const key = await keyFrom(password.value, salt)
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher)
      output.value = new TextDecoder().decode(plain)
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Operation failed'
  } finally {
    pending.value = false
  }
}

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Value copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.aes-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.aes-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
