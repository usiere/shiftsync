<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Circle geometry"
        size="large"
      >
        <v-icon size="22">mdi-circle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Circle</div>
      <v-text-field v-model.number="radius" type="number" label="Radius" density="compact" variant="outlined" hide-details class="mb-2" min="0" @update:model-value="from('r')" />
      <v-text-field v-model.number="diameter" type="number" label="Diameter" density="compact" variant="outlined" hide-details class="mb-2" min="0" @update:model-value="from('d')" />
      <v-text-field v-model.number="circumference" type="number" label="Circumference" density="compact" variant="outlined" hide-details class="mb-2" min="0" @update:model-value="from('c')" />
      <v-text-field v-model.number="area" type="number" label="Area" density="compact" variant="outlined" hide-details min="0" @update:model-value="from('a')" />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const radius = ref<number>(1)
const diameter = ref<number>(2)
const circumference = ref<number>(6.2832)
const area = ref<number>(3.1416)

function round(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.round(n * 10000) / 10000
}

function from(source: 'r' | 'd' | 'c' | 'a') {
  let r = 0
  if (source === 'r') r = Number(radius.value)
  else if (source === 'd') r = Number(diameter.value) / 2
  else if (source === 'c') r = Number(circumference.value) / (2 * Math.PI)
  else r = Math.sqrt(Number(area.value) / Math.PI)
  if (source !== 'r') radius.value = round(r)
  if (source !== 'd') diameter.value = round(2 * r)
  if (source !== 'c') circumference.value = round(2 * Math.PI * r)
  if (source !== 'a') area.value = round(Math.PI * r * r)
}
</script>
