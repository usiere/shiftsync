<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Cone volume &amp; surface"
        size="large"
      >
        <v-icon size="22">mdi-cone</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Cone</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="r" type="number" label="Radius r" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="h" type="number" label="Height h" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="co-row">
          <div class="co-col">
            <div class="co-label">Volume</div>
            <div class="co-val">{{ volume }}</div>
          </div>
          <div class="co-col">
            <div class="co-label">Surface</div>
            <div class="co-val">{{ surface }}</div>
          </div>
        </div>
        <div class="co-note">V = ⅓ π r² h · A = π r (r + ℓ)</div>
        <div class="co-note">Slant ℓ = {{ slant }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const r = ref<number>(3)
const h = ref<number>(4)

const error = computed(() => {
  const rv = Number(r.value)
  const hv = Number(h.value)
  if (!Number.isFinite(rv) || !Number.isFinite(hv)) return 'Enter numbers'
  if (rv < 0 || hv < 0) return 'Values must be ≥ 0'
  return ''
})

const slant = computed(() => round(Math.hypot(Number(r.value), Number(h.value))))
const volume = computed(() => round((1 / 3) * Math.PI * Number(r.value) ** 2 * Number(h.value)))
const surface = computed(() => round(Math.PI * Number(r.value) * (Number(r.value) + slant.value)))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.co-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.co-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.co-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.co-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.co-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
