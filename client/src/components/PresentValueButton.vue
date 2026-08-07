<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Present / Future value"
        size="large"
      >
        <v-icon size="22">mdi-clock-time-eight-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">PV ↔ FV</div>
      <v-text-field v-model.number="amount" type="number" label="Amount" density="compact" variant="outlined" hide-details class="mb-2" />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="rate" type="number" label="Rate %/yr" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="years" type="number" label="Years" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="pv-row">
          <div class="pv-col">
            <div class="pv-label">FV (grow)</div>
            <div class="pv-val">{{ fv }}</div>
          </div>
          <div class="pv-col">
            <div class="pv-label">PV (discount)</div>
            <div class="pv-val">{{ pv }}</div>
          </div>
        </div>
        <div class="pv-note">Interpret input as today (FV) or future (PV)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const amount = ref<number>(1000)
const rate = ref<number>(5)
const years = ref<number>(10)

const error = computed(() => {
  const vals = [amount.value, rate.value, years.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (Number(years.value) < 0) return 'Years must be ≥ 0'
  return ''
})

const factor = computed(() => Math.pow(1 + Number(rate.value) / 100, Number(years.value)))

const fv = computed(() => round(Number(amount.value) * factor.value))
const pv = computed(() => round(Number(amount.value) / factor.value))

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.pv-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.pv-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.pv-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.pv-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 14px;
}

.pv-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #94A3B8;
}
</style>
