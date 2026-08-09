<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Voltage divider"
        size="large"
      >
        <v-icon size="22">mdi-current-dc</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Voltage Divider</div>
      <v-text-field v-model.number="vin" type="number" label="Vin (V)" density="compact" variant="outlined" hide-details class="mb-2" />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="r1" type="number" label="R1 (Ω)" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="r2" type="number" label="R2 (Ω)" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="vd-badge">Vout = {{ vout }} V</div>
        <div class="vd-row">
          <div class="vd-col">
            <div class="vd-label">Current</div>
            <div class="vd-val">{{ current }} mA</div>
          </div>
          <div class="vd-col">
            <div class="vd-label">R1 power</div>
            <div class="vd-val">{{ p1 }} mW</div>
          </div>
        </div>
        <div class="vd-note">Vout = Vin · R2 / (R1 + R2)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const vin = ref<number>(5)
const r1 = ref<number>(1000)
const r2 = ref<number>(2200)

const error = computed(() => {
  const v = Number(vin.value)
  const R1 = Number(r1.value)
  const R2 = Number(r2.value)
  if (![v, R1, R2].every(Number.isFinite)) return 'Enter numbers'
  if (R1 < 0 || R2 < 0) return 'Resistances ≥ 0'
  if (R1 + R2 === 0) return 'R1 + R2 must be > 0'
  return ''
})

const vout = computed(() => round((Number(vin.value) * Number(r2.value)) / (Number(r1.value) + Number(r2.value))))
const currentA = computed(() => Number(vin.value) / (Number(r1.value) + Number(r2.value)))
const current = computed(() => round(currentA.value * 1000))
const p1 = computed(() => round(currentA.value ** 2 * Number(r1.value) * 1000))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.vd-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 17px;
  background: #DBEAFE;
  color: #1E3A8A;
}

.vd-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.vd-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.vd-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.vd-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.vd-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
