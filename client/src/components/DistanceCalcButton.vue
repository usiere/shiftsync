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
        title="Point distance calculator"
        size="large"
      >
        <v-icon size="22">mdi-vector-line</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field v-model.number="x1" type="number" label="x1" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="y1" type="number" label="y1" density="compact" variant="outlined" hide-details />
      </div>
      <div class="d-flex gap-8 mb-3">
        <v-text-field v-model.number="x2" type="number" label="x2" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="y2" type="number" label="y2" density="compact" variant="outlined" hide-details />
      </div>

      <div class="dist-grid">
        <div class="dist-cell">
          <div class="dist-label">Euclidean</div>
          <div class="dist-value">{{ euclidean }}</div>
        </div>
        <div class="dist-cell">
          <div class="dist-label">Manhattan</div>
          <div class="dist-value">{{ manhattan }}</div>
        </div>
        <div class="dist-cell">
          <div class="dist-label">Chebyshev</div>
          <div class="dist-value">{{ chebyshev }}</div>
        </div>
        <div class="dist-cell">
          <div class="dist-label">Angle</div>
          <div class="dist-value">{{ angle }}°</div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const x1 = ref(0)
const y1 = ref(0)
const x2 = ref(3)
const y2 = ref(4)

function fmt(v: number): string {
  return Number.isFinite(v)
    ? (Math.round(v * 10_000) / 10_000).toString()
    : '—'
}

const dx = computed(() => x2.value - x1.value)
const dy = computed(() => y2.value - y1.value)

const euclidean = computed(() => fmt(Math.hypot(dx.value, dy.value)))
const manhattan = computed(() => fmt(Math.abs(dx.value) + Math.abs(dy.value)))
const chebyshev = computed(() => fmt(Math.max(Math.abs(dx.value), Math.abs(dy.value))))
const angle = computed(() => fmt((Math.atan2(dy.value, dx.value) * 180) / Math.PI))
</script>

<style scoped>
.dist-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.dist-cell {
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  text-align: center;
}

.dist-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94A3B8;
}

.dist-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  font-weight: 700;
  margin-top: 2px;
}

.gap-8 {
  gap: 8px;
}
</style>
