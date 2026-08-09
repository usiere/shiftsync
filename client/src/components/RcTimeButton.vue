<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="RC time constant"
        size="large"
      >
        <v-icon size="22">mdi-chip</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">RC Time Constant</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="r" type="number" label="R (Ω)" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="c" type="number" label="C" density="compact" variant="outlined" hide-details min="0" />
        <v-select v-model="unit" :items="units" density="compact" variant="outlined" hide-details style="max-width: 90px;" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="rc-badge">τ = {{ tauStr }}</div>
        <div class="rc-row">
          <div class="rc-col">
            <div class="rc-label">63.2%</div>
            <div class="rc-val">{{ tauStr }}</div>
          </div>
          <div class="rc-col">
            <div class="rc-label">Settle 5τ</div>
            <div class="rc-val">{{ fiveTauStr }}</div>
          </div>
        </div>
        <div class="rc-note">Cutoff fc = {{ fc }} Hz</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const r = ref<number>(10000)
const c = ref<number>(100)
const unit = ref<string>('nF')
const units = ['pF', 'nF', 'µF', 'mF', 'F']

const scale: Record<string, number> = { pF: 1e-12, nF: 1e-9, 'µF': 1e-6, mF: 1e-3, F: 1 }

const error = computed(() => {
  const R = Number(r.value)
  const C = Number(c.value)
  if (!Number.isFinite(R) || !Number.isFinite(C)) return 'Enter numbers'
  if (R < 0 || C < 0) return 'Values must be ≥ 0'
  return ''
})

const cFarads = computed(() => Number(c.value) * (scale[unit.value] || 1))
const tau = computed(() => Number(r.value) * cFarads.value)
const fc = computed(() => (tau.value > 0 ? sig(1 / (2 * Math.PI * tau.value)) : '—'))

const tauStr = computed(() => fmtTime(tau.value))
const fiveTauStr = computed(() => fmtTime(5 * tau.value))

function fmtTime(t: number) {
  if (t === 0) return '0 s'
  if (t < 1e-6) return sig(t * 1e9) + ' ns'
  if (t < 1e-3) return sig(t * 1e6) + ' µs'
  if (t < 1) return sig(t * 1e3) + ' ms'
  return sig(t) + ' s'
}

function sig(v: number) {
  if (Math.abs(v) >= 1e6 || (v !== 0 && Math.abs(v) < 1e-3)) return v.toExponential(3)
  return String(Math.round(v * 1000) / 1000)
}
</script>

<style scoped>
.rc-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 16px;
  background: #E0E7FF;
  color: #3730A3;
}

.rc-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.rc-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.rc-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.rc-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.rc-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
