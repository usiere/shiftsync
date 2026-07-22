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
        title="Trigonometry calculator"
        size="large"
      >
        <v-icon size="22">mdi-triangle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model.number="angle"
          type="number"
          label="Angle"
          density="compact"
          variant="outlined"
          hide-details
          step="0.01"
        />
        <v-btn-toggle v-model="unit" mandatory density="compact" divided>
          <v-btn value="deg" size="small">°</v-btn>
          <v-btn value="rad" size="small">rad</v-btn>
        </v-btn-toggle>
      </div>

      <div class="tr-grid">
        <div v-for="row in rows" :key="row.name" class="tr-row">
          <span class="tr-name">{{ row.name }}</span>
          <code class="tr-value">{{ row.value }}</code>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const angle = ref(30)
const unit = ref<'deg' | 'rad'>('deg')

function fmt(v: number): string {
  if (!Number.isFinite(v)) return '∞'
  return (Math.round(v * 100_000) / 100_000).toString()
}

const rads = computed(() =>
  unit.value === 'deg' ? (angle.value * Math.PI) / 180 : angle.value,
)

const rows = computed(() => {
  const r = rads.value
  return [
    { name: 'sin', value: fmt(Math.sin(r)) },
    { name: 'cos', value: fmt(Math.cos(r)) },
    { name: 'tan', value: fmt(Math.tan(r)) },
    { name: 'asin', value: fmt(Math.abs(Math.sin(r)) > 1 ? NaN : Math.asin(Math.sin(r))) },
    { name: 'acos', value: fmt(Math.acos(Math.min(1, Math.max(-1, Math.cos(r))))) },
    { name: 'atan', value: fmt(Math.atan(Math.tan(r))) },
    { name: 'radians', value: fmt(r) },
    { name: 'degrees', value: fmt((r * 180) / Math.PI) },
  ]
})
</script>

<style scoped>
.tr-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.tr-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tr-name {
  width: 60px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tr-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
}

.gap-8 {
  gap: 8px;
}
</style>
