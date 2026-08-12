<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="UUIDv1 timestamp decoder"
        size="large"
      >
        <v-icon size="22">mdi-identifier</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">UUID v1 Timestamp</div>
      <v-text-field
        v-model="input"
        label="UUID v1"
        density="compact"
        variant="outlined"
        hide-details
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="uv-badge">{{ isoDate }}</div>
        <div class="uv-row">
          <div class="uv-col">
            <div class="uv-label">Unix ms</div>
            <div class="uv-val">{{ unixMs }}</div>
          </div>
          <div class="uv-col">
            <div class="uv-label">Version</div>
            <div class="uv-val">{{ version }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const input = ref<string>('c232ab00-9414-11ec-b3c8-9e6bdeced846')

const cleaned = computed(() => (input.value || '').trim().toLowerCase().replace(/-/g, ''))

const error = computed(() => {
  const s = cleaned.value
  if (!/^[0-9a-f]{32}$/.test(s)) return 'Enter a 32-hex UUID'
  const ver = parseInt(s.charAt(12), 16)
  if (ver !== 1) return `Version ${ver} — not v1`
  return ''
})

const version = computed(() => parseInt(cleaned.value.charAt(12), 16))

const rawTicks = computed(() => {
  const s = cleaned.value
  const timeLow = s.slice(0, 8)
  const timeMid = s.slice(8, 12)
  const timeHi = s.slice(13, 16)
  return BigInt('0x' + timeHi + timeMid + timeLow)
})

const UUID_EPOCH_OFFSET_MS = 12219292800000n

const unixMs = computed(() => {
  const ms = rawTicks.value / 10000n - UUID_EPOCH_OFFSET_MS
  return ms.toString()
})

const isoDate = computed(() => {
  const ms = Number(rawTicks.value / 10000n - UUID_EPOCH_OFFSET_MS)
  return new Date(ms).toISOString()
})
</script>

<style scoped>
.uv-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 13px;
  background: #DBEAFE;
  color: #1E3A8A;
  word-break: break-all;
}

.uv-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.uv-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.uv-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.uv-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 11px;
  word-break: break-all;
}
</style>
