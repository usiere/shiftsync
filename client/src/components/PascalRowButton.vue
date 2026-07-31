<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Pascal's triangle row"
        size="large"
      >
        <v-icon size="22">mdi-triangle</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Pascal's Triangle Row n</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Row (0–20)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="0"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="text-caption text-medium-emphasis text-center mb-2">
          Sum = 2<sup>{{ n }}</sup> = <strong>{{ rowSum }}</strong>
        </div>
        <div class="pt-list">
          <span v-for="(v, i) in row" :key="i" class="pt-pill">{{ v }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(6)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 0) return 'Enter a non-negative integer'
  if (v > 20) return 'Max is 20'
  return ''
})

const row = computed<number[]>(() => {
  if (error.value) return []
  const v = Number(n.value)
  const out: number[] = [1]
  for (let k = 0; k < v; k++) {
    out.push((out[k] * (v - k)) / (k + 1))
  }
  return out
})

const rowSum = computed(() => row.value.reduce((s, x) => s + x, 0))
</script>

<style scoped>
.pt-list {
  max-height: 140px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.pt-pill {
  padding: 3px 8px;
  border-radius: 999px;
  background: #FEE2E2;
  color: #991B1B;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}
</style>
