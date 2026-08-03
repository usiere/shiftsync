<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Slope of a line"
        size="large"
      >
        <v-icon size="22">mdi-slope-uphill</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Slope from 2 points</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="x1" type="number" label="x₁" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="y1" type="number" label="y₁" density="compact" variant="outlined" hide-details />
      </div>
      <div class="d-flex mt-2" style="gap: 6px;">
        <v-text-field v-model.number="x2" type="number" label="x₂" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="y2" type="number" label="y₂" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="sl-badge">m = {{ slope }}</div>
        <div class="sl-row">
          <div class="sl-col">
            <div class="sl-label">Δx</div>
            <div class="sl-val">{{ dx }}</div>
          </div>
          <div class="sl-col">
            <div class="sl-label">Δy</div>
            <div class="sl-val">{{ dy }}</div>
          </div>
        </div>
        <div class="sl-eq">y = {{ slope }}x {{ intercept >= 0 ? '+' : '−' }} {{ Math.abs(intercept) }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const x1 = ref<number>(0)
const y1 = ref<number>(0)
const x2 = ref<number>(3)
const y2 = ref<number>(6)

const error = computed(() => {
  const vals = [x1.value, y1.value, x2.value, y2.value].map(Number)
  if (vals.some(v => Number.isNaN(v))) return 'Enter numbers'
  if (vals[0] === vals[2]) return 'Vertical line (undefined slope)'
  return ''
})

const dx = computed(() => round(Number(x2.value) - Number(x1.value)))
const dy = computed(() => round(Number(y2.value) - Number(y1.value)))
const slope = computed(() => round(dy.value / dx.value))
const intercept = computed(() => round(Number(y1.value) - slope.value * Number(x1.value)))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.sl-badge {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 15px;
  background: #DBEAFE;
  color: #1E3A8A;
}

.sl-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.sl-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.sl-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.sl-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.sl-eq {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #475569;
}
</style>
