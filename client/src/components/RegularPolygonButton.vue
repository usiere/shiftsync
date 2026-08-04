<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Regular polygon"
        size="large"
      >
        <v-icon size="22">mdi-pentagon-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Regular Polygon</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="n" type="number" label="Sides n" density="compact" variant="outlined" hide-details min="3" />
        <v-text-field v-model.number="s" type="number" label="Side s" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="rp-row">
          <div class="rp-col">
            <div class="rp-label">Area</div>
            <div class="rp-val">{{ area }}</div>
          </div>
          <div class="rp-col">
            <div class="rp-label">Perimeter</div>
            <div class="rp-val">{{ perim }}</div>
          </div>
        </div>
        <div class="rp-row">
          <div class="rp-col">
            <div class="rp-label">Apothem</div>
            <div class="rp-val">{{ apothem }}</div>
          </div>
          <div class="rp-col">
            <div class="rp-label">Int. angle</div>
            <div class="rp-val">{{ intAngle }}°</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(6)
const s = ref<number>(4)

const error = computed(() => {
  const nv = Number(n.value)
  const sv = Number(s.value)
  if (!Number.isInteger(nv) || nv < 3) return 'Sides must be ≥ 3'
  if (!Number.isFinite(sv) || sv < 0) return 'Side must be ≥ 0'
  return ''
})

const perim = computed(() => round(Number(n.value) * Number(s.value)))
const apothem = computed(() => round(Number(s.value) / (2 * Math.tan(Math.PI / Number(n.value)))))
const area = computed(() => round(0.5 * perim.value * apothem.value))
const intAngle = computed(() => round(((Number(n.value) - 2) * 180) / Number(n.value)))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.rp-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.rp-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.rp-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.rp-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
