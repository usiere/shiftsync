<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Wind chill"
        size="large"
      >
        <v-icon size="22">mdi-weather-windy</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Wind Chill</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="tempC" type="number" label="Air °C" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="windKph" type="number" label="Wind km/h" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="wc-badge">{{ chillC }} °C · {{ chillF }} °F</div>
        <div class="wc-note">"Feels like" via NWS 2001 formula</div>
        <div class="wc-note" v-if="warn">{{ warn }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const tempC = ref<number>(-5)
const windKph = ref<number>(20)

const error = computed(() => {
  const t = Number(tempC.value)
  const w = Number(windKph.value)
  if (!Number.isFinite(t) || !Number.isFinite(w)) return 'Enter numbers'
  if (w < 0) return 'Wind must be ≥ 0'
  return ''
})

const warn = computed(() => {
  const t = Number(tempC.value)
  const w = Number(windKph.value)
  if (t > 10) return 'Formula valid ≤ 10 °C'
  if (w < 4.8) return 'Formula valid at wind ≥ 4.8 km/h'
  return ''
})

const chillC = computed(() => {
  const t = Number(tempC.value)
  const v = Number(windKph.value)
  if (v < 4.8) return round(t)
  const v16 = Math.pow(v, 0.16)
  return round(13.12 + 0.6215 * t - 11.37 * v16 + 0.3965 * t * v16)
})

const chillF = computed(() => round(chillC.value * 9 / 5 + 32))

function round(v: number) {
  return Math.round(v * 10) / 10
}
</script>

<style scoped>
.wc-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 16px;
  background: #DBEAFE;
  color: #1E3A8A;
}

.wc-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
