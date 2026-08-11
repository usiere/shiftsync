<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="HSL to Hex"
        size="large"
      >
        <v-icon size="22">mdi-palette-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">HSL → Hex</div>
      <div class="d-flex" style="gap: 6px;">
        <v-text-field v-model.number="h" type="number" label="H (0-360)" density="compact" variant="outlined" hide-details min="0" max="360" />
        <v-text-field v-model.number="s" type="number" label="S %" density="compact" variant="outlined" hide-details min="0" max="100" />
        <v-text-field v-model.number="l" type="number" label="L %" density="compact" variant="outlined" hide-details min="0" max="100" />
      </div>
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="hh-swatch" :style="{ background: hex }">
          <span class="hh-hex">{{ hex }}</span>
        </div>
        <div class="hh-row">
          <div class="hh-col">
            <div class="hh-label">RGB</div>
            <div class="hh-val">{{ rgb }}</div>
          </div>
          <div class="hh-col">
            <div class="hh-label">HSL</div>
            <div class="hh-val">{{ hslStr }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const h = ref<number>(220)
const s = ref<number>(80)
const l = ref<number>(55)

const error = computed(() => {
  const hv = Number(h.value)
  const sv = Number(s.value)
  const lv = Number(l.value)
  if (![hv, sv, lv].every(Number.isFinite)) return 'Enter numbers'
  if (hv < 0 || hv > 360) return 'H must be 0-360'
  if (sv < 0 || sv > 100 || lv < 0 || lv > 100) return 'S / L must be 0-100'
  return ''
})

function hslToRgb(H: number, S: number, L: number) {
  H = ((H % 360) + 360) % 360
  const s = S / 100
  const l = L / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((H / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (H < 60)      { r = c; g = x; b = 0 }
  else if (H < 120){ r = x; g = c; b = 0 }
  else if (H < 180){ r = 0; g = c; b = x }
  else if (H < 240){ r = 0; g = x; b = c }
  else if (H < 300){ r = x; g = 0; b = c }
  else             { r = c; g = 0; b = x }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)]
}

const rgbArr = computed(() => hslToRgb(Number(h.value), Number(s.value), Number(l.value)))
const rgb = computed(() => `rgb(${rgbArr.value.join(', ')})`)
const hex = computed(() => '#' + rgbArr.value.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase())
const hslStr = computed(() => `hsl(${h.value}, ${s.value}%, ${l.value}%)`)
</script>

<style scoped>
.hh-swatch {
  margin-top: 10px;
  height: 60px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hh-hex {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 16px;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.hh-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.hh-col {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.hh-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 2px;
}

.hh-val {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
  font-size: 11px;
}
</style>
