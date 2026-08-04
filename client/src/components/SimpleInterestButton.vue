<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Simple interest"
        size="large"
      >
        <v-icon size="22">mdi-cash-plus</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Simple Interest</div>
      <v-text-field v-model.number="p" type="number" label="Principal" density="compact" variant="outlined" hide-details class="mb-2" />
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="r" type="number" label="Rate %/yr" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="t" type="number" label="Years" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="si-row">
          <div class="si-col">
            <div class="si-label">Interest</div>
            <div class="si-val">{{ interest }}</div>
          </div>
          <div class="si-col">
            <div class="si-label">Total</div>
            <div class="si-val">{{ total }}</div>
          </div>
        </div>
        <div class="si-note">I = P · r · t</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const p = ref<number>(1000)
const r = ref<number>(5)
const t = ref<number>(3)

const error = computed(() => {
  const vals = [p.value, r.value, t.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (vals.some(v => v < 0)) return 'Values must be ≥ 0'
  return ''
})

const interest = computed(() => round((Number(p.value) * Number(r.value) * Number(t.value)) / 100))
const total = computed(() => round(Number(p.value) + interest.value))

function round(v: number) {
  return Math.round(v * 100) / 100
}
</script>

<style scoped>
.si-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.si-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.si-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.si-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.si-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
