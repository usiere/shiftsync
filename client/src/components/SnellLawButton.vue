<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Snell's law"
        size="large"
      >
        <v-icon size="22">mdi-diamond-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Snell's Law</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="n1" type="number" label="n1" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="n2" type="number" label="n2" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <v-text-field v-model.number="theta1" type="number" label="θ1 (deg)" density="compact" variant="outlined" hide-details min="0" max="90" class="mt-2" />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="sn-badge">{{ theta2Display }}</div>
        <div class="sn-note">Critical angle: {{ critical }}°</div>
        <div class="sn-note">n1·sin θ1 = n2·sin θ2</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n1 = ref<number>(1.0)
const n2 = ref<number>(1.5)
const theta1 = ref<number>(30)

const error = computed(() => {
  const vals = [n1.value, n2.value, theta1.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (Number(n1.value) <= 0 || Number(n2.value) <= 0) return 'Refractive index > 0'
  const t = Number(theta1.value)
  if (t < 0 || t > 90) return 'θ1 must be 0-90°'
  return ''
})

const sinTheta2 = computed(() => (Number(n1.value) / Number(n2.value)) * Math.sin((Number(theta1.value) * Math.PI) / 180))

const theta2Display = computed(() => {
  if (Math.abs(sinTheta2.value) > 1) return 'Total internal reflection'
  const t = (Math.asin(sinTheta2.value) * 180) / Math.PI
  return `θ2 = ${round(t)}°`
})

const critical = computed(() => {
  if (Number(n1.value) <= Number(n2.value)) return '—'
  return round((Math.asin(Number(n2.value) / Number(n1.value)) * 180) / Math.PI)
})

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.sn-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 17px;
  background: #F3E8FF;
  color: #6B21A8;
}

.sn-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
