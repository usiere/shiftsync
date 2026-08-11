<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="TDEE calculator"
        size="large"
      >
        <v-icon size="22">mdi-fire</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">TDEE (Mifflin-St Jeor)</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="age" type="number" label="Age" density="compact" variant="outlined" hide-details min="1" />
        <v-select v-model="sex" :items="['Male','Female']" density="compact" variant="outlined" hide-details label="Sex" style="max-width: 100px;" />
      </div>
      <div class="d-flex mt-2" style="gap: 6px;">
        <v-text-field v-model.number="weight" type="number" label="kg" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="height" type="number" label="cm" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <v-select
        v-model.number="activity"
        :items="activities"
        item-title="label"
        item-value="value"
        density="compact"
        variant="outlined"
        hide-details
        label="Activity"
        class="mt-2"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="td-badge">{{ tdee }} kcal / day</div>
        <div class="td-note">BMR: {{ bmr }} kcal</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const age = ref<number>(30)
const sex = ref<string>('Male')
const weight = ref<number>(75)
const height = ref<number>(175)
const activity = ref<number>(1.55)

const activities = [
  { label: 'Sedentary (1.20)', value: 1.2 },
  { label: 'Light (1.375)', value: 1.375 },
  { label: 'Moderate (1.55)', value: 1.55 },
  { label: 'Active (1.725)', value: 1.725 },
  { label: 'Very active (1.9)', value: 1.9 },
]

const error = computed(() => {
  const vals = [age.value, weight.value, height.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (vals.some(v => v <= 0)) return 'Values must be > 0'
  return ''
})

const bmr = computed(() => {
  const w = Number(weight.value)
  const h = Number(height.value)
  const a = Number(age.value)
  const base = 10 * w + 6.25 * h - 5 * a
  return Math.round(sex.value === 'Male' ? base + 5 : base - 161)
})

const tdee = computed(() => Math.round(bmr.value * Number(activity.value)))
</script>

<style scoped>
.td-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 18px;
  background: #FEF3C7;
  color: #78350F;
}

.td-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
