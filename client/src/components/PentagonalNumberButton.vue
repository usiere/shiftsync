<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Pentagonal numbers"
        size="large"
      >
        <v-icon size="22">mdi-pentagon-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Pentagonal Numbers P(n) = n(3n−1)/2</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="n (1–100)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="text-caption text-medium-emphasis text-center mb-2">
          P({{ n }}) = <strong>{{ Pn }}</strong>
        </div>
        <div class="pg-list">
          <span v-for="(v, i) in sequence" :key="i" class="pg-pill">{{ v }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(10)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 1) return 'Enter an integer ≥ 1'
  if (v > 100) return 'Max is 100'
  return ''
})

const Pn = computed(() => {
  const v = Number(n.value)
  return (v * (3 * v - 1)) / 2
})

const sequence = computed<number[]>(() => {
  if (error.value) return []
  const v = Number(n.value)
  const out: number[] = []
  for (let i = 1; i <= v; i++) out.push((i * (3 * i - 1)) / 2)
  return out
})
</script>

<style scoped>
.pg-list {
  max-height: 140px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pg-pill {
  padding: 3px 8px;
  border-radius: 999px;
  background: #FCE7F3;
  color: #9D174D;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}
</style>
