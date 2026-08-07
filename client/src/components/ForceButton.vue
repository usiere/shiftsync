<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Force (F = ma)"
        size="large"
      >
        <v-icon size="22">mdi-arrow-expand-right</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Force · F = m·a</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="mass" type="number" label="Mass (kg)" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="accel" type="number" label="Accel (m/s²)" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="fc-badge">{{ newtons }} N</div>
        <div class="fc-row">
          <div class="fc-col">
            <div class="fc-label">kN</div>
            <div class="fc-val">{{ kn }}</div>
          </div>
          <div class="fc-col">
            <div class="fc-label">lbf</div>
            <div class="fc-val">{{ lbf }}</div>
          </div>
          <div class="fc-col">
            <div class="fc-label">kgf</div>
            <div class="fc-val">{{ kgf }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const mass = ref<number>(10)
const accel = ref<number>(9.81)

const error = computed(() => {
  const m = Number(mass.value)
  const a = Number(accel.value)
  if (!Number.isFinite(m) || !Number.isFinite(a)) return 'Enter numbers'
  if (m < 0) return 'Mass must be ≥ 0'
  return ''
})

const raw = computed(() => Number(mass.value) * Number(accel.value))
const newtons = computed(() => round(raw.value))
const kn = computed(() => round(raw.value / 1000))
const lbf = computed(() => round(raw.value / 4.4482216152605))
const kgf = computed(() => round(raw.value / 9.80665))

function round(v: number) {
  if (Math.abs(v) >= 1e6 || (v !== 0 && Math.abs(v) < 1e-3)) return v.toExponential(3)
  return Math.round(v * 1000) / 1000
}
</script>

<style scoped>
.fc-badge {
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

.fc-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.fc-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.fc-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.fc-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}
</style>
