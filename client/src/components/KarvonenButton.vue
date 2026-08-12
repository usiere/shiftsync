<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Karvonen heart rate zones"
        size="large"
      >
        <v-icon size="22">mdi-heart-pulse</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Karvonen HR Zones</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="age" type="number" label="Age" density="compact" variant="outlined" hide-details min="1" max="120" />
        <v-text-field v-model.number="rhr" type="number" label="Resting HR" density="compact" variant="outlined" hide-details min="30" max="130" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="kv-note">HR max: {{ hrMax }} · HRR: {{ hrr }}</div>
        <div v-for="z in zones" :key="z.name" class="kv-row">
          <span class="kv-name">{{ z.name }}</span>
          <span class="kv-range">{{ z.lo }} – {{ z.hi }} bpm</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const age = ref<number>(30)
const rhr = ref<number>(60)

const ZONES = [
  { name: 'Z1 · Recovery',  lo: 0.50, hi: 0.60 },
  { name: 'Z2 · Aerobic',   lo: 0.60, hi: 0.70 },
  { name: 'Z3 · Tempo',     lo: 0.70, hi: 0.80 },
  { name: 'Z4 · Threshold', lo: 0.80, hi: 0.90 },
  { name: 'Z5 · Max',       lo: 0.90, hi: 1.00 },
]

const error = computed(() => {
  const a = Number(age.value)
  const r = Number(rhr.value)
  if (!Number.isInteger(a) || a < 1 || a > 120) return 'Age must be 1-120'
  if (!Number.isFinite(r) || r < 30 || r > 130) return 'RHR must be 30-130'
  if (220 - a <= r) return 'HR max must exceed RHR'
  return ''
})

const hrMax = computed(() => 220 - Number(age.value))
const hrr = computed(() => hrMax.value - Number(rhr.value))

const zones = computed(() =>
  ZONES.map(z => ({
    name: z.name,
    lo: Math.round(z.lo * hrr.value + Number(rhr.value)),
    hi: Math.round(z.hi * hrr.value + Number(rhr.value)),
  })),
)
</script>

<style scoped>
.kv-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}

.kv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.kv-name {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 11px;
  color: #0F172A;
}

.kv-range {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 12px;
  color: #B91C1C;
}
</style>
