<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Kinetic energy"
        size="large"
      >
        <v-icon size="22">mdi-run-fast</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Kinetic Energy</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="mass" type="number" label="Mass (kg)" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="vel" type="number" label="Velocity (m/s)" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="ke-badge">{{ joules }} J</div>
        <div class="ke-row">
          <div class="ke-col">
            <div class="ke-label">kJ</div>
            <div class="ke-val">{{ kj }}</div>
          </div>
          <div class="ke-col">
            <div class="ke-label">kcal</div>
            <div class="ke-val">{{ kcal }}</div>
          </div>
          <div class="ke-col">
            <div class="ke-label">Wh</div>
            <div class="ke-val">{{ wh }}</div>
          </div>
        </div>
        <div class="ke-note">KE = ½ m v²</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const mass = ref<number>(70)
const vel = ref<number>(10)

const error = computed(() => {
  const m = Number(mass.value)
  const v = Number(vel.value)
  if (!Number.isFinite(m) || !Number.isFinite(v)) return 'Enter numbers'
  if (m < 0) return 'Mass must be ≥ 0'
  return ''
})

const joulesRaw = computed(() => 0.5 * Number(mass.value) * Number(vel.value) ** 2)
const joules = computed(() => round(joulesRaw.value))
const kj = computed(() => round(joulesRaw.value / 1000))
const kcal = computed(() => round(joulesRaw.value / 4184))
const wh = computed(() => round(joulesRaw.value / 3600))

function round(v: number) {
  if (Math.abs(v) >= 1e6 || (v !== 0 && Math.abs(v) < 1e-3)) return v.toExponential(3)
  return Math.round(v * 1000) / 1000
}
</script>

<style scoped>
.ke-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 18px;
  background: #FEF3C7;
  color: #78350F;
}

.ke-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.ke-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.ke-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.ke-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.ke-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
