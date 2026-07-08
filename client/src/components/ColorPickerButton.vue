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
        title="Color picker"
        size="large"
      >
        <v-icon size="22">mdi-eyedropper-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="240" class="pa-3">
      <div class="d-flex align-center mb-3">
        <input type="color" v-model="hex" class="cp-input" />
        <div class="cp-preview" :style="{ background: hex }" />
      </div>
      <div class="cp-values">
        <div class="cp-row">
          <span class="cp-label">HEX</span>
          <code class="cp-value">{{ hex }}</code>
          <v-btn size="x-small" variant="text" @click="copy(hex)">Copy</v-btn>
        </div>
        <div class="cp-row">
          <span class="cp-label">RGB</span>
          <code class="cp-value">{{ rgb }}</code>
          <v-btn size="x-small" variant="text" @click="copy(rgb)">Copy</v-btn>
        </div>
        <div class="cp-row">
          <span class="cp-label">HSL</span>
          <code class="cp-value">{{ hsl }}</code>
          <v-btn size="x-small" variant="text" @click="copy(hsl)">Copy</v-btn>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const hex = ref('#2563EB')
const notify = useNotificationStore()

function hexToRgb(h: string): { r: number; g: number; b: number } {
  const clean = h.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return { r, g, b }
}

const rgb = computed(() => {
  const { r, g, b } = hexToRgb(hex.value)
  return `rgb(${r}, ${g}, ${b})`
})

const hsl = computed(() => {
  const { r, g, b } = hexToRgb(hex.value)
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let s = 0
  let h = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
      case gn: h = (bn - rn) / d + 2; break
      case bn: h = (rn - gn) / d + 4; break
    }
    h *= 60
  }
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
})

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify.showToast({
      type: 'success',
      title: 'Color copied',
      message: text,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.cp-input {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.cp-preview {
  flex: 1;
  height: 40px;
  margin-left: 10px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.cp-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cp-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cp-label {
  width: 32px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cp-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
}
</style>
