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
        title="Decode a JWT"
        size="large"
      >
        <v-icon size="22">mdi-key-chain-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="380" class="pa-3">
      <v-textarea
        v-model="input"
        label="Paste JWT"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />
      <div v-if="error" class="text-error text-body-2 mb-2">{{ error }}</div>
      <template v-else>
        <div class="jwt-block mb-2">
          <div class="jwt-label">Header</div>
          <pre class="jwt-pre">{{ header }}</pre>
        </div>
        <div class="jwt-block mb-2">
          <div class="jwt-label">Payload</div>
          <pre class="jwt-pre">{{ payload }}</pre>
        </div>
        <div v-if="expiryInfo" class="text-caption text-medium-emphasis">
          {{ expiryInfo }}
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const input = ref('')

function decodePart(part: string): unknown {
  const padded = part.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const raw = atob(padded + pad)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return JSON.parse(new TextDecoder().decode(bytes))
}

interface Decoded {
  header: string
  payload: string
  exp?: number
  error?: string
}

const decoded = computed<Decoded>(() => {
  const raw = input.value.trim()
  if (!raw) return { header: '', payload: '' }
  const parts = raw.split('.')
  if (parts.length < 2) return { header: '', payload: '', error: 'Not a JWT (missing dot)' }
  try {
    const h = decodePart(parts[0])
    const p = decodePart(parts[1]) as { exp?: number }
    return {
      header: JSON.stringify(h, null, 2),
      payload: JSON.stringify(p, null, 2),
      exp: p.exp,
    }
  } catch (e) {
    return { header: '', payload: '', error: e instanceof Error ? e.message : 'Decode failed' }
  }
})

const error = computed(() => decoded.value.error ?? '')
const header = computed(() => decoded.value.header)
const payload = computed(() => decoded.value.payload)

const expiryInfo = computed(() => {
  if (!decoded.value.exp) return ''
  const d = new Date(decoded.value.exp * 1000)
  const ms = d.getTime() - Date.now()
  const min = Math.round(ms / 60_000)
  if (ms <= 0) return `Expired ${d.toLocaleString()}`
  return `Expires ${d.toLocaleString()} (in ${min} min)`
})
</script>

<style scoped>
.jwt-block {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.jwt-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.jwt-pre {
  margin: 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 160px;
  overflow: auto;
}
</style>
