<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Straight-line depreciation"
        size="large"
      >
        <v-icon size="22">mdi-trending-down</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Depreciation (SL)</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="cost" type="number" label="Cost" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="salvage" type="number" label="Salvage" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <v-text-field v-model.number="life" type="number" label="Useful life (years)" density="compact" variant="outlined" hide-details min="1" class="mt-2" />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="dp-row">
          <div class="dp-col">
            <div class="dp-label">Per year</div>
            <div class="dp-val">{{ perYear }}</div>
          </div>
          <div class="dp-col">
            <div class="dp-label">Per month</div>
            <div class="dp-val">{{ perMonth }}</div>
          </div>
        </div>
        <div class="dp-note">Rate: {{ rate }}% / yr</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const cost = ref<number>(5000)
const salvage = ref<number>(500)
const life = ref<number>(5)

const error = computed(() => {
  const c = Number(cost.value)
  const s = Number(salvage.value)
  const l = Number(life.value)
  if (![c, s, l].every(Number.isFinite)) return 'Enter numbers'
  if (c < 0 || s < 0) return 'Cost/salvage ≥ 0'
  if (!Number.isInteger(l) || l < 1) return 'Life must be ≥ 1 yr'
  if (s > c) return 'Salvage cannot exceed cost'
  return ''
})

const perYear = computed(() => round((Number(cost.value) - Number(salvage.value)) / Number(life.value)))
const perMonth = computed(() => round(perYear.value / 12))
const rate = computed(() => {
  const c = Number(cost.value)
  if (c === 0) return 0
  return round((perYear.value / c) * 100)
})

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.dp-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.dp-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.dp-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.dp-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 14px;
}

.dp-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
