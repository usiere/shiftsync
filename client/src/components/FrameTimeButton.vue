<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Frame time"
        size="large"
      >
        <v-icon size="22">mdi-timer-refresh-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Frame Time Budget</div>
      <v-select
        v-model.number="fps"
        :items="rates"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Refresh"
      />
      <v-text-field v-model.number="customFps" type="number" label="or custom Hz" density="compact" variant="outlined" hide-details min="1" class="mt-2" />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="ft-badge">{{ msBudget }} ms / frame</div>
        <div class="ft-row">
          <div class="ft-col">
            <div class="ft-label">µs</div>
            <div class="ft-val">{{ us }}</div>
          </div>
          <div class="ft-col">
            <div class="ft-label">Half (VSync jank)</div>
            <div class="ft-val">{{ half }} ms</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const fps = ref<number>(60)
const customFps = ref<number>(0)

const rates = [
  { label: '24 Hz (film)', value: 24 },
  { label: '30 Hz', value: 30 },
  { label: '60 Hz', value: 60 },
  { label: '90 Hz', value: 90 },
  { label: '120 Hz', value: 120 },
  { label: '144 Hz', value: 144 },
  { label: '165 Hz', value: 165 },
  { label: '240 Hz', value: 240 },
]

const effective = computed(() => Number(customFps.value) > 0 ? Number(customFps.value) : Number(fps.value))

const error = computed(() => {
  if (!Number.isFinite(effective.value) || effective.value <= 0) return 'Enter positive Hz'
  return ''
})

const msBudget = computed(() => round(1000 / effective.value))
const us = computed(() => Math.round((1_000_000 / effective.value) * 10) / 10)
const half = computed(() => round(2000 / effective.value))

function round(v: number) {
  return Math.round(v * 1000) / 1000
}
</script>

<style scoped>
.ft-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 18px;
  background: #E0F2FE;
  color: #075985;
}

.ft-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.ft-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.ft-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.ft-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}
</style>
