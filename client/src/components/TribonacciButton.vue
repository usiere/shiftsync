<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Tribonacci sequence"
        size="large"
      >
        <v-icon size="22">mdi-numeric-3-box-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Tribonacci Sequence</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Terms (3–40)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="3"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="text-caption text-medium-emphasis text-center mb-2">
          T({{ n }}) = <strong>{{ sequence[sequence.length - 1] }}</strong>
        </div>
        <div class="tb-list">
          <span v-for="(v, i) in sequence" :key="i" class="tb-pill">{{ v }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const n = ref<number>(15)

const error = computed(() => {
  const v = Number(n.value)
  if (!Number.isInteger(v) || v < 3) return 'Enter an integer ≥ 3'
  if (v > 40) return 'Max is 40'
  return ''
})

const sequence = computed<number[]>(() => {
  if (error.value) return []
  const v = Number(n.value)
  const out = [0, 0, 1]
  for (let i = 3; i < v; i++) {
    out.push(out[i - 1] + out[i - 2] + out[i - 3])
  }
  return out
})
</script>

<style scoped>
.tb-list {
  max-height: 140px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tb-pill {
  padding: 3px 8px;
  border-radius: 999px;
  background: #DBEAFE;
  color: #1E40AF;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}
</style>
