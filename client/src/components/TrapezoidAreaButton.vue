<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Trapezoid area"
        size="large"
      >
        <v-icon size="22">mdi-vector-polygon</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Trapezoid Area</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="a" type="number" label="Base a" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="b" type="number" label="Base b" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <v-text-field v-model.number="h" type="number" label="Height h" density="compact" variant="outlined" hide-details min="0" class="mt-2" />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="tz-badge">A = {{ area }}</div>
        <div class="tz-note">A = ½ (a + b) · h</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(6)
const b = ref<number>(10)
const h = ref<number>(4)

const error = computed(() => {
  const vals = [a.value, b.value, h.value].map(Number)
  if (vals.some(v => !Number.isFinite(v))) return 'Enter numbers'
  if (vals.some(v => v < 0)) return 'Values must be ≥ 0'
  return ''
})

const area = computed(() => Math.round(0.5 * (Number(a.value) + Number(b.value)) * Number(h.value) * 10000) / 10000)
</script>

<style scoped>
.tz-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 17px;
  background: #DBEAFE;
  color: #1E3A8A;
}

.tz-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
