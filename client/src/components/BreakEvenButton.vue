<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Break-even calculator"
        size="large"
      >
        <v-icon size="22">mdi-scale-balance</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Break-Even</div>
      <v-text-field v-model.number="fixed" type="number" label="Fixed cost" density="compact" variant="outlined" hide-details class="mb-2" min="0" />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="price" type="number" label="Sell price / unit" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="vc" type="number" label="Var cost / unit" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="be-badge">{{ units }} units</div>
        <div class="be-row">
          <div class="be-col">
            <div class="be-label">Revenue</div>
            <div class="be-val">{{ revenue }}</div>
          </div>
          <div class="be-col">
            <div class="be-label">Contribution</div>
            <div class="be-val">{{ contrib }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const fixed = ref<number>(1000)
const price = ref<number>(20)
const vc = ref<number>(8)

const error = computed(() => {
  const vals = [fixed.value, price.value, vc.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (vals.some(v => v < 0)) return 'Values must be ≥ 0'
  if (Number(price.value) <= Number(vc.value)) return 'Price must exceed variable cost'
  return ''
})

const contrib = computed(() => round(Number(price.value) - Number(vc.value)))
const units = computed(() => Math.ceil(Number(fixed.value) / contrib.value))
const revenue = computed(() => round(units.value * Number(price.value)))

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.be-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 18px;
  background: #FEF3C7;
  color: #78350F;
}

.be-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.be-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.be-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.be-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
