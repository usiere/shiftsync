<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Cooking measurement converter"
        size="large"
      >
        <v-icon size="22">mdi-chef-hat</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Cooking units</div>
      <div class="d-flex gap-8 mb-2">
        <v-text-field v-model.number="amount" type="number" label="Amount" density="compact" variant="outlined" hide-details />
        <v-select v-model="from" :items="unitItems" density="compact" variant="outlined" hide-details />
      </div>
      <div v-for="u in UNITS" :key="u.key" class="cc-row" :class="{ 'cc-row--from': u.key === from }">
        <span class="cc-name">{{ u.label }}</span>
        <span class="cc-value">{{ format(amount * u.mlPer ? asUnit(u.key) : asUnit(u.key)) }}</span>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const UNITS = [
  { key: 'tsp',   label: 'Teaspoon (tsp)',     mlPer: 4.92892 },
  { key: 'tbsp',  label: 'Tablespoon (tbsp)',  mlPer: 14.7868 },
  { key: 'floz',  label: 'US fluid oz',        mlPer: 29.5735 },
  { key: 'cup',   label: 'US cup',             mlPer: 236.588 },
  { key: 'pint',  label: 'US pint',            mlPer: 473.176 },
  { key: 'quart', label: 'US quart',           mlPer: 946.353 },
  { key: 'ml',    label: 'Milliliter (ml)',    mlPer: 1 },
  { key: 'l',     label: 'Liter (l)',          mlPer: 1000 },
] as const

type UnitKey = typeof UNITS[number]['key']

const amount = ref<number>(1)
const from = ref<UnitKey>('cup')

const unitItems = UNITS.map((u) => ({ title: u.label, value: u.key }))

const totalMl = computed(() => {
  const u = UNITS.find((x) => x.key === from.value)
  return (Number(amount.value) || 0) * (u?.mlPer ?? 0)
})

function asUnit(key: UnitKey): number {
  const u = UNITS.find((x) => x.key === key)
  if (!u) return 0
  return totalMl.value / u.mlPer
}

function format(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return (Math.round(n * 1000) / 1000).toString()
}
</script>

<style scoped>
.gap-8 { gap: 8px; }

.cc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.06);
  margin-bottom: 3px;
  font-size: 12px;
}

.cc-row--from {
  background: #EFF6FF;
}

.cc-name {
  color: #1E293B;
}

.cc-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
