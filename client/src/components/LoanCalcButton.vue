<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Loan payment calculator"
        size="large"
      >
        <v-icon size="22">mdi-bank-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Loan payment</div>
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
        v-model.number="months"
        type="number"
        label="Term (months)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="lc-row">
          <span class="text-caption text-medium-emphasis">Monthly</span>
          <span class="lc-value">{{ monthly }}</span>
        </div>
        <div class="lc-row">
          <span class="text-caption text-medium-emphasis">Total paid</span>
          <span class="lc-value">{{ total }}</span>
        </div>
        <div class="lc-row">
          <span class="text-caption text-medium-emphasis">Total interest</span>
          <span class="lc-value">{{ interest }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const principal = ref<number>(10000)
const ratePct = ref<number>(6)
const months = ref<number>(60)

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const error = computed(() => {
  const p = Number(principal.value), r = Number(ratePct.value), m = Number(months.value)
  if (!Number.isFinite(p) || p < 0) return 'Enter a valid principal'
  if (!Number.isFinite(r) || r < 0) return 'Enter a valid rate'
  if (!Number.isInteger(m) || m < 1) return 'Term must be at least 1 month'
  return ''
})

const _monthlyNum = computed(() => {
  const p = Number(principal.value)
  const i = Number(ratePct.value) / 100 / 12
  const n = Number(months.value)
  if (i === 0) return p / n
  return (p * i) / (1 - Math.pow(1 + i, -n))
})

const monthly = computed(() => fmt(_monthlyNum.value))
const total = computed(() => fmt(_monthlyNum.value * Number(months.value)))
const interest = computed(() => fmt(_monthlyNum.value * Number(months.value) - Number(principal.value)))
</script>

<style scoped>
.lc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
}

.lc-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
  font-size: 13px;
}
</style>
