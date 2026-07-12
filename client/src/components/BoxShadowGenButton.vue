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
        title="CSS box-shadow generator"
        size="large"
      >
        <v-icon size="22">mdi-box-shadow</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="bs-preview-wrap">
        <div class="bs-preview" :style="{ boxShadow: css, background: '#F8FAFC' }" />
      </div>

      <div class="bs-controls">
        <div class="bs-row">
          <span class="bs-label">X</span>
          <v-slider v-model="x" :min="-30" :max="30" :step="1" hide-details density="compact" class="flex-grow-1" />
          <span class="bs-value">{{ x }}px</span>
        </div>
        <div class="bs-row">
          <span class="bs-label">Y</span>
          <v-slider v-model="y" :min="-30" :max="30" :step="1" hide-details density="compact" class="flex-grow-1" />
          <span class="bs-value">{{ y }}px</span>
        </div>
        <div class="bs-row">
          <span class="bs-label">Blur</span>
          <v-slider v-model="blur" :min="0" :max="60" :step="1" hide-details density="compact" class="flex-grow-1" />
          <span class="bs-value">{{ blur }}px</span>
        </div>
        <div class="bs-row">
          <span class="bs-label">Spread</span>
          <v-slider v-model="spread" :min="-20" :max="40" :step="1" hide-details density="compact" class="flex-grow-1" />
          <span class="bs-value">{{ spread }}px</span>
        </div>
        <div class="bs-row">
          <span class="bs-label">Color</span>
          <input type="color" v-model="color" class="bs-color" />
          <v-slider v-model="alpha" :min="0" :max="1" :step="0.05" hide-details density="compact" class="flex-grow-1" />
          <span class="bs-value">{{ Math.round(alpha * 100) }}%</span>
        </div>
        <div class="bs-row">
          <span class="bs-label">Inset</span>
          <v-checkbox v-model="inset" density="compact" hide-details />
        </div>
      </div>

      <div class="d-flex align-center gap-8 mt-2">
        <code class="bs-code flex-grow-1">{{ css }}</code>
        <v-btn size="small" variant="text" @click="copy">
          <v-icon size="16">mdi-content-copy</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const x = ref(0)
const y = ref(4)
const blur = ref(12)
const spread = ref(0)
const color = ref('#0F172A')
const alpha = ref(0.15)
const inset = ref(false)
const notify = useNotificationStore()

function hexToRgb(h: string): string {
  const clean = h.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}

const css = computed(
  () =>
    `${inset.value ? 'inset ' : ''}${x.value}px ${y.value}px ${blur.value}px ${spread.value}px rgba(${hexToRgb(color.value)}, ${alpha.value})`,
)

async function copy() {
  try {
    await navigator.clipboard.writeText(`box-shadow: ${css.value};`)
    notify.showToast({
      type: 'success',
      title: 'Box-shadow copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.bs-preview-wrap {
  padding: 20px;
  background: repeating-conic-gradient(#F1F5F9 0% 25%, #FFFFFF 0% 50%) 50% / 20px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
}

.bs-preview {
  width: 90px;
  height: 90px;
  border-radius: 8px;
}

.bs-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.bs-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bs-label {
  width: 50px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bs-value {
  width: 44px;
  text-align: right;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #64748B;
}

.bs-color {
  width: 30px;
  height: 26px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.bs-code {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  word-break: break-all;
}

.gap-8 {
  gap: 8px;
}
</style>
