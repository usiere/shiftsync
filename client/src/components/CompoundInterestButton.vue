<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Compound interest calculator"
        size="large"
      >
        <v-icon size="22">mdi-finance</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Compound interest</div>
      <v-text-field
        v-model.number="principal"
        type="number"
        label="Principal"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
      />
      <v-text-field
        v-model.number="ratePct"
        type="number"
        label="Annual rate (%)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
        step="0.01"
      />
      <v-text-field
        v-model.number="years"
        type="number"
        label="Years"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
        step="0.1"
      />
      <v-select
        v-model="freq"
        :items="freqItems"
        label="Compounding"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="ci-row">
          <span class="text-caption text-medium-emphasis">Future value</span>
          <span class="ci-value">{{ future }}</span>
        </div>
        <div class="ci-row">
          <span class="text-caption text-medium-emphasis">Interest earned</span>
          <span class="ci-value">{{ earned }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const principal = ref<number>(1000)
const ratePct = ref<number>(5)
const years = ref<number>(10)
const freq = ref<number>(12)

const freqItems = [
  { title: 'Annually (1×)', value: 1 },
  { title: 'Semi-annually (2×)', value: 2 },
  { title: 'Quarterly (4×)', value: 4 },
  { title: 'Monthly (12×)', value: 12 },
  { title: 'Daily (365×)', value: 365 },
]

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const error = computed(() => {
  const p = Number(principal.value), r = Number(ratePct.value), t = Number(years.value)
  if (!Number.isFinite(p) || p < 0) return 'Enter a valid principal'
  if (!Number.isFinite(r) || r < 0) return 'Enter a valid rate'
  if (!Number.isFinite(t) || t < 0) return 'Enter a valid duration'
  return ''
})

const _fv = computed(() => {
  const p = Number(principal.value)
  const r = Number(ratePct.value) / 100
  const n = Number(freq.value)
  const t = Number(years.value)
  return p * Math.pow(1 + r / n, n * t)
})

const future = computed(() => fmt(_fv.value))
const earned = computed(() => fmt(_fv.value - Number(principal.value)))
</script>

<style scoped>
.ci-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
}

.ci-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #166534;
  font-size: 13px;
}
</style>
