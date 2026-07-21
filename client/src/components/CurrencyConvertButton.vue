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
        title="Currency converter (static rates)"
        size="large"
      >
        <v-icon size="22">mdi-currency-usd</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model.number="amount"
          type="number"
          label="Amount"
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-select
          v-model="from"
          :items="codes"
          label="From"
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-select
          v-model="to"
          :items="codes"
          label="To"
          density="compact"
          variant="outlined"
          hide-details
        />
      </div>

      <div class="ex-result">
        <div class="ex-value">{{ formatted }}</div>
        <div class="ex-rate">1 {{ from }} = {{ ratio.toFixed(4) }} {{ to }}</div>
      </div>
      <div class="text-caption text-medium-emphasis mt-2">
        Static reference rates — not live.
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const amount = ref(100)
const from = ref('USD')
const to = ref('EUR')

const RATES_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0068,
  CAD: 0.74,
  AUD: 0.66,
  CHF: 1.12,
  CNY: 0.14,
  INR: 0.012,
  BRL: 0.19,
  MXN: 0.059,
  NGN: 0.0007,
  ZAR: 0.053,
  KRW: 0.00074,
  SGD: 0.74,
}

const codes = Object.keys(RATES_TO_USD)

const ratio = computed(() => {
  const fromUsd = RATES_TO_USD[from.value] ?? 1
  const toUsd = RATES_TO_USD[to.value] ?? 1
  return fromUsd / toUsd
})

const result = computed(() => (amount.value || 0) * ratio.value)

const formatted = computed(() =>
  result.value.toLocaleString(undefined, {
    style: 'currency',
    currency: to.value,
    maximumFractionDigits: 2,
  }),
)
</script>

<style scoped>
.ex-result {
  padding: 12px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.ex-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 22px;
  font-weight: 700;
}

.ex-rate {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #94A3B8;
  margin-top: 4px;
}

.gap-8 {
  gap: 8px;
}
</style>
