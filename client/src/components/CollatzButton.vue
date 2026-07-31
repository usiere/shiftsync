<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Collatz (3n+1) sequence"
        size="large"
      >
        <v-icon size="22">mdi-chart-line-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Collatz (3n+1)</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Starting integer (≥ 1)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="text-caption text-medium-emphasis mb-1 text-center">
          Steps to 1: <strong>{{ sequence.length - 1 }}</strong> · Peak: <strong>{{ peak }}</strong>
        </div>
        <div class="cz-out">
          <span v-for="(v, i) in sequence" :key="i" class="cz-pill" :class="{ 'cz-pill--peak': v === peak }">{{ v }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(27)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 1) return 'Enter an integer ≥ 1'
  if (v > 10_000_000) return 'Max is 10,000,000'
  return ''
})

const sequence = computed<number[]>(() => {
  if (error.value) return []
  const out = [Number(n.value)]
  let cur = out[0]
  let guard = 0
  while (cur !== 1 && guard < 10000) {
    cur = cur % 2 === 0 ? cur / 2 : 3 * cur + 1
    out.push(cur)
    guard++
  }
  return out
})

const peak = computed(() => sequence.value.reduce((m, v) => (v > m ? v : m), 0))
</script>

<style scoped>
.cz-out {
  max-height: 140px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cz-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 999px;
  background: #EFF6FF;
  color: #1E40AF;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}

.cz-pill--peak {
  background: #FEF3C7;
  color: #92400E;
}
</style>
