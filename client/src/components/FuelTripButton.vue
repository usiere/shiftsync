<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Fuel trip cost"
        size="large"
      >
        <v-icon size="22">mdi-gas-station</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Fuel Trip Cost</div>
      <v-text-field v-model.number="distanceKm" type="number" label="Distance (km)" density="compact" variant="outlined" hide-details min="0" class="mb-2" />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="l100" type="number" label="L / 100 km" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="pricePerL" type="number" label="Price / L" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="ft-badge">{{ cost }}</div>
        <div class="ft-note">{{ liters }} L consumed · {{ costPerKm }}/km</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const distanceKm = ref<number>(400)
const l100 = ref<number>(7)
const pricePerL = ref<number>(1.75)

const error = computed(() => {
  const vals = [distanceKm.value, l100.value, pricePerL.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (vals.some(v => v < 0)) return 'Values must be ≥ 0'
  return ''
})

const liters = computed(() => round((Number(distanceKm.value) * Number(l100.value)) / 100))
const cost = computed(() => round(liters.value * Number(pricePerL.value)))
const costPerKm = computed(() => {
  const d = Number(distanceKm.value)
  if (d === 0) return '0'
  return round(cost.value / d)
})

function round(v: number) {
  return Math.round(v * 100) / 100
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
  font-size: 20px;
  background: #DCFCE7;
  color: #166534;
}

.ft-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
