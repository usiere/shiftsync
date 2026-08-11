<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Baker's percentage"
        size="large"
      >
        <v-icon size="22">mdi-bread-slice-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Baker's Percentage</div>
      <v-text-field v-model.number="flour" type="number" label="Flour (g) = 100%" density="compact" variant="outlined" hide-details min="0" class="mb-2" />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="hydration" type="number" label="Hydration %" density="compact" variant="outlined" hide-details min="0" max="200" />
        <v-text-field v-model.number="salt" type="number" label="Salt %" density="compact" variant="outlined" hide-details min="0" max="10" />
      </div>
      <div class="d-flex mt-2" style="gap: 6px;">
        <v-text-field v-model.number="yeast" type="number" label="Yeast %" density="compact" variant="outlined" hide-details min="0" max="10" />
        <v-text-field v-model.number="starter" type="number" label="Starter %" density="compact" variant="outlined" hide-details min="0" max="100" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="bp-badge">Total dough: {{ total }} g</div>
        <div class="bp-row">
          <div class="bp-col">Water<span>{{ waterG }} g</span></div>
          <div class="bp-col">Salt<span>{{ saltG }} g</span></div>
          <div class="bp-col">Yeast<span>{{ yeastG }} g</span></div>
          <div class="bp-col">Starter<span>{{ starterG }} g</span></div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const flour = ref<number>(500)
const hydration = ref<number>(70)
const salt = ref<number>(2)
const yeast = ref<number>(1)
const starter = ref<number>(0)

const error = computed(() => {
  const vals = [flour.value, hydration.value, salt.value, yeast.value, starter.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (Number(flour.value) < 0) return 'Flour must be ≥ 0'
  return ''
})

const waterG = computed(() => round(Number(flour.value) * Number(hydration.value) / 100))
const saltG = computed(() => round(Number(flour.value) * Number(salt.value) / 100))
const yeastG = computed(() => round(Number(flour.value) * Number(yeast.value) / 100))
const starterG = computed(() => round(Number(flour.value) * Number(starter.value) / 100))
const total = computed(() => round(Number(flour.value) + waterG.value + saltG.value + yeastG.value + starterG.value))

function round(v: number) {
  return Math.round(v * 10) / 10
}
</script>

<style scoped>
.bp-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 15px;
  background: #FEF3C7;
  color: #78350F;
}

.bp-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  margin-top: 8px;
}

.bp-col {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
}

.bp-col span {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
  text-transform: none;
  letter-spacing: normal;
}
</style>
