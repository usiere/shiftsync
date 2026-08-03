<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Pizza planner"
        size="large"
      >
        <v-icon size="22">mdi-pizza</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Pizza Planner</div>
      <v-text-field
        v-model.number="people"
        type="number"
        label="Number of people"
        density="compact"
        variant="outlined"
        hide-details
        min="1"
        class="mb-2"
      />
      <v-select
        v-model="hunger"
        :items="hungerLevels"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Appetite"
      />
      <v-select
        v-model="size"
        :items="sizes"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Pizza size"
        class="mt-2"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="pz-badge">{{ pizzas }} pizza{{ pizzas === 1 ? '' : 's' }}</div>
        <div class="pz-note">≈ {{ slices }} slices · {{ perPerson }} per person</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const people = ref<number>(8)
const hunger = ref<number>(3)
const size = ref<number>(8)

const hungerLevels = [
  { label: 'Light (2 slices)', value: 2 },
  { label: 'Normal (3 slices)', value: 3 },
  { label: 'Big (4 slices)', value: 4 },
  { label: 'Huge (5 slices)', value: 5 },
]

const sizes = [
  { label: 'Small (6 slices)', value: 6 },
  { label: 'Medium (8 slices)', value: 8 },
  { label: 'Large (10 slices)', value: 10 },
  { label: 'XL (12 slices)', value: 12 },
]

const error = computed(() => {
  const p = Number(people.value)
  if (!Number.isInteger(p) || p < 1) return 'Enter ≥ 1 person'
  if (p > 10000) return 'Max 10,000 people'
  return ''
})

const slices = computed(() => Number(people.value) * Number(hunger.value))
const pizzas = computed(() => Math.ceil(slices.value / Number(size.value)))
const perPerson = computed(() => Number(hunger.value))
</script>

<style scoped>
.pz-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 20px;
  background: #FEE2E2;
  color: #991B1B;
}

.pz-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
