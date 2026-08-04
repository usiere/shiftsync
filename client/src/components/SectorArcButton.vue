<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Circle sector &amp; arc"
        size="large"
      >
        <v-icon size="22">mdi-arc</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Sector &amp; Arc</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="r" type="number" label="Radius r" density="compact" variant="outlined" hide-details min="0" />
        <v-text-field v-model.number="deg" type="number" label="Angle °" density="compact" variant="outlined" hide-details min="0" max="360" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="sa-row">
          <div class="sa-col">
            <div class="sa-label">Arc length</div>
            <div class="sa-val">{{ arcLen }}</div>
          </div>
          <div class="sa-col">
            <div class="sa-label">Sector area</div>
            <div class="sa-val">{{ area }}</div>
          </div>
        </div>
        <div class="sa-note">{{ deg }}° = {{ radians }} rad · chord {{ chord }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const r = ref<number>(5)
const deg = ref<number>(60)

const error = computed(() => {
  const rv = Number(r.value)
  const dv = Number(deg.value)
  if (!Number.isFinite(rv) || !Number.isFinite(dv)) return 'Enter numbers'
  if (rv < 0) return 'Radius must be ≥ 0'
  if (dv < 0 || dv > 360) return 'Angle 0-360°'
  return ''
})

const radians = computed(() => round((Number(deg.value) * Math.PI) / 180))
const arcLen = computed(() => round(Number(r.value) * radians.value))
const area = computed(() => round(0.5 * Number(r.value) ** 2 * radians.value))
const chord = computed(() => round(2 * Number(r.value) * Math.sin(radians.value / 2)))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.sa-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.sa-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.sa-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.sa-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.sa-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
