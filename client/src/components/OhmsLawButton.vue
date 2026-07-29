<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Ohm's law calculator"
        size="large"
      >
        <v-icon size="22">mdi-flash-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-1 text-center">Ohm's law</div>
      <div class="text-caption text-medium-emphasis mb-2 text-center">V = I × R · P = V × I</div>
      <v-select
        v-model="solveFor"
        :items="[
          { title: 'Solve for V (voltage)', value: 'V' },
          { title: 'Solve for I (current)', value: 'I' },
          { title: 'Solve for R (resistance)', value: 'R' },
        ]"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-text-field v-if="solveFor !== 'V'" v-model.number="V" type="number" label="V (volts)" density="compact" variant="outlined" hide-details class="mb-2" />
      <v-text-field v-if="solveFor !== 'I'" v-model.number="I" type="number" label="I (amps)" density="compact" variant="outlined" hide-details class="mb-2" />
      <v-text-field v-if="solveFor !== 'R'" v-model.number="R" type="number" label="R (ohms)" density="compact" variant="outlined" hide-details class="mb-2" />
      <div class="ol-row"><span>{{ solveFor }}</span><span class="ol-value">{{ result }}</span></div>
      <div class="ol-row"><span>Power (W)</span><span class="ol-value">{{ power }}</span></div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const solveFor = ref<'V' | 'I' | 'R'>('V')
const V = ref<number>(5)
const I = ref<number>(0.1)
const R = ref<number>(50)

function fmt(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return Math.abs(n) >= 1000 || (Math.abs(n) > 0 && Math.abs(n) < 0.01)
    ? n.toExponential(3)
    : (Math.round(n * 10000) / 10000).toString()
}

const computed_V = computed(() => Number(I.value) * Number(R.value))
const computed_I = computed(() => Number(V.value) / Number(R.value))
const computed_R = computed(() => Number(V.value) / Number(I.value))

const result = computed(() => {
  if (solveFor.value === 'V') return fmt(computed_V.value)
  if (solveFor.value === 'I') return fmt(computed_I.value)
  return fmt(computed_R.value)
})

const power = computed(() => {
  const v = solveFor.value === 'V' ? computed_V.value : Number(V.value)
  const i = solveFor.value === 'I' ? computed_I.value : Number(I.value)
  return fmt(v * i)
})
</script>

<style scoped>
.ol-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
  font-size: 12px;
}

.ol-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
