<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Regular tetrahedron"
        size="large"
      >
        <v-icon size="22">mdi-triangle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Regular Tetrahedron</div>
      <v-text-field
        v-model.number="a"
        type="number"
        label="Edge a"
        density="compact"
        variant="outlined"
        hide-details
        min="0"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="te-row">
          <div class="te-col">
            <div class="te-label">Volume</div>
            <div class="te-val">{{ volume }}</div>
          </div>
          <div class="te-col">
            <div class="te-label">Surface</div>
            <div class="te-val">{{ surface }}</div>
          </div>
        </div>
        <div class="te-row">
          <div class="te-col">
            <div class="te-label">Height</div>
            <div class="te-val">{{ height }}</div>
          </div>
          <div class="te-col">
            <div class="te-label">Inradius</div>
            <div class="te-val">{{ inradius }}</div>
          </div>
        </div>
        <div class="te-note">V = a³ / (6√2) · A = √3 · a²</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const a = ref<number>(4)

const error = computed(() => {
  const v = Number(a.value)
  if (!Number.isFinite(v) || v < 0) return 'Edge must be ≥ 0'
  return ''
})

const volume = computed(() => round(Number(a.value) ** 3 / (6 * Math.sqrt(2))))
const surface = computed(() => round(Math.sqrt(3) * Number(a.value) ** 2))
const height = computed(() => round(Number(a.value) * Math.sqrt(2 / 3)))
const inradius = computed(() => round(Number(a.value) / (2 * Math.sqrt(6))))

function round(v: number) {
  return Math.round(v * 10000) / 10000
}
</script>

<style scoped>
.te-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.te-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.te-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.te-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}

.te-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
