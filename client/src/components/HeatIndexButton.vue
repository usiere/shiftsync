<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Heat index"
        size="large"
      >
        <v-icon size="22">mdi-thermometer-high</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Heat Index</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="tempC" type="number" label="Air °C" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="rh" type="number" label="RH %" density="compact" variant="outlined" hide-details min="0" max="100" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="hi-badge" :style="{ background: cat.bg, color: cat.fg }">
          {{ indexC }} °C · {{ indexF }} °F
        </div>
        <div class="hi-note">{{ cat.label }}</div>
        <div class="hi-note" v-if="warn">{{ warn }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const tempC = ref<number>(32)
const rh = ref<number>(70)

const error = computed(() => {
  const t = Number(tempC.value)
  const r = Number(rh.value)
  if (!Number.isFinite(t) || !Number.isFinite(r)) return 'Enter numbers'
  if (r < 0 || r > 100) return 'RH 0-100%'
  return ''
})

const warn = computed(() => {
  const t = Number(tempC.value)
  if (t < 27) return 'Formula valid ≥ 27 °C'
  return ''
})

const indexF = computed(() => {
  const T = Number(tempC.value) * 9 / 5 + 32
  const R = Number(rh.value)
  if (T < 80) return round(T)
  let hi = -42.379 + 2.04901523 * T + 10.14333127 * R
    - 0.22475541 * T * R - 0.00683783 * T * T - 0.05481717 * R * R
    + 0.00122874 * T * T * R + 0.00085282 * T * R * R
    - 0.00000199 * T * T * R * R
  if (R < 13 && T >= 80 && T <= 112) {
    hi -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17)
  } else if (R > 85 && T >= 80 && T <= 87) {
    hi += ((R - 85) / 10) * ((87 - T) / 5)
  }
  return round(hi)
})

const indexC = computed(() => round((indexF.value - 32) * 5 / 9))

const cat = computed(() => {
  const f = indexF.value
  if (f < 80) return { label: 'Comfortable', bg: '#DCFCE7', fg: '#166534' }
  if (f < 90) return { label: 'Caution', bg: '#FEF3C7', fg: '#78350F' }
  if (f < 103) return { label: 'Extreme Caution', bg: '#FFEDD5', fg: '#7C2D12' }
  if (f < 125) return { label: 'Danger', bg: '#FEE2E2', fg: '#991B1B' }
  return { label: 'Extreme Danger', bg: '#7F1D1D', fg: '#FEE2E2' }
})

function round(v: number) {
  return Math.round(v * 10) / 10
}
</script>

<style scoped>
.hi-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 16px;
}

.hi-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
