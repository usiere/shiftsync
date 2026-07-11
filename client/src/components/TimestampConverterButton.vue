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
        title="Timestamp converter"
        size="large"
      >
        <v-icon size="22">mdi-clock-time-eight-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model="epochInput"
          label="Unix (seconds)"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="fromEpoch"
        />
        <v-btn size="small" variant="tonal" @click="useNow">Now</v-btn>
      </div>

      <v-text-field
        v-model="isoInput"
        label="ISO 8601"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
        @update:model-value="fromIso"
      />

      <div v-if="error" class="text-error text-caption mb-2">{{ error }}</div>
      <template v-else>
        <div class="ts-row">
          <span class="ts-label">Local</span>
          <code class="ts-value">{{ localLabel }}</code>
        </div>
        <div class="ts-row">
          <span class="ts-label">UTC</span>
          <code class="ts-value">{{ utcLabel }}</code>
        </div>
        <div class="ts-row">
          <span class="ts-label">Relative</span>
          <code class="ts-value">{{ relativeLabel }}</code>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const open = ref(false)
const epochInput = ref<string>(String(Math.floor(Date.now() / 1000)))
const isoInput = ref<string>('')
const error = ref('')
const parsed = ref<Date | null>(new Date())

function fromEpoch(raw: string) {
  error.value = ''
  const n = parseFloat(raw)
  if (!Number.isFinite(n)) {
    parsed.value = null
    error.value = 'Invalid Unix timestamp'
    return
  }
  const ms = raw.length > 10 ? n : n * 1000
  const d = new Date(ms)
  parsed.value = d
  isoInput.value = d.toISOString()
}

function fromIso(raw: string) {
  error.value = ''
  if (!raw) { parsed.value = null; return }
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) {
    parsed.value = null
    error.value = 'Invalid ISO date'
    return
  }
  parsed.value = d
  epochInput.value = String(Math.floor(d.getTime() / 1000))
}

function useNow() {
  const d = new Date()
  parsed.value = d
  epochInput.value = String(Math.floor(d.getTime() / 1000))
  isoInput.value = d.toISOString()
}

watch(open, (v) => {
  if (v && !isoInput.value && parsed.value) {
    isoInput.value = parsed.value.toISOString()
  }
})

const localLabel = computed(() => parsed.value?.toLocaleString() ?? '—')
const utcLabel = computed(() => parsed.value?.toUTCString() ?? '—')

const relativeLabel = computed(() => {
  if (!parsed.value) return '—'
  const diff = parsed.value.getTime() - Date.now()
  const abs = Math.abs(diff)
  const sec = Math.round(abs / 1000)
  const min = Math.round(sec / 60)
  const hr = Math.round(min / 60)
  const day = Math.round(hr / 24)
  const suffix = diff < 0 ? 'ago' : 'from now'
  if (sec < 60) return `${sec}s ${suffix}`
  if (min < 60) return `${min}m ${suffix}`
  if (hr < 48) return `${hr}h ${suffix}`
  return `${day}d ${suffix}`
})
</script>

<style scoped>
.ts-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.ts-label {
  width: 60px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ts-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
}

.gap-8 {
  gap: 8px;
}
</style>
