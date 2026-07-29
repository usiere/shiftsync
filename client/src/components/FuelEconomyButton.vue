<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Fuel efficiency converter"
        size="large"
      >
        <v-icon size="22">mdi-gas-station-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Fuel economy</div>
      <v-text-field
        v-model.number="mpg"
        type="number"
        label="MPG (US)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
        @update:model-value="from('mpg')"
      />
      <v-text-field
        v-model.number="mpgUk"
        type="number"
        label="MPG (UK)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
        @update:model-value="from('mpgUk')"
      />
      <v-text-field
        v-model.number="lPer100"
        type="number"
        label="L/100 km"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
        @update:model-value="from('lPer100')"
      />
      <v-text-field
        v-model.number="kmPerL"
        type="number"
        label="km/L"
        density="compact"
        variant="outlined"
        hide-details
        min="0"
        @update:model-value="from('kmPerL')"
      />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mpg = ref<number>(30)
const mpgUk = ref<number>(36.03)
const lPer100 = ref<number>(7.84)
const kmPerL = ref<number>(12.75)

function round(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n * 100) / 100
}

function from(source: 'mpg' | 'mpgUk' | 'lPer100' | 'kmPerL') {
  let mpgVal = 0
  if (source === 'mpg') mpgVal = Number(mpg.value)
  else if (source === 'mpgUk') mpgVal = Number(mpgUk.value) * 0.832674
  else if (source === 'lPer100') {
    const l = Number(lPer100.value)
    mpgVal = l > 0 ? 235.215 / l : 0
  } else {
    const k = Number(kmPerL.value)
    mpgVal = k * 2.35215
  }

  if (source !== 'mpg') mpg.value = round(mpgVal)
  if (source !== 'mpgUk') mpgUk.value = round(mpgVal / 0.832674)
  if (source !== 'lPer100') lPer100.value = mpgVal > 0 ? round(235.215 / mpgVal) : 0
  if (source !== 'kmPerL') kmPerL.value = round(mpgVal / 2.35215)
}
</script>
