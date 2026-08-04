<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Wavelength ↔ Frequency"
        size="large"
      >
        <v-icon size="22">mdi-sine-wave</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Wavelength &amp; Frequency</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="freq" type="number" label="Frequency" density="compact" variant="outlined" hide-details min="0" />
        <v-select v-model="freqUnit" :items="freqUnits" density="compact" variant="outlined" hide-details style="max-width: 90px;" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="wl-badge">λ = {{ wavelength }} m</div>
        <div class="wl-row">
          <div class="wl-col">
            <div class="wl-label">mm</div>
            <div class="wl-val">{{ mm }}</div>
          </div>
          <div class="wl-col">
            <div class="wl-label">nm</div>
            <div class="wl-val">{{ nm }}</div>
          </div>
        </div>
        <div class="wl-note">c = 299,792,458 m/s</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const C = 299_792_458

const freq = ref<number>(100)
const freqUnit = ref<string>('MHz')
const freqUnits = ['Hz', 'kHz', 'MHz', 'GHz', 'THz']

const multiplier: Record<string, number> = { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9, THz: 1e12 }

const hz = computed(() => Number(freq.value) * (multiplier[freqUnit.value] || 1))

const error = computed(() => {
  const f = Number(freq.value)
  if (!Number.isFinite(f) || f <= 0) return 'Enter a positive number'
  return ''
})

const wavelength = computed(() => sig(C / hz.value))
const mm = computed(() => sig((C / hz.value) * 1e3))
const nm = computed(() => sig((C / hz.value) * 1e9))

function sig(v: number) {
  if (v === 0) return '0'
  if (Math.abs(v) < 1e-3 || Math.abs(v) >= 1e7) return v.toExponential(4)
  return String(Math.round(v * 10000) / 10000)
}
</script>

<style scoped>
.wl-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 16px;
  background: #E0F2FE;
  color: #075985;
}

.wl-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.wl-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.wl-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.wl-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.wl-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #94A3B8;
}
</style>
