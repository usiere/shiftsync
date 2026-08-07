<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Dew point"
        size="large"
      >
        <v-icon size="22">mdi-water-thermometer-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Dew Point</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="tempC" type="number" label="Air °C" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="rh" type="number" label="RH %" density="compact" variant="outlined" hide-details min="1" max="100" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="dp-badge">{{ dpC }} °C · {{ dpF }} °F</div>
        <div class="dp-note">{{ comfort }}</div>
        <div class="dp-note">Magnus (a = 17.625, b = 243.04 °C)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const tempC = ref<number>(24)
const rh = ref<number>(55)

const error = computed(() => {
  const t = Number(tempC.value)
  const r = Number(rh.value)
  if (!Number.isFinite(t) || !Number.isFinite(r)) return 'Enter numbers'
  if (r <= 0 || r > 100) return 'RH must be 1-100%'
  return ''
})

const dpC = computed(() => {
  const a = 17.625
  const b = 243.04
  const T = Number(tempC.value)
  const RH = Number(rh.value)
  const gamma = Math.log(RH / 100) + (a * T) / (b + T)
  return round((b * gamma) / (a - gamma))
})

const dpF = computed(() => round(dpC.value * 9 / 5 + 32))

const comfort = computed(() => {
  const d = dpC.value
  if (d < 10) return 'Dry'
  if (d < 13) return 'Comfortable'
  if (d < 16) return 'Pleasant'
  if (d < 18) return 'Sticky'
  if (d < 21) return 'Uncomfortable'
  if (d < 24) return 'Oppressive'
  return 'Severe'
})

function round(v: number) {
  return Math.round(v * 10) / 10
}
</script>

<style scoped>
.dp-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 16px;
  background: #CFFAFE;
  color: #164E63;
}

.dp-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
