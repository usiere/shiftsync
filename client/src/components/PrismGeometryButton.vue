<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Rectangular prism"
        size="large"
      >
        <v-icon size="22">mdi-cube-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Rectangular Prism</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="l" type="number" label="Length" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="w" type="number" label="Width" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="h" type="number" label="Height" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="pr-row">
          <div class="pr-col">
            <div class="pr-label">Volume</div>
            <div class="pr-val">{{ volume }}</div>
          </div>
          <div class="pr-col">
            <div class="pr-label">Surface</div>
            <div class="pr-val">{{ surface }}</div>
          </div>
        </div>
        <div class="pr-row">
          <div class="pr-col">
            <div class="pr-label">Diagonal</div>
            <div class="pr-val">{{ diag }}</div>
          </div>
          <div class="pr-col">
            <div class="pr-label">Edges</div>
            <div class="pr-val">{{ edges }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const l = ref<number>(4)
const w = ref<number>(3)
const h = ref<number>(5)

const error = computed(() => {
  const vals = [l.value, w.value, h.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (vals.some(v => v < 0)) return 'Values must be ≥ 0'
  return ''
})

const L = computed(() => Number(l.value))
const W = computed(() => Number(w.value))
const H = computed(() => Number(h.value))

const volume = computed(() => round(L.value * W.value * H.value))
const surface = computed(() => round(2 * (L.value * W.value + L.value * H.value + W.value * H.value)))
const diag = computed(() => round(Math.hypot(L.value, W.value, H.value)))
const edges = computed(() => round(4 * (L.value + W.value + H.value)))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.pr-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.pr-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.pr-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.pr-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
