<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Sales tax calculator"
        size="large"
      >
        <v-icon size="22">mdi-receipt-text-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Sales Tax</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="price" type="number" label="Price" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="rate" type="number" label="Rate %" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="st-row">
          <div class="st-col">
            <div class="st-label">Tax</div>
            <div class="st-val">{{ tax }}</div>
          </div>
          <div class="st-col">
            <div class="st-label">Total</div>
            <div class="st-val">{{ total }}</div>
          </div>
        </div>
        <div class="st-note">Pre-tax if tax-inclusive: {{ preTax }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const price = ref<number>(100)
const rate = ref<number>(8.5)

const error = computed(() => {
  const p = Number(price.value)
  const r = Number(rate.value)
  if (!Number.isFinite(p) || !Number.isFinite(r)) return 'Enter numbers'
  if (p < 0 || r < 0) return 'Values must be ≥ 0'
  return ''
})

const tax = computed(() => round(Number(price.value) * (Number(rate.value) / 100)))
const total = computed(() => round(Number(price.value) + tax.value))
const preTax = computed(() => round(Number(price.value) / (1 + Number(rate.value) / 100)))

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.st-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.st-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.st-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.st-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 15px;
}

.st-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
