<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="GCD / LCM calculator"
        size="large"
      >
        <v-icon size="22">mdi-vector-intersection</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">GCD &amp; LCM</div>
      <div class="d-flex gap-8 mb-2">
        <v-text-field v-model.number="a" type="number" label="a" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="b" type="number" label="b" density="compact" variant="outlined" hide-details />
      </div>
      <div class="gl-row">
        <span class="text-caption text-medium-emphasis">GCD</span>
        <span class="gl-value">{{ error ? '—' : gcdVal }}</span>
      </div>
      <div class="gl-row">
        <span class="text-caption text-medium-emphasis">LCM</span>
        <span class="gl-value">{{ error ? '—' : lcmVal }}</span>
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(12)
const b = ref<number>(18)

function gcd(x: number, y: number): number {
  x = Math.abs(x)
  y = Math.abs(y)
  while (y) {
    [x, y] = [y, x % y]
  }
  return x
}

const error = computed(() => {
  const x = Number(a.value), y = Number(b.value)
  if (!Number.isInteger(x) || !Number.isInteger(y)) return 'Enter integers'
  if (x === 0 && y === 0) return 'GCD/LCM undefined for (0, 0)'
  return ''
})

const gcdVal = computed(() => gcd(Number(a.value), Number(b.value)))
const lcmVal = computed(() => {
  const g = gcdVal.value
  if (!g) return 0
  return Math.abs(Number(a.value) * Number(b.value)) / g
})
</script>

<style scoped>
.gap-8 { gap: 8px; }

.gl-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
}

.gl-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
