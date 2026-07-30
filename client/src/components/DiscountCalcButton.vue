<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Discount price calculator"
        size="large"
      >
        <v-icon size="22">mdi-tag-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Discount</div>
      <v-text-field v-model.number="price" type="number" label="Price" density="compact" variant="outlined" hide-details class="mb-2" min="0" />
      <v-text-field v-model.number="discount" type="number" label="Discount (%)" density="compact" variant="outlined" hide-details class="mb-2" min="0" max="100" step="0.5" />
      <v-slider v-model="discount" :min="0" :max="100" :step="1" hide-details class="mb-2" />
      <div v-if="error" class="text-caption text-error text-center">{{ error }}</div>
      <template v-else>
        <div class="dc-row"><span>You save</span><span class="dc-value dc-save">−{{ savings }}</span></div>
        <div class="dc-row"><span>Final price</span><span class="dc-value dc-final">{{ final }}</span></div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const price = ref<number>(99.99)
const discount = ref<number>(20)

const error = computed(() => {
  const p = Number(price.value), d = Number(discount.value)
  if (!Number.isFinite(p) || p < 0) return 'Enter a valid price'
  if (!Number.isFinite(d) || d < 0 || d > 100) return 'Discount must be 0–100%'
  return ''
})

function fmt(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const savings = computed(() => fmt(Number(price.value) * (Number(discount.value) / 100)))
const final = computed(() => fmt(Number(price.value) * (1 - Number(discount.value) / 100)))
</script>

<style scoped>
.dc-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
  font-size: 12px;
}

.dc-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
}

.dc-save { color: #DC2626; }
.dc-final { color: #166534; }
</style>
