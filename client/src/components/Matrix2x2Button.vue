<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="2×2 matrix"
        size="large"
      >
        <v-icon size="22">mdi-matrix</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">2×2 Matrix</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="a" type="number" label="a" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="b" type="number" label="b" density="compact" variant="outlined" hide-details />
      </div>
      <div class="d-flex mt-2" style="gap: 6px;">
        <v-text-field v-model.number="c" type="number" label="c" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="d" type="number" label="d" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="mx-row">
          <div class="mx-col">
            <div class="mx-label">det</div>
            <div class="mx-val">{{ det }}</div>
          </div>
          <div class="mx-col">
            <div class="mx-label">trace</div>
            <div class="mx-val">{{ trace }}</div>
          </div>
        </div>
        <div class="mx-inv-title">Inverse</div>
        <div v-if="det === 0" class="mx-note">Singular — no inverse</div>
        <template v-else>
          <div class="mx-inv-row">
            <span class="mx-inv-cell">{{ inv[0] }}</span>
            <span class="mx-inv-cell">{{ inv[1] }}</span>
          </div>
          <div class="mx-inv-row">
            <span class="mx-inv-cell">{{ inv[2] }}</span>
            <span class="mx-inv-cell">{{ inv[3] }}</span>
          </div>
        </template>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(1)
const b = ref<number>(2)
const c = ref<number>(3)
const d = ref<number>(4)

const error = computed(() => {
  const vals = [a.value, b.value, c.value, d.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  return ''
})

const det = computed(() => round(Number(a.value) * Number(d.value) - Number(b.value) * Number(c.value)))
const trace = computed(() => round(Number(a.value) + Number(d.value)))

const inv = computed(() => {
  const D = det.value
  if (D === 0) return ['—', '—', '—', '—']
  return [
    round(Number(d.value) / D),
    round(-Number(b.value) / D),
    round(-Number(c.value) / D),
    round(Number(a.value) / D),
  ]
})

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.mx-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.mx-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.mx-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.mx-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.mx-inv-title {
  margin-top: 10px;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
}

.mx-inv-row {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.mx-inv-cell {
  flex: 1;
  padding: 6px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 12px;
}

.mx-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #B91C1C;
}
</style>
