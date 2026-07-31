<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Perfect number checker"
        size="large"
      >
        <v-icon size="22">mdi-check-decagram-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Perfect Number Check</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Positive integer"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="pn-badge" :class="{ 'pn-badge--yes': isPerfect, 'pn-badge--no': !isPerfect }">
          {{ isPerfect ? 'Perfect' : 'Not perfect' }}
        </div>
        <div class="text-caption text-medium-emphasis text-center mt-2">
          Sum of proper divisors: <strong>{{ divisorSum }}</strong>
        </div>
        <div class="pn-div-list">
          <span v-for="d in divisors" :key="d" class="pn-pill">{{ d }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(28)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 1) return 'Enter a positive integer'
  if (v > 1_000_000) return 'Max is 1,000,000'
  return ''
})

const divisors = computed<number[]>(() => {
  if (error.value) return []
  const v = Number(n.value)
  const out: number[] = []
  for (let i = 1; i * i <= v; i++) {
    if (v % i === 0) {
      if (i !== v) out.push(i)
      const j = v / i
      if (j !== i && j !== v) out.push(j)
    }
  }
  return out.sort((a, b) => a - b)
})

const divisorSum = computed(() => divisors.value.reduce((s, d) => s + d, 0))
const isPerfect = computed(() => !error.value && Number(n.value) > 1 && divisorSum.value === Number(n.value))
</script>

<style scoped>
.pn-badge {
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.pn-badge--yes {
  background: #DCFCE7;
  color: #166534;
}

.pn-badge--no {
  background: #FEE2E2;
  color: #991B1B;
}

.pn-div-list {
  margin-top: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 6px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pn-pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: #EFF6FF;
  color: #1E40AF;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}
</style>
