<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Speed of sound in air"
        size="large"
      >
        <v-icon size="22">mdi-volume-source</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Speed of Sound (air)</div>
      <v-text-field v-model.number="tempC" type="number" label="Air °C" density="compact" variant="outlined" hide-details />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="sp-badge">{{ ms }} m/s</div>
        <div class="sp-row">
          <div class="sp-col">
            <div class="sp-label">km/h</div>
            <div class="sp-val">{{ kph }}</div>
          </div>
          <div class="sp-col">
            <div class="sp-label">mph</div>
            <div class="sp-val">{{ mph }}</div>
          </div>
          <div class="sp-col">
            <div class="sp-label">Mach 1</div>
            <div class="sp-val">{{ ms }}</div>
          </div>
        </div>
        <div class="sp-note">v = 331.3 · √(1 + T/273.15) m/s</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const tempC = ref<number>(20)

const error = computed(() => {
  const t = Number(tempC.value)
  if (!Number.isFinite(t)) return 'Enter temp'
  if (t < -273.15) return 'Below absolute zero'
  return ''
})

const ms = computed(() => round(331.3 * Math.sqrt(1 + Number(tempC.value) / 273.15)))
const kph = computed(() => round(ms.value * 3.6))
const mph = computed(() => round(ms.value * 2.2369362920544))

function round(v: number) {
  return Math.round(v * 10) / 10
}
</script>

<style scoped>
.sp-badge {
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

.sp-row {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.sp-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.sp-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.sp-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.sp-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
