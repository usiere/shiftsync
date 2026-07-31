<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Triangular numbers"
        size="large"
      >
        <v-icon size="22">mdi-triangle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Triangular Numbers T(n) = n(n+1)/2</div>
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
          T({{ n }}) = <strong>{{ Tn }}</strong>
        </div>
        <div class="tn-list">
          <span v-for="(v, i) in sequence" :key="i" class="tn-pill">{{ v }}</span>
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

const Tn = computed(() => {
  const v = Number(n.value)
  return (v * (v + 1)) / 2
})

const sequence = computed<number[]>(() => {
  if (error.value) return []
  const v = Number(n.value)
  const out: number[] = []
  for (let i = 1; i <= v; i++) out.push((i * (i + 1)) / 2)
  return out
})
</script>

<style scoped>
.tn-list {
  max-height: 140px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tn-pill {
  padding: 3px 8px;
  border-radius: 999px;
  background: #EDE9FE;
  color: #5B21B6;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}
</style>
