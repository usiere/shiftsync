<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Percent of a number"
        size="large"
      >
        <v-icon size="22">mdi-percent-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Percent Of</div>
      <div class="d-flex align-center" style="gap: 6px;">
        <v-text-field v-model.number="pct" type="number" label="X %" density="compact" variant="outlined" hide-details />
        <span class="po-of">of</span>
        <v-text-field v-model.number="whole" type="number" label="Y" density="compact" variant="outlined" hide-details />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="po-badge">{{ result }}</div>
        <div class="po-note">Complement (100 − X)%: {{ complement }}</div>
        <div class="po-note">Y is {{ whatPct }}% of {{ pct }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const pct = ref<number>(15)
const whole = ref<number>(240)

const error = computed(() => {
  const p = Number(pct.value)
  const w = Number(whole.value)
  if (!Number.isFinite(p) || !Number.isFinite(w)) return 'Enter numbers'
  return ''
})

const result = computed(() => round((Number(pct.value) / 100) * Number(whole.value)))
const complement = computed(() => round(((100 - Number(pct.value)) / 100) * Number(whole.value)))
const whatPct = computed(() => {
  if (Number(pct.value) === 0) return '—'
  return round((Number(whole.value) / Number(pct.value)) * 100)
})

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.po-of {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #94A3B8;
  padding: 0 2px;
}

.po-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 22px;
  background: #DBEAFE;
  color: #1E3A8A;
}

.po-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
