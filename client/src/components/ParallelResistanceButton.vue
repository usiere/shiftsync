<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Parallel resistance"
        size="large"
      >
        <v-icon size="22">mdi-arrow-split-vertical</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Parallel Resistance</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="r1" type="number" label="R1 (Ω)" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="r2" type="number" label="R2 (Ω)" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="r3" type="number" label="R3 (Ω)" density="compact" variant="outlined" hide-details min="0" placeholder="opt" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="pr-badge">R∥ = {{ display }}</div>
        <div class="pr-note">Series total: {{ series }} Ω</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const r1 = ref<number>(100)
const r2 = ref<number>(220)
const r3 = ref<number | null>(null)

const inputs = computed(() => {
  return [r1.value, r2.value, r3.value]
    .map(v => (v === null || v === undefined || v === '' as any ? NaN : Number(v)))
    .filter(v => Number.isFinite(v))
})

const error = computed(() => {
  if (inputs.value.length < 2) return 'Enter at least R1 and R2'
  if (inputs.value.some(v => v < 0)) return 'Values must be ≥ 0'
  if (inputs.value.some(v => v === 0)) return 'A 0 Ω branch shorts to 0 Ω'
  return ''
})

const parallel = computed(() => {
  const sum = inputs.value.reduce((s, v) => s + 1 / v, 0)
  return sum === 0 ? Infinity : 1 / sum
})

const series = computed(() => round(inputs.value.reduce((s, v) => s + v, 0)))
const display = computed(() => `${round(parallel.value)} Ω`)

function round(v: number) {
  if (Math.abs(v) >= 1e6 || (v !== 0 && Math.abs(v) < 1e-3)) return v.toExponential(3)
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.pr-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 17px;
  background: #E0E7FF;
  color: #3730A3;
}

.pr-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
