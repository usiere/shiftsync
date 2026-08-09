<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Coffee ratio calculator"
        size="large"
      >
        <v-icon size="22">mdi-coffee-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Coffee Ratio</div>
      <v-text-field v-model.number="water" type="number" label="Water (g)" density="compact" variant="outlined" hide-details min="0" class="mb-2" />
      <v-select
        v-model="ratio"
        :items="ratios"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Style"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="co-badge">{{ coffee }} g coffee</div>
        <div class="co-row">
          <div class="co-col">
            <div class="co-label">Ratio</div>
            <div class="co-val">1 : {{ ratio }}</div>
          </div>
          <div class="co-col">
            <div class="co-label">Tbsp ≈</div>
            <div class="co-val">{{ tbsp }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const water = ref<number>(500)
const ratio = ref<number>(16)

const ratios = [
  { label: 'Strong (1:14)', value: 14 },
  { label: 'Balanced (1:15)', value: 15 },
  { label: 'Golden (1:16)', value: 16 },
  { label: 'Mild (1:17)', value: 17 },
  { label: 'Light (1:18)', value: 18 },
  { label: 'Cold brew (1:8)', value: 8 },
]

const error = computed(() => {
  const w = Number(water.value)
  if (!Number.isFinite(w) || w < 0) return 'Water must be ≥ 0'
  return ''
})

const coffee = computed(() => round(Number(water.value) / Number(ratio.value)))
const tbsp = computed(() => round(coffee.value / 5.3))

function round(v: number) {
  return Math.round(v * 10) / 10
}
</script>

<style scoped>
.co-badge {
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

.co-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.co-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.co-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.co-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
