<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="2D vector calculator"
        size="large"
      >
        <v-icon size="22">mdi-vector-arrange-below</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">2D Vectors</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="ax" type="number" label="a.x" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="ay" type="number" label="a.y" density="compact" variant="outlined" hide-details />
      </div>
      <div class="d-flex mt-2" style="gap: 6px;">
        <v-text-field v-model.number="bx" type="number" label="b.x" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="by" type="number" label="b.y" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="v2-row">
          <div class="v2-col">
            <div class="v2-label">|a|</div>
            <div class="v2-val">{{ magA }}</div>
          </div>
          <div class="v2-col">
            <div class="v2-label">|b|</div>
            <div class="v2-val">{{ magB }}</div>
          </div>
        </div>
        <div class="v2-row">
          <div class="v2-col">
            <div class="v2-label">a·b</div>
            <div class="v2-val">{{ dot }}</div>
          </div>
          <div class="v2-col">
            <div class="v2-label">∠(a,b)</div>
            <div class="v2-val">{{ angle }}°</div>
          </div>
        </div>
        <div class="v2-note">a + b = ({{ sx }}, {{ sy }})</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const ax = ref<number>(3)
const ay = ref<number>(4)
const bx = ref<number>(1)
const by = ref<number>(2)

const error = computed(() => {
  const vals = [ax.value, ay.value, bx.value, by.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  return ''
})

const magA = computed(() => round(Math.hypot(Number(ax.value), Number(ay.value))))
const magB = computed(() => round(Math.hypot(Number(bx.value), Number(by.value))))
const dot = computed(() => round(Number(ax.value) * Number(bx.value) + Number(ay.value) * Number(by.value)))
const sx = computed(() => round(Number(ax.value) + Number(bx.value)))
const sy = computed(() => round(Number(ay.value) + Number(by.value)))

const angle = computed(() => {
  const denom = magA.value * magB.value
  if (denom === 0) return 0
  const cos = Math.max(-1, Math.min(1, dot.value / denom))
  return round((Math.acos(cos) * 180) / Math.PI)
})

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.v2-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.v2-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.v2-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.v2-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.v2-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
