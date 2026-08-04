<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Markup ↔ Margin"
        size="large"
      >
        <v-icon size="22">mdi-cash-multiple</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Markup &amp; Margin</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="cost" type="number" label="Cost" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="price" type="number" label="Sell price" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="mm-row">
          <div class="mm-col">
            <div class="mm-label">Markup</div>
            <div class="mm-val">{{ markup }}%</div>
          </div>
          <div class="mm-col">
            <div class="mm-label">Margin</div>
            <div class="mm-val">{{ margin }}%</div>
          </div>
        </div>
        <div class="mm-note">Profit: {{ profit }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const cost = ref<number>(100)
const price = ref<number>(150)

const error = computed(() => {
  const c = Number(cost.value)
  const p = Number(price.value)
  if (!Number.isFinite(c) || !Number.isFinite(p)) return 'Enter numbers'
  if (c <= 0) return 'Cost must be > 0'
  if (p < 0) return 'Price must be ≥ 0'
  return ''
})

const profit = computed(() => round(Number(price.value) - Number(cost.value)))
const markup = computed(() => round((profit.value / Number(cost.value)) * 100))
const margin = computed(() => {
  const p = Number(price.value)
  if (p === 0) return 0
  return round((profit.value / p) * 100)
})

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.mm-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.mm-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.mm-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.mm-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 15px;
}

.mm-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #475569;
}
</style>
