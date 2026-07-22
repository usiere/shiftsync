<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Random number in range"
        size="large"
      >
        <v-icon size="22">mdi-numeric-3-box-multiple-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Random number</div>
      <div class="d-flex gap-8 mb-3">
        <v-text-field v-model.number="min" type="number" label="Min" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="max" type="number" label="Max" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="count" type="number" label="Count" density="compact" variant="outlined" hide-details min="1" max="20" />
      </div>
      <div class="rn-out mb-2">
        <span v-for="(v, i) in values" :key="i" class="rn-pill">{{ v }}</span>
        <span v-if="!values.length" class="text-caption text-medium-emphasis">Click generate.</span>
      </div>
      <v-btn color="primary" size="small" @click="generate">
        <v-icon start size="16">mdi-dice-multiple</v-icon>
        Generate
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const min = ref(1)
const max = ref(100)
const count = ref(1)
const values = ref<number[]>([])

function generate() {
  const lo = Math.min(min.value, max.value)
  const hi = Math.max(min.value, max.value)
  const range = hi - lo + 1
  if (!Number.isFinite(range) || range <= 0) return
  const n = Math.max(1, Math.min(20, count.value || 1))
  const bytes = new Uint32Array(n)
  crypto.getRandomValues(bytes)
  values.value = Array.from(bytes, (b) => lo + (b % range))
}
</script>

<style scoped>
.rn-out {
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

.rn-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #EFF6FF;
  color: #1E40AF;
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 13px;
}

.gap-8 {
  gap: 8px;
}
</style>
