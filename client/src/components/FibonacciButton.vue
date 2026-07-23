<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Fibonacci generator"
        size="large"
      >
        <v-icon size="22">mdi-spiral</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Fibonacci sequence</div>
      <v-text-field
        v-model.number="count"
        type="number"
        label="How many terms"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
        max="100"
      />
      <div class="fb-out">
        <span v-for="(v, i) in terms" :key="i" class="fb-pill">{{ v }}</span>
        <span v-if="!terms.length" class="text-caption text-medium-emphasis">Enter 1–100.</span>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const count = ref<number>(10)

const terms = computed<string[]>(() => {
  const n = Math.floor(Number(count.value))
  if (!Number.isInteger(n) || n < 1 || n > 100) return []
  const out: bigint[] = [0n, 1n]
  while (out.length < n) out.push(out[out.length - 1] + out[out.length - 2])
  return out.slice(0, n).map((v) => v.toString())
})
</script>

<style scoped>
.fb-out {
  min-height: 60px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  align-items: center;
}

.fb-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  background: #EEF2FF;
  color: #3730A3;
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 12px;
  word-break: break-all;
}
</style>
