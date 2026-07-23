<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Temperature converter"
        size="large"
      >
        <v-icon size="22">mdi-thermometer</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Temperature</div>
      <v-text-field
        v-model.number="celsius"
        type="number"
        label="Celsius (°C)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        @update:model-value="from('c')"
      />
      <v-text-field
        v-model.number="fahrenheit"
        type="number"
        label="Fahrenheit (°F)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        @update:model-value="from('f')"
      />
      <v-text-field
        v-model.number="kelvin"
        type="number"
        label="Kelvin (K)"
        density="compact"
        variant="outlined"
        hide-details
        @update:model-value="from('k')"
      />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const celsius = ref<number>(0)
const fahrenheit = ref<number>(32)
const kelvin = ref<number>(273.15)

function round(n: number): number {
  return Math.round(n * 100) / 100
}

function from(source: 'c' | 'f' | 'k') {
  if (source === 'c') {
    const c = Number(celsius.value)
    if (!Number.isFinite(c)) return
    fahrenheit.value = round(c * 9 / 5 + 32)
    kelvin.value = round(c + 273.15)
  } else if (source === 'f') {
    const f = Number(fahrenheit.value)
    if (!Number.isFinite(f)) return
    celsius.value = round((f - 32) * 5 / 9)
    kelvin.value = round((f - 32) * 5 / 9 + 273.15)
  } else {
    const k = Number(kelvin.value)
    if (!Number.isFinite(k)) return
    celsius.value = round(k - 273.15)
    fahrenheit.value = round((k - 273.15) * 9 / 5 + 32)
  }
}
</script>
