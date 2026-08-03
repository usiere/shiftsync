<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Resistor color code (4-band)"
        size="large"
      >
        <v-icon size="22">mdi-resistor</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Resistor Color (4-band)</div>
      <div class="rc-band-row">
        <v-select v-model="b1" :items="digitBands" density="compact" variant="outlined" hide-details label="Band 1" />
        <v-select v-model="b2" :items="digitBands" density="compact" variant="outlined" hide-details label="Band 2" />
      </div>
      <div class="rc-band-row">
        <v-select v-model="b3" :items="multBands" density="compact" variant="outlined" hide-details label="Mult" />
        <v-select v-model="b4" :items="tolBands" density="compact" variant="outlined" hide-details label="Tol" />
      </div>
      <div class="rc-preview">
        <span class="rc-swatch" :style="{ background: colorHex(b1) }"></span>
        <span class="rc-swatch" :style="{ background: colorHex(b2) }"></span>
        <span class="rc-swatch" :style="{ background: colorHex(b3) }"></span>
        <span class="rc-swatch rc-swatch--tol" :style="{ background: colorHex(b4) }"></span>
      </div>
      <div class="rc-badge">{{ formatted }}</div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const COLORS: Record<string, { digit?: number; mult?: number; tol?: number; hex: string }> = {
  Black:  { digit: 0, mult: 1e0, hex: '#111827' },
  Brown:  { digit: 1, mult: 1e1, tol: 1,   hex: '#7C2D12' },
  Red:    { digit: 2, mult: 1e2, tol: 2,   hex: '#DC2626' },
  Orange: { digit: 3, mult: 1e3,           hex: '#EA580C' },
  Yellow: { digit: 4, mult: 1e4,           hex: '#EAB308' },
  Green:  { digit: 5, mult: 1e5, tol: 0.5, hex: '#16A34A' },
  Blue:   { digit: 6, mult: 1e6, tol: 0.25,hex: '#2563EB' },
  Violet: { digit: 7, mult: 1e7, tol: 0.1, hex: '#7C3AED' },
  Grey:   { digit: 8, mult: 1e8, tol: 0.05,hex: '#6B7280' },
  White:  { digit: 9, mult: 1e9,           hex: '#F3F4F6' },
  Gold:   {           mult: 0.1, tol: 5,   hex: '#CA8A04' },
  Silver: {           mult: 0.01,tol: 10,  hex: '#94A3B8' },
}

const digitBands = Object.entries(COLORS).filter(([, v]) => v.digit !== undefined).map(([k]) => k)
const multBands = Object.entries(COLORS).filter(([, v]) => v.mult !== undefined).map(([k]) => k)
const tolBands = Object.entries(COLORS).filter(([, v]) => v.tol !== undefined).map(([k]) => k)

const b1 = ref('Yellow')
const b2 = ref('Violet')
const b3 = ref('Red')
const b4 = ref('Gold')

const colorHex = (name: string) => COLORS[name]?.hex || '#94A3B8'

const value = computed(() => {
  const d1 = COLORS[b1.value]?.digit ?? 0
  const d2 = COLORS[b2.value]?.digit ?? 0
  const mult = COLORS[b3.value]?.mult ?? 1
  return (d1 * 10 + d2) * mult
})

const formatted = computed(() => {
  const v = value.value
  const tol = COLORS[b4.value]?.tol
  let str: string
  if (v >= 1e6) str = `${(v / 1e6).toFixed(2).replace(/\.?0+$/, '')} MΩ`
  else if (v >= 1e3) str = `${(v / 1e3).toFixed(2).replace(/\.?0+$/, '')} kΩ`
  else if (v < 1) str = `${v.toFixed(2).replace(/\.?0+$/, '')} Ω`
  else str = `${v} Ω`
  return `${str} ± ${tol}%`
})
</script>

<style scoped>
.rc-band-row {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}

.rc-preview {
  display: flex;
  gap: 4px;
  justify-content: center;
  margin: 10px 0 8px;
  padding: 8px 4px;
  background: #F1F5F9;
  border-radius: 6px;
}

.rc-swatch {
  width: 18px;
  height: 34px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.rc-swatch--tol {
  margin-left: 12px;
}

.rc-badge {
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 14px;
  background: #F1F5F9;
  color: #0F172A;
}
</style>
