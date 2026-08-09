<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Race pace"
        size="large"
      >
        <v-icon size="22">mdi-run</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Race Pace</div>
      <v-select
        v-model="distanceKm"
        :items="races"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Distance"
        class="mb-2"
      />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="paceMin" type="number" label="Pace min" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="paceSec" type="number" label="Pace sec" density="compact" variant="outlined" hide-details min="0" max="59" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="rp-badge">{{ timeStr }}</div>
        <div class="rp-note">Pace/km: {{ paceKm }} · Pace/mi: {{ paceMile }} · Avg: {{ kph }} km/h</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const distanceKm = ref<number>(42.195)
const paceMin = ref<number>(5)
const paceSec = ref<number>(0)

const races = [
  { label: '5 K', value: 5 },
  { label: '10 K', value: 10 },
  { label: 'Half Marathon (21.1 K)', value: 21.0975 },
  { label: 'Marathon (42.2 K)', value: 42.195 },
  { label: '50 K', value: 50 },
]

const error = computed(() => {
  const m = Number(paceMin.value)
  const s = Number(paceSec.value)
  if (!Number.isFinite(m) || !Number.isFinite(s)) return 'Enter pace'
  if (m < 0 || s < 0 || s >= 60) return 'Invalid pace'
  if (m === 0 && s === 0) return 'Pace must be > 0'
  return ''
})

const paceSecPerKm = computed(() => Number(paceMin.value) * 60 + Number(paceSec.value))
const totalSec = computed(() => paceSecPerKm.value * Number(distanceKm.value))

const timeStr = computed(() => fmtHMS(totalSec.value))
const kph = computed(() => round(3600 / paceSecPerKm.value))
const paceKm = computed(() => fmtMS(paceSecPerKm.value))
const paceMile = computed(() => fmtMS(paceSecPerKm.value * 1.609344))

function fmtHMS(t: number) {
  const s = Math.round(t)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${pad(m)}:${pad(sec)}`
}

function fmtMS(t: number) {
  const s = Math.round(t)
  return `${Math.floor(s / 60)}:${pad(s % 60)}`
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.rp-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 22px;
  background: #FFE4E6;
  color: #9F1239;
}

.rp-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
