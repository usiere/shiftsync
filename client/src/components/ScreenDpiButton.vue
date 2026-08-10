<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Screen DPI calculator"
        size="large"
      >
        <v-icon size="22">mdi-monitor-screenshot</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Screen DPI</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="w" type="number" label="Width px" density="compact" variant="outlined" hide-details min="1" />
        <v-text-field v-model.number="h" type="number" label="Height px" density="compact" variant="outlined" hide-details min="1" />
      </div>
      <v-text-field v-model.number="diag" type="number" label='Diagonal (")' density="compact" variant="outlined" hide-details min="0.1" class="mt-2" />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="dpi-badge">{{ dpi }} DPI</div>
        <div class="dpi-row">
          <div class="dpi-col">
            <div class="dpi-label">Width</div>
            <div class="dpi-val">{{ widthIn }}"</div>
          </div>
          <div class="dpi-col">
            <div class="dpi-label">Height</div>
            <div class="dpi-val">{{ heightIn }}"</div>
          </div>
          <div class="dpi-col">
            <div class="dpi-label">Dot pitch</div>
            <div class="dpi-val">{{ dotPitch }} mm</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const w = ref<number>(2560)
const h = ref<number>(1440)
const diag = ref<number>(27)

const error = computed(() => {
  const wv = Number(w.value)
  const hv = Number(h.value)
  const dv = Number(diag.value)
  if (![wv, hv, dv].every(Number.isFinite)) return 'Enter numbers'
  if (wv <= 0 || hv <= 0 || dv <= 0) return 'Values must be > 0'
  return ''
})

const diagPx = computed(() => Math.hypot(Number(w.value), Number(h.value)))
const dpi = computed(() => round(diagPx.value / Number(diag.value)))
const widthIn = computed(() => round(Number(w.value) / dpi.value))
const heightIn = computed(() => round(Number(h.value) / dpi.value))
const dotPitch = computed(() => round(25.4 / dpi.value))

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.dpi-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 18px;
  background: #DBEAFE;
  color: #1E3A8A;
}

.dpi-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.dpi-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.dpi-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.dpi-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}
</style>
