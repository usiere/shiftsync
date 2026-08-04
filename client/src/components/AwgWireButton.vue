<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="AWG wire gauge"
        size="large"
      >
        <v-icon size="22">mdi-cable-data</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">AWG Wire Gauge</div>
      <v-text-field
        v-model.number="awg"
        type="number"
        label="AWG (0000 = -3 … 40)"
        density="compact"
        variant="outlined"
        hide-details
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="aw-row">
          <div class="aw-col">
            <div class="aw-label">Diameter</div>
            <div class="aw-val">{{ diameter }} mm</div>
          </div>
          <div class="aw-col">
            <div class="aw-label">Area</div>
            <div class="aw-val">{{ area }} mm²</div>
          </div>
        </div>
        <div class="aw-note">Approx safe ampacity: {{ ampacity }} A (chassis)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const awg = ref<number>(12)

const error = computed(() => {
  const n = Number(awg.value)
  if (!Number.isFinite(n)) return 'Enter a number'
  if (n < -3 || n > 40) return 'Range -3 (0000) to 40'
  return ''
})

const diameter = computed(() => {
  const n = Number(awg.value)
  const dInch = 0.005 * Math.pow(92, (36 - n) / 39)
  return round(dInch * 25.4)
})

const area = computed(() => round(Math.PI * (diameter.value / 2) ** 2))

const ampacity = computed(() => {
  const table: Record<number, number> = {
    0: 245, 1: 211, 2: 181, 3: 158, 4: 135, 5: 118, 6: 101, 7: 89,
    8: 73, 9: 64, 10: 55, 11: 47, 12: 41, 13: 35, 14: 32, 15: 28,
    16: 22, 17: 19, 18: 16, 19: 14, 20: 11, 21: 9, 22: 7, 24: 3.5, 26: 2.2, 28: 1.4, 30: 0.86,
  }
  const n = Math.round(Number(awg.value))
  return table[n] ?? '—'
})

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.aw-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.aw-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.aw-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.aw-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.aw-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
