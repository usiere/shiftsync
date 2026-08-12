<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Doppler shift"
        size="large"
      >
        <v-icon size="22">mdi-radar</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Doppler Shift (sound)</div>
      <v-text-field v-model.number="fSrc" type="number" label="Source freq (Hz)" density="compact" variant="outlined" hide-details min="0" class="mb-2" />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="vObs" type="number" label="Observer v (m/s)" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="vSrc" type="number" label="Source v (m/s)" density="compact" variant="outlined" hide-details />
      </div>
      <div class="dp-hint">Positive = toward observer / observer moving toward source.</div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="dp-badge">{{ fObs }} Hz</div>
        <div class="dp-note">Δf = {{ delta }} Hz ({{ deltaPct }}%)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const C = 343

const fSrc = ref<number>(440)
const vObs = ref<number>(0)
const vSrc = ref<number>(30)

const error = computed(() => {
  const vals = [fSrc.value, vObs.value, vSrc.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (Number(fSrc.value) < 0) return 'Frequency must be ≥ 0'
  if (C - Number(vSrc.value) <= 0) return 'Source cannot exceed sound speed'
  return ''
})

const fObsRaw = computed(() => Number(fSrc.value) * (C + Number(vObs.value)) / (C - Number(vSrc.value)))
const fObs = computed(() => round(fObsRaw.value))
const delta = computed(() => round(fObsRaw.value - Number(fSrc.value)))
const deltaPct = computed(() => {
  const f = Number(fSrc.value)
  if (f === 0) return '—'
  return round(((fObsRaw.value - f) / f) * 100)
})

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.dp-hint {
  margin-top: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #94A3B8;
  text-align: center;
}

.dp-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 20px;
  background: #E0F2FE;
  color: #075985;
}

.dp-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
