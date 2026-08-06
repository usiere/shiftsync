<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Torus volume &amp; surface"
        size="large"
      >
        <v-icon size="22">mdi-donut</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Torus</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="R" type="number" label="Major R" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="r" type="number" label="Minor r" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="tr-row">
          <div class="tr-col">
            <div class="tr-label">Volume</div>
            <div class="tr-val">{{ volume }}</div>
          </div>
          <div class="tr-col">
            <div class="tr-label">Surface</div>
            <div class="tr-val">{{ surface }}</div>
          </div>
        </div>
        <div class="tr-note">V = 2π² R r² · A = 4π² R r</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const R = ref<number>(5)
const r = ref<number>(2)

const error = computed(() => {
  const Rv = Number(R.value)
  const rv = Number(r.value)
  if (!Number.isFinite(Rv) || !Number.isFinite(rv)) return 'Enter numbers'
  if (Rv < 0 || rv < 0) return 'Values must be ≥ 0'
  if (rv > Rv) return 'Minor r should be ≤ major R'
  return ''
})

const volume = computed(() => round(2 * Math.PI ** 2 * Number(R.value) * Number(r.value) ** 2))
const surface = computed(() => round(4 * Math.PI ** 2 * Number(R.value) * Number(r.value)))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.tr-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.tr-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.tr-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.tr-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.tr-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
