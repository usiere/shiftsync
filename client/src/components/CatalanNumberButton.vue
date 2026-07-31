<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Catalan numbers"
        size="large"
      >
        <v-icon size="22">mdi-graph-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Catalan Numbers</div>
      <v-text-field
        v-model.number="n"
        type="number"
        label="Count (1–20)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        min="1"
      />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="cn-list">
          <span v-for="(v, i) in sequence" :key="i" class="cn-pill">C<sub>{{ i }}</sub>={{ v }}</span>
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
  if (v > 20) return 'Max is 20 (values grow fast)'
  return ''
})

const sequence = computed<number[]>(() => {
  if (error.value) return []
  const v = Number(n.value)
  const out: number[] = [1]
  for (let i = 1; i < v; i++) {
    out.push((out[i - 1] * 2 * (2 * i - 1)) / (i + 1))
  }
  return out
})
</script>

<style scoped>
.cn-list {
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cn-pill {
  padding: 3px 8px;
  border-radius: 999px;
  background: #E0F2FE;
  color: #075985;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 11px;
}
</style>
