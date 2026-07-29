<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Half-life decay calculator"
        size="large"
      >
        <v-icon size="22">mdi-atom-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Half-life decay</div>
      <v-text-field v-model.number="initial" type="number" label="Initial amount" density="compact" variant="outlined" hide-details class="mb-2" min="0" />
      <v-text-field v-model.number="halfLife" type="number" label="Half-life" density="compact" variant="outlined" hide-details class="mb-2" min="0" />
      <v-text-field v-model.number="elapsed" type="number" label="Elapsed time" density="compact" variant="outlined" hide-details class="mb-2" min="0" />
      <div class="text-caption text-medium-emphasis mb-2 text-center">
        (Use same time units for half-life and elapsed)
      </div>
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="hl-row"><span>Remaining</span><span class="hl-value">{{ remaining }}</span></div>
        <div class="hl-row"><span>Fraction left</span><span class="hl-value">{{ fraction }}%</span></div>
        <div class="hl-row"><span>Half-lives passed</span><span class="hl-value">{{ passed }}</span></div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const initial = ref<number>(100)
const halfLife = ref<number>(10)
const elapsed = ref<number>(30)

const error = computed(() => {
  const i = Number(initial.value), h = Number(halfLife.value), e = Number(elapsed.value)
  if (!Number.isFinite(i) || i < 0) return 'Enter a valid initial amount'
  if (!Number.isFinite(h) || h <= 0) return 'Half-life must be > 0'
  if (!Number.isFinite(e) || e < 0) return 'Elapsed time must be ≥ 0'
  return ''
})

const passedRaw = computed(() => Number(elapsed.value) / Number(halfLife.value))
const remainingRaw = computed(() => Number(initial.value) * Math.pow(0.5, passedRaw.value))
const fractionRaw = computed(() => Math.pow(0.5, passedRaw.value) * 100)

function fmt(n: number, decimals = 4): string {
  return (Math.round(n * 10 ** decimals) / 10 ** decimals).toString()
}

const remaining = computed(() => fmt(remainingRaw.value))
const fraction = computed(() => fmt(fractionRaw.value, 2))
const passed = computed(() => fmt(passedRaw.value, 3))
</script>

<style scoped>
.hl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
  font-size: 12px;
}

.hl-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
