<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="RGB ↔ HSL converter"
        size="large"
      >
        <v-icon size="22">mdi-palette-swatch-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">RGB ↔ HSL</div>
      <div class="rh-swatch" :style="{ background: hex }"></div>
      <div class="d-flex gap-8 mb-2 mt-2">
        <v-text-field v-model.number="r" type="number" label="R" density="compact" variant="outlined" hide-details min="0" max="255" />
        <v-text-field v-model.number="g" type="number" label="G" density="compact" variant="outlined" hide-details min="0" max="255" />
        <v-text-field v-model.number="b" type="number" label="B" density="compact" variant="outlined" hide-details min="0" max="255" />
      </div>
      <div class="rh-row"><span>HSL</span><span class="rh-value">{{ hslCss }}</span></div>
      <div class="rh-row"><span>HEX</span><span class="rh-value">{{ hex }}</span></div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const r = ref<number>(59)
const g = ref<number>(130)
const b = ref<number>(246)

function clamp255(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)))
}

const rr = computed(() => clamp255(r.value))
const gg = computed(() => clamp255(g.value))
const bb = computed(() => clamp255(b.value))

const hex = computed(() => {
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `#${h(rr.value)}${h(gg.value)}${h(bb.value)}`.toUpperCase()
})

const hslCss = computed(() => {
  const R = rr.value / 255, G = gg.value / 255, B = bb.value / 255
  const max = Math.max(R, G, B), min = Math.min(R, G, B)
  const l = (max + min) / 2
  let h = 0, s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)); break
      case G: h = ((B - R) / d + 2); break
      default: h = ((R - G) / d + 4)
    }
    h *= 60
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
})
</script>

<style scoped>
.gap-8 { gap: 8px; }

.rh-swatch {
  height: 48px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.4);
}

.rh-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
  font-size: 12px;
}

.rh-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
