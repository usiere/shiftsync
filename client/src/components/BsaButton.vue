<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Body surface area"
        size="large"
      >
        <v-icon size="22">mdi-human</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">BSA (Mosteller)</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="weight" type="number" label="Weight kg" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="height" type="number" label="Height cm" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="bs-badge">{{ bsa }} m²</div>
        <div class="bs-note">√(cm · kg / 3600)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const weight = ref<number>(70)
const height = ref<number>(175)

const error = computed(() => {
  const w = Number(weight.value)
  const h = Number(height.value)
  if (!Number.isFinite(w) || !Number.isFinite(h)) return 'Enter numbers'
  if (w <= 0 || h <= 0) return 'Values must be > 0'
  return ''
})

const bsa = computed(() => Math.round(Math.sqrt((Number(weight.value) * Number(height.value)) / 3600) * 100) / 100)
</script>

<style scoped>
.bs-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 20px;
  background: #E0E7FF;
  color: #3730A3;
}

.bs-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
