<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Fermi order-of-magnitude"
        size="large"
      >
        <v-icon size="22">mdi-atom</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Fermi Estimate</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="low" type="number" label="Low bound" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="high" type="number" label="High bound" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="fe-badge">≈ {{ estimate }}</div>
        <div class="fe-row">
          <div class="fe-col">
            <div class="fe-label">Order</div>
            <div class="fe-val">10^{{ order }}</div>
          </div>
          <div class="fe-col">
            <div class="fe-label">Ratio hi/lo</div>
            <div class="fe-val">{{ ratio }}</div>
          </div>
        </div>
        <div class="fe-note">Geometric mean of bounds</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const low = ref<number>(1000)
const high = ref<number>(1000000)

const error = computed(() => {
  const lo = Number(low.value)
  const hi = Number(high.value)
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return 'Enter numbers'
  if (lo <= 0 || hi <= 0) return 'Both bounds must be > 0'
  if (lo > hi) return 'Low must be ≤ high'
  return ''
})

const raw = computed(() => Math.sqrt(Number(low.value) * Number(high.value)))
const order = computed(() => Math.round(Math.log10(raw.value)))
const estimate = computed(() => format(raw.value))
const ratio = computed(() => round(Number(high.value) / Number(low.value)))

function format(v: number) {
  if (Math.abs(v) >= 1e6 || Math.abs(v) < 1e-2) return v.toExponential(2)
  const rounded = Math.round(v)
  return rounded.toLocaleString()
}

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.fe-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 20px;
  background: #FFEDD5;
  color: #7C2D12;
}

.fe-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.fe-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.fe-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.fe-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.fe-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
