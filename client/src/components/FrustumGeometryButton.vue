<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Cone frustum"
        size="large"
      >
        <v-icon size="22">mdi-cup-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Cone Frustum</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="r1" type="number" label="Bottom R" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="r2" type="number" label="Top r" density="compact" variant="outlined" hide-details min="0" />
      </div>
      <v-text-field v-model.number="h" type="number" label="Height h" density="compact" variant="outlined" hide-details min="0" class="mt-2" />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="fr-row">
          <div class="fr-col">
            <div class="fr-label">Volume</div>
            <div class="fr-val">{{ volume }}</div>
          </div>
          <div class="fr-col">
            <div class="fr-label">Surface</div>
            <div class="fr-val">{{ surface }}</div>
          </div>
        </div>
        <div class="fr-note">Slant ℓ = {{ slant }}</div>
        <div class="fr-note">V = ⅓πh (R² + Rr + r²)</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const r1 = ref<number>(5)
const r2 = ref<number>(3)
const h = ref<number>(8)

const error = computed(() => {
  const R = Number(r1.value)
  const r = Number(r2.value)
  const hv = Number(h.value)
  if (![R, r, hv].every(Number.isFinite)) return 'Enter numbers'
  if (R < 0 || r < 0 || hv < 0) return 'Values must be ≥ 0'
  return ''
})

const slant = computed(() => round(Math.hypot(Number(r1.value) - Number(r2.value), Number(h.value))))

const volume = computed(() => {
  const R = Number(r1.value)
  const r = Number(r2.value)
  return round((1 / 3) * Math.PI * Number(h.value) * (R * R + R * r + r * r))
})

const surface = computed(() => {
  const R = Number(r1.value)
  const r = Number(r2.value)
  const lateral = Math.PI * (R + r) * slant.value
  const bases = Math.PI * (R * R + r * r)
  return round(lateral + bases)
})

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.fr-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.fr-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.fr-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.fr-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.fr-note {
  margin-top: 6px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
