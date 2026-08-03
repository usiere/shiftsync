<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Midpoint of two points"
        size="large"
      >
        <v-icon size="22">mdi-vector-point</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Midpoint &amp; Distance</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="x1" type="number" label="x₁" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="y1" type="number" label="y₁" density="compact" variant="outlined" hide-details />
      </div>
      <div class="d-flex mt-2" style="gap: 6px;">
        <v-text-field v-model.number="x2" type="number" label="x₂" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="y2" type="number" label="y₂" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="mp-badge">M = ({{ mx }}, {{ my }})</div>
        <div class="mp-note">Distance: {{ dist }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const x1 = ref<number>(0)
const y1 = ref<number>(0)
const x2 = ref<number>(4)
const y2 = ref<number>(6)

const error = computed(() => {
  const vals = [x1.value, y1.value, x2.value, y2.value].map(Number)
  if (vals.some(v => Number.isNaN(v))) return 'Enter numbers'
  return ''
})

const mx = computed(() => round((Number(x1.value) + Number(x2.value)) / 2))
const my = computed(() => round((Number(y1.value) + Number(y2.value)) / 2))
const dist = computed(() => {
  const dx = Number(x2.value) - Number(x1.value)
  const dy = Number(y2.value) - Number(y1.value)
  return round(Math.hypot(dx, dy))
})

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.mp-badge {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 15px;
  background: #E0E7FF;
  color: #3730A3;
}

.mp-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #475569;
}
</style>
