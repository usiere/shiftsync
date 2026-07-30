<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Speed unit converter"
        size="large"
      >
        <v-icon size="22">mdi-speedometer-medium</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Speed</div>
      <v-text-field v-model.number="mps" type="number" label="m/s" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="from('mps')" />
      <v-text-field v-model.number="kmh" type="number" label="km/h" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="from('kmh')" />
      <v-text-field v-model.number="mph" type="number" label="mph" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="from('mph')" />
      <v-text-field v-model.number="knots" type="number" label="knots" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="from('knots')" />
      <v-text-field v-model.number="mach" type="number" label="Mach" density="compact" variant="outlined" hide-details @update:model-value="from('mach')" />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mps = ref<number>(1)
const kmh = ref<number>(3.6)
const mph = ref<number>(2.2369)
const knots = ref<number>(1.9438)
const mach = ref<number>(0.00292)

function round(n: number): number {
  return Math.round(n * 10000) / 10000
}

function from(source: 'mps' | 'kmh' | 'mph' | 'knots' | 'mach') {
  let m = 0
  if (source === 'mps') m = Number(mps.value)
  else if (source === 'kmh') m = Number(kmh.value) / 3.6
  else if (source === 'mph') m = Number(mph.value) * 0.44704
  else if (source === 'knots') m = Number(knots.value) * 0.514444
  else m = Number(mach.value) * 343
  if (source !== 'mps') mps.value = round(m)
  if (source !== 'kmh') kmh.value = round(m * 3.6)
  if (source !== 'mph') mph.value = round(m / 0.44704)
  if (source !== 'knots') knots.value = round(m / 0.514444)
  if (source !== 'mach') mach.value = round(m / 343)
}
</script>
