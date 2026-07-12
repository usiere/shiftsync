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
        title="Percentage calculator"
        size="large"
      >
        <v-icon size="22">mdi-percent</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <v-tabs v-model="tab" density="compact" grow>
        <v-tab value="of" class="text-caption">A% of B</v-tab>
        <v-tab value="ratio" class="text-caption">A is what % of B</v-tab>
        <v-tab value="change" class="text-caption">A → B change</v-tab>
      </v-tabs>

      <div class="mt-3">
        <template v-if="tab === 'of'">
          <div class="d-flex gap-8 mb-2">
            <v-text-field v-model.number="a" type="number" label="A (%)" density="compact" variant="outlined" hide-details />
            <v-text-field v-model.number="b" type="number" label="B" density="compact" variant="outlined" hide-details />
          </div>
          <div class="pct-result">{{ a }}% of {{ b }} = <strong>{{ fmt(a * b / 100) }}</strong></div>
        </template>
        <template v-else-if="tab === 'ratio'">
          <div class="d-flex gap-8 mb-2">
            <v-text-field v-model.number="a" type="number" label="A" density="compact" variant="outlined" hide-details />
            <v-text-field v-model.number="b" type="number" label="B" density="compact" variant="outlined" hide-details />
          </div>
          <div class="pct-result">
            {{ a }} is <strong>{{ ratio }}</strong>% of {{ b }}
          </div>
        </template>
        <template v-else>
          <div class="d-flex gap-8 mb-2">
            <v-text-field v-model.number="a" type="number" label="From" density="compact" variant="outlined" hide-details />
            <v-text-field v-model.number="b" type="number" label="To" density="compact" variant="outlined" hide-details />
          </div>
          <div class="pct-result">
            Change: <strong>{{ change }}%</strong>
          </div>
        </template>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const tab = ref<'of' | 'ratio' | 'change'>('of')
const a = ref(10)
const b = ref(100)

function fmt(v: number): string {
  return Number.isFinite(v) ? Math.round(v * 10_000) / 10_000 + '' : '—'
}

const ratio = computed(() => {
  if (!Number.isFinite(a.value) || !Number.isFinite(b.value) || b.value === 0) return '—'
  return (Math.round((a.value / b.value) * 10_000) / 100).toString()
})

const change = computed(() => {
  if (!Number.isFinite(a.value) || !Number.isFinite(b.value) || a.value === 0) return '—'
  const c = ((b.value - a.value) / Math.abs(a.value)) * 100
  return (Math.round(c * 100) / 100).toString()
})
</script>

<style scoped>
.pct-result {
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
}

.pct-result strong {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-primary));
}

.gap-8 {
  gap: 8px;
}
</style>
