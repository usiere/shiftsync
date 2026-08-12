<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Weighted rent split"
        size="large"
      >
        <v-icon size="22">mdi-home-account</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Rent Split</div>
      <v-text-field v-model.number="total" type="number" label="Total rent" density="compact" variant="outlined" hide-details min="0" class="mb-2" />
      <v-textarea
        v-model="input"
        label="One person per line: Name Weight"
        density="compact"
        variant="outlined"
        hide-details
        rows="3"
        auto-grow
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div v-for="row in shares" :key="row.name" class="rs-row">
          <span class="rs-name">{{ row.name }}</span>
          <span class="rs-share">{{ row.share }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const total = ref<number>(2100)
const input = ref<string>('Alex 1\nBrooke 1\nCasey 1.5')

interface Row { name: string; weight: number }

const rows = computed<Row[]>(() => {
  return (input.value || '').split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/\s+/)
      const w = Number(parts[parts.length - 1])
      const name = parts.slice(0, -1).join(' ') || parts[0]
      return { name, weight: Number.isFinite(w) ? w : 1 }
    })
})

const error = computed(() => {
  if (rows.value.length === 0) return 'Add at least one person'
  const t = Number(total.value)
  if (!Number.isFinite(t) || t < 0) return 'Total must be ≥ 0'
  const sum = rows.value.reduce((s, r) => s + r.weight, 0)
  if (sum <= 0) return 'Weights must sum > 0'
  return ''
})

const shares = computed(() => {
  const sum = rows.value.reduce((s, r) => s + r.weight, 0)
  return rows.value.map(r => ({
    name: r.name,
    share: (Math.round((r.weight / sum) * Number(total.value) * 100) / 100).toFixed(2),
  }))
})
</script>

<style scoped>
.rs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.rs-name {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 12px;
  color: #0F172A;
}

.rs-share {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 13px;
  color: #166534;
}
</style>
