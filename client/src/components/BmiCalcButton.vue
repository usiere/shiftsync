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
        title="BMI calculator"
        size="large"
      >
        <v-icon size="22">mdi-scale-bathroom</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <v-btn-toggle v-model="unit" mandatory density="compact" class="mb-2" divided>
        <v-btn value="metric" size="small">Metric</v-btn>
        <v-btn value="imperial" size="small">Imperial</v-btn>
      </v-btn-toggle>

      <div class="d-flex gap-8 mb-3">
        <v-text-field
          v-model.number="weight"
          type="number"
          :label="unit === 'metric' ? 'Weight (kg)' : 'Weight (lb)'"
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model.number="height"
          type="number"
          :label="unit === 'metric' ? 'Height (cm)' : 'Height (in)'"
          density="compact"
          variant="outlined"
          hide-details
        />
      </div>

      <div v-if="valid" class="bmi-result" :class="`bmi-result--${category.key}`">
        <div class="bmi-value">{{ bmi.toFixed(1) }}</div>
        <div class="bmi-category">{{ category.label }}</div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const unit = ref<'metric' | 'imperial'>('metric')
const weight = ref(70)
const height = ref(175)

const valid = computed(
  () =>
    Number.isFinite(weight.value) &&
    weight.value > 0 &&
    Number.isFinite(height.value) &&
    height.value > 0,
)

const bmi = computed(() => {
  if (!valid.value) return 0
  if (unit.value === 'metric') {
    const m = height.value / 100
    return weight.value / (m * m)
  }
  return (weight.value / (height.value * height.value)) * 703
})

const category = computed(() => {
  const b = bmi.value
  if (b < 18.5) return { key: 'under', label: 'Underweight' }
  if (b < 25) return { key: 'normal', label: 'Normal' }
  if (b < 30) return { key: 'over', label: 'Overweight' }
  return { key: 'obese', label: 'Obese' }
})
</script>

<style scoped>
.bmi-result {
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  background: rgba(148, 163, 184, 0.1);
}

.bmi-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 32px;
  font-weight: 700;
}

.bmi-category {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
}

.bmi-result--under {
  background: #EFF6FF;
  color: #1E40AF;
}

.bmi-result--normal {
  background: #F0FDF4;
  color: #166534;
}

.bmi-result--over {
  background: #FEF3C7;
  color: #92400E;
}

.bmi-result--obese {
  background: #FEF2F2;
  color: #991B1B;
}

.gap-8 {
  gap: 8px;
}
</style>
