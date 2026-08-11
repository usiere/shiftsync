<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Unit price comparator"
        size="large"
      >
        <v-icon size="22">mdi-tag-arrow-down-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Unit Price</div>
      <div class="up-block">
        <div class="up-header">Item A</div>
        <div class="d-flex" style="gap: 6px;">
          <v-text-field v-model.number="p1" type="number" label="Price" density="compact" variant="outlined" hide-details min="0" />
          <v-text-field v-model.number="q1" type="number" label="Amount" density="compact" variant="outlined" hide-details min="0" />
        </div>
      </div>
      <div class="up-block mt-2">
        <div class="up-header">Item B</div>
        <div class="d-flex" style="gap: 6px;">
          <v-text-field v-model.number="p2" type="number" label="Price" density="compact" variant="outlined" hide-details min="0" />
          <v-text-field v-model.number="q2" type="number" label="Amount" density="compact" variant="outlined" hide-details min="0" />
        </div>
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="up-row">
          <div class="up-col" :class="cheaper === 'A' ? 'up-col--win' : ''">
            <div class="up-label">A / unit</div>
            <div class="up-val">{{ u1 }}</div>
          </div>
          <div class="up-col" :class="cheaper === 'B' ? 'up-col--win' : ''">
            <div class="up-label">B / unit</div>
            <div class="up-val">{{ u2 }}</div>
          </div>
        </div>
        <div class="up-note">Cheaper: {{ cheaper }} ({{ savings }}% less)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const p1 = ref<number>(6.99)
const q1 = ref<number>(500)
const p2 = ref<number>(11.5)
const q2 = ref<number>(1000)

const error = computed(() => {
  const vals = [p1.value, q1.value, p2.value, q2.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (vals.some(v => v < 0)) return 'Values must be ≥ 0'
  if (Number(q1.value) === 0 || Number(q2.value) === 0) return 'Amount must be > 0'
  return ''
})

const u1 = computed(() => round(Number(p1.value) / Number(q1.value)))
const u2 = computed(() => round(Number(p2.value) / Number(q2.value)))
const cheaper = computed(() => (u1.value === u2.value ? 'Tie' : u1.value < u2.value ? 'A' : 'B'))

const savings = computed(() => {
  const lo = Math.min(u1.value, u2.value)
  const hi = Math.max(u1.value, u2.value)
  if (hi === 0) return 0
  return Math.round(((hi - lo) / hi) * 1000) / 10
})

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.up-block {
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.05);
}

.up-header {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 4px;
}

.up-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.up-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.up-col--win {
  background: #DCFCE7;
}

.up-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.up-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.up-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
