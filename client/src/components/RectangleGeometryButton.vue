<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Rectangle geometry"
        size="large"
      >
        <v-icon size="22">mdi-rectangle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Rectangle</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="w" type="number" label="Width w" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="h" type="number" label="Height h" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="rc-row">
          <div class="rc-col">
            <div class="rc-label">Area</div>
            <div class="rc-val">{{ area }}</div>
          </div>
          <div class="rc-col">
            <div class="rc-label">Perimeter</div>
            <div class="rc-val">{{ perim }}</div>
          </div>
        </div>
        <div class="rc-row">
          <div class="rc-col">
            <div class="rc-label">Diagonal</div>
            <div class="rc-val">{{ diag }}</div>
          </div>
          <div class="rc-col">
            <div class="rc-label">Aspect</div>
            <div class="rc-val">{{ aspect }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const w = ref<number>(16)
const h = ref<number>(9)

const error = computed(() => {
  const wv = Number(w.value)
  const hv = Number(h.value)
  if (!Number.isFinite(wv) || !Number.isFinite(hv)) return 'Enter numbers'
  if (wv < 0 || hv < 0) return 'Values must be ≥ 0'
  return ''
})

const area = computed(() => round(Number(w.value) * Number(h.value)))
const perim = computed(() => round(2 * (Number(w.value) + Number(h.value))))
const diag = computed(() => round(Math.hypot(Number(w.value), Number(h.value))))

const aspect = computed(() => {
  const wv = Number(w.value)
  const hv = Number(h.value)
  if (wv <= 0 || hv <= 0) return '—'
  const g = gcd(Math.round(wv * 1000), Math.round(hv * 1000))
  return `${Math.round((wv * 1000) / g)}:${Math.round((hv * 1000) / g)}`
})

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a || 1
}

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.rc-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.rc-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.rc-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.rc-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
