<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Capacitor stored energy"
        size="large"
      >
        <v-icon size="22">mdi-battery-charging</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Capacitor Energy</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="cap" type="number" label="Capacitance" density="compact" variant="outlined" hide-details min="0" />
        <v-select v-model="unit" :items="units" density="compact" variant="outlined" hide-details style="max-width: 90px;" />
      </div>
      <v-text-field v-model.number="volts" type="number" label="Voltage (V)" density="compact" variant="outlined" hide-details class="mt-2" />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="ce-badge">{{ display }} J</div>
        <div class="ce-row">
          <div class="ce-col">
            <div class="ce-label">Charge Q</div>
            <div class="ce-val">{{ charge }} C</div>
          </div>
          <div class="ce-col">
            <div class="ce-label">Wh</div>
            <div class="ce-val">{{ wh }}</div>
          </div>
        </div>
        <div class="ce-note">E = ½ · C · V²</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const cap = ref<number>(100)
const unit = ref<string>('µF')
const volts = ref<number>(12)

const units = ['pF', 'nF', 'µF', 'mF', 'F']
const scale: Record<string, number> = { pF: 1e-12, nF: 1e-9, 'µF': 1e-6, mF: 1e-3, F: 1 }

const error = computed(() => {
  const c = Number(cap.value)
  const v = Number(volts.value)
  if (!Number.isFinite(c) || !Number.isFinite(v)) return 'Enter numbers'
  if (c < 0) return 'Capacitance ≥ 0'
  return ''
})

const farads = computed(() => Number(cap.value) * (scale[unit.value] || 1))
const joules = computed(() => 0.5 * farads.value * Number(volts.value) ** 2)
const charge = computed(() => sig(farads.value * Number(volts.value)))
const wh = computed(() => sig(joules.value / 3600))
const display = computed(() => sig(joules.value))

function sig(v: number) {
  if (v === 0) return '0'
  if (Math.abs(v) >= 1e6 || Math.abs(v) < 1e-3) return v.toExponential(3)
  return String(Math.round(v * 100000) / 100000)
}
</script>

<style scoped>
.ce-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 17px;
  background: #FEF3C7;
  color: #78350F;
}

.ce-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.ce-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.ce-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.ce-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.ce-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
