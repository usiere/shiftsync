<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Unit converter"
        size="large"
      >
        <v-icon size="22">mdi-swap-vertical-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-select
        v-model="category"
        :items="categories"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Category"
        class="mb-3"
      />
      <div class="d-flex align-center mb-2 gap-8">
        <v-text-field
          v-model.number="fromValue"
          type="number"
          density="compact"
          variant="outlined"
          hide-details
          class="uc-input"
        />
        <v-select
          v-model="fromUnit"
          :items="unitOptions"
          density="compact"
          variant="outlined"
          hide-details
          class="uc-unit"
        />
      </div>
      <div class="d-flex align-center gap-8">
        <div class="uc-result flex-grow-1">
          <div class="text-body-1">{{ formatted }}</div>
        </div>
        <v-select
          v-model="toUnit"
          :items="unitOptions"
          density="compact"
          variant="outlined"
          hide-details
          class="uc-unit"
        />
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type Category = 'length' | 'mass' | 'temperature'

interface UnitDef {
  label: string
  value: string
  toBase: (v: number) => number
  fromBase: (v: number) => number
}

const open = ref(false)
const category = ref<Category>('length')
const fromValue = ref<number>(1)
const fromUnit = ref<string>('m')
const toUnit = ref<string>('ft')

const categories = [
  { label: 'Length', value: 'length' },
  { label: 'Mass', value: 'mass' },
  { label: 'Temperature', value: 'temperature' },
]

const UNITS: Record<Category, UnitDef[]> = {
  length: [
    { label: 'Meter (m)', value: 'm', toBase: (v) => v, fromBase: (v) => v },
    { label: 'Kilometer (km)', value: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { label: 'Centimeter (cm)', value: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { label: 'Inch (in)', value: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { label: 'Foot (ft)', value: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { label: 'Mile (mi)', value: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  ],
  mass: [
    { label: 'Kilogram (kg)', value: 'kg', toBase: (v) => v, fromBase: (v) => v },
    { label: 'Gram (g)', value: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { label: 'Pound (lb)', value: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
    { label: 'Ounce (oz)', value: 'oz', toBase: (v) => v * 0.0283495231, fromBase: (v) => v / 0.0283495231 },
    { label: 'Stone (st)', value: 'st', toBase: (v) => v * 6.35029318, fromBase: (v) => v / 6.35029318 },
  ],
  temperature: [
    { label: 'Celsius (°C)', value: 'c', toBase: (v) => v, fromBase: (v) => v },
    { label: 'Fahrenheit (°F)', value: 'f', toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
    { label: 'Kelvin (K)', value: 'k', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
}

const unitOptions = computed(() =>
  UNITS[category.value].map((u) => ({ title: u.label, value: u.value })),
)

const result = computed(() => {
  const units = UNITS[category.value]
  const from = units.find((u) => u.value === fromUnit.value)
  const to = units.find((u) => u.value === toUnit.value)
  if (!from || !to) return 0
  const raw = fromValue.value
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0
  return to.fromBase(from.toBase(raw))
})

const formatted = computed(() => {
  if (!Number.isFinite(result.value)) return '—'
  const rounded = Math.round(result.value * 10_000) / 10_000
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 4 })
})

watch(category, (c) => {
  const units = UNITS[c]
  fromUnit.value = units[0].value
  toUnit.value = units[1]?.value ?? units[0].value
})
</script>

<style scoped>
.uc-input {
  flex: 1 1 auto;
}

.uc-unit {
  flex: 0 0 130px;
  max-width: 130px;
}

.uc-result {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
}

.gap-8 {
  gap: 8px;
}
</style>
