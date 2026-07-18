<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Aspect ratio calculator"
        size="large"
      >
        <v-icon size="22">mdi-aspect-ratio</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="d-flex gap-8 mb-3">
        <v-text-field v-model.number="ratioW" type="number" label="Ratio W" density="compact" variant="outlined" hide-details />
        <v-text-field v-model.number="ratioH" type="number" label="Ratio H" density="compact" variant="outlined" hide-details />
      </div>

      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model.number="width"
          type="number"
          label="Width (px)"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="fromWidth"
        />
        <v-text-field
          v-model.number="height"
          type="number"
          label="Height (px)"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="fromHeight"
        />
      </div>

      <div class="text-caption text-medium-emphasis mb-2">
        Ratio: <strong>{{ simplified }}</strong> · {{ label }}
      </div>

      <div class="d-flex flex-wrap gap-8">
        <button
          v-for="p in presets"
          :key="p.label"
          class="preset-btn"
          @click="applyPreset(p.w, p.h)"
        >
          {{ p.label }}
        </button>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const ratioW = ref(16)
const ratioH = ref(9)
const width = ref(1920)
const height = ref(1080)

const presets = [
  { label: '16:9', w: 16, h: 9 },
  { label: '4:3', w: 4, h: 3 },
  { label: '3:2', w: 3, h: 2 },
  { label: '1:1', w: 1, h: 1 },
  { label: '21:9', w: 21, h: 9 },
  { label: '9:16', w: 9, h: 16 },
]

function fromWidth(raw: string | number) {
  const w = typeof raw === 'number' ? raw : parseFloat(raw)
  if (!Number.isFinite(w) || !ratioW.value) return
  width.value = w
  height.value = Math.round((w * ratioH.value) / ratioW.value)
}

function fromHeight(raw: string | number) {
  const h = typeof raw === 'number' ? raw : parseFloat(raw)
  if (!Number.isFinite(h) || !ratioH.value) return
  height.value = h
  width.value = Math.round((h * ratioW.value) / ratioH.value)
}

function applyPreset(w: number, h: number) {
  ratioW.value = w
  ratioH.value = h
  fromWidth(width.value)
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

const simplified = computed(() => {
  if (!ratioW.value || !ratioH.value) return '—'
  const g = gcd(Math.round(ratioW.value), Math.round(ratioH.value))
  return `${Math.round(ratioW.value) / g}:${Math.round(ratioH.value) / g}`
})

const label = computed(() => {
  if (!ratioW.value || !ratioH.value) return ''
  return `${(ratioW.value / ratioH.value).toFixed(4)} decimal`
})
</script>

<style scoped>
.preset-btn {
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: transparent;
  border-radius: 4px;
  padding: 2px 8px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  cursor: pointer;
}

.preset-btn:hover {
  background: rgba(148, 163, 184, 0.12);
}

.gap-8 {
  gap: 8px;
}
</style>
