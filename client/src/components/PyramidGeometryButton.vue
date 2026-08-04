<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Square pyramid geometry"
        size="large"
      >
        <v-icon size="22">mdi-pyramid</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Square Pyramid</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="a" type="number" label="Base a" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="h" type="number" label="Height h" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="py-row">
          <div class="py-col">
            <div class="py-label">Volume</div>
            <div class="py-val">{{ volume }}</div>
          </div>
          <div class="py-col">
            <div class="py-label">Surface</div>
            <div class="py-val">{{ surface }}</div>
          </div>
        </div>
        <div class="py-note">Slant ℓ = {{ slant }}</div>
        <div class="py-note">V = ⅓ a² h · A = a² + 2 a ℓ</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(4)
const h = ref<number>(6)

const error = computed(() => {
  const av = Number(a.value)
  const hv = Number(h.value)
  if (!Number.isFinite(av) || !Number.isFinite(hv)) return 'Enter numbers'
  if (av < 0 || hv < 0) return 'Values must be ≥ 0'
  return ''
})

const slant = computed(() => round(Math.hypot(Number(a.value) / 2, Number(h.value))))
const volume = computed(() => round((1 / 3) * Number(a.value) ** 2 * Number(h.value)))
const surface = computed(() => round(Number(a.value) ** 2 + 2 * Number(a.value) * slant.value))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.py-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.py-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.py-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.py-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.py-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
