<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Angle unit converter"
        size="large"
      >
        <v-icon size="22">mdi-angle-acute</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Angle</div>
      <v-text-field v-model.number="deg" type="number" label="Degrees (°)" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="from('deg')" />
      <v-text-field v-model.number="rad" type="number" label="Radians" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="from('rad')" />
      <v-text-field v-model.number="grad" type="number" label="Gradians" density="compact" variant="outlined" hide-details class="mb-2" @update:model-value="from('grad')" />
      <v-text-field v-model.number="turns" type="number" label="Turns" density="compact" variant="outlined" hide-details @update:model-value="from('turns')" />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const deg = ref<number>(45)
const rad = ref<number>(0.7854)
const grad = ref<number>(50)
const turns = ref<number>(0.125)

function round(n: number): number {
  return Math.round(n * 100000) / 100000
}

function from(source: 'deg' | 'rad' | 'grad' | 'turns') {
  let d = 0
  if (source === 'deg') d = Number(deg.value)
  else if (source === 'rad') d = (Number(rad.value) * 180) / Math.PI
  else if (source === 'grad') d = Number(grad.value) * 0.9
  else d = Number(turns.value) * 360
  if (source !== 'deg') deg.value = round(d)
  if (source !== 'rad') rad.value = round((d * Math.PI) / 180)
  if (source !== 'grad') grad.value = round(d / 0.9)
  if (source !== 'turns') turns.value = round(d / 360)
}
</script>
