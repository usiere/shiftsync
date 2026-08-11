<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Race time predictor (Riegel)"
        size="large"
      >
        <v-icon size="22">mdi-timer-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Riegel Race Predictor</div>
      <v-text-field v-model.number="d1" type="number" label="Known distance (km)" density="compact" variant="outlined" hide-details min="0" class="mb-2" />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="hh" type="number" label="h" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="mm" type="number" label="m" density="compact" variant="outlined" hide-details min="0" max="59" />
        <v-text-field v-model.number="ss" type="number" label="s" density="compact" variant="outlined" hide-details min="0" max="59" />
      </div>
      <v-text-field v-model.number="d2" type="number" label="Target distance (km)" density="compact" variant="outlined" hide-details min="0" class="mt-2" />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="pd-badge">{{ predicted }}</div>
        <div class="pd-note">T2 = T1 · (D2 / D1)^1.06</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const d1 = ref<number>(5)
const hh = ref<number>(0)
const mm = ref<number>(25)
const ss = ref<number>(0)
const d2 = ref<number>(10)

const t1 = computed(() => Number(hh.value) * 3600 + Number(mm.value) * 60 + Number(ss.value))

const error = computed(() => {
  const D1 = Number(d1.value)
  const D2 = Number(d2.value)
  if (!Number.isFinite(D1) || !Number.isFinite(D2)) return 'Enter distances'
  if (D1 <= 0 || D2 <= 0) return 'Distances must be > 0'
  if (t1.value <= 0) return 'Time must be > 0'
  if (Number(mm.value) >= 60 || Number(ss.value) >= 60) return 'Invalid time'
  return ''
})

const t2 = computed(() => t1.value * Math.pow(Number(d2.value) / Number(d1.value), 1.06))

const predicted = computed(() => {
  const s = Math.round(t2.value)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${h}:${pad(m)}:${pad(sec)}`
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
.pd-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 22px;
  background: #FFE4E6;
  color: #9F1239;
}

.pd-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
