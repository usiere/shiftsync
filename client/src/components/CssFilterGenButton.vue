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
        title="CSS filter generator"
        size="large"
      >
        <v-icon size="22">mdi-image-filter-vintage</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <div class="cf-preview-wrap">
        <div class="cf-preview" :style="{ filter: css }" />
      </div>

      <div class="cf-controls">
        <div v-for="f in filters" :key="f.key" class="cf-row">
          <span class="cf-label">{{ f.label }}</span>
          <v-slider
            :model-value="values[f.key]"
            @update:model-value="values[f.key] = $event"
            :min="f.min"
            :max="f.max"
            :step="f.step"
            hide-details
            density="compact"
            class="flex-grow-1"
          />
          <span class="cf-value">{{ values[f.key] }}{{ f.unit }}</span>
        </div>
      </div>

      <div class="d-flex align-center gap-8 mt-2">
        <code class="cf-code flex-grow-1">filter: {{ css }};</code>
        <v-btn size="small" variant="text" @click="copy">
          <v-icon size="16">mdi-content-copy</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

interface FilterDef {
  key: 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'hue' | 'saturate'
  label: string
  min: number
  max: number
  step: number
  unit: string
  cssFn: (v: number) => string
  identity: number
}

const open = ref(false)
const notify = useNotificationStore()

const filters: FilterDef[] = [
  { key: 'blur', label: 'Blur', min: 0, max: 20, step: 1, unit: 'px', cssFn: (v) => `blur(${v}px)`, identity: 0 },
  { key: 'brightness', label: 'Bright', min: 0, max: 200, step: 1, unit: '%', cssFn: (v) => `brightness(${v}%)`, identity: 100 },
  { key: 'contrast', label: 'Contrast', min: 0, max: 200, step: 1, unit: '%', cssFn: (v) => `contrast(${v}%)`, identity: 100 },
  { key: 'grayscale', label: 'Gray', min: 0, max: 100, step: 1, unit: '%', cssFn: (v) => `grayscale(${v}%)`, identity: 0 },
  { key: 'hue', label: 'Hue', min: 0, max: 360, step: 1, unit: 'deg', cssFn: (v) => `hue-rotate(${v}deg)`, identity: 0 },
  { key: 'saturate', label: 'Sat', min: 0, max: 200, step: 1, unit: '%', cssFn: (v) => `saturate(${v}%)`, identity: 100 },
]

const values = reactive<Record<FilterDef['key'], number>>({
  blur: 0,
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  hue: 0,
  saturate: 100,
})

const css = computed(() => {
  const parts = filters
    .filter((f) => values[f.key] !== f.identity)
    .map((f) => f.cssFn(values[f.key]))
  return parts.join(' ') || 'none'
})

async function copy() {
  try {
    await navigator.clipboard.writeText(`filter: ${css.value};`)
    notify.showToast({
      type: 'success',
      title: 'Filter CSS copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.cf-preview-wrap {
  padding: 12px;
  background: repeating-conic-gradient(#F1F5F9 0% 25%, #FFFFFF 0% 50%) 50% / 20px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  margin-bottom: 8px;
}

.cf-preview {
  width: 76px;
  height: 76px;
  border-radius: 12px;
  background: linear-gradient(135deg, #F97316 0%, #DB2777 50%, #2563EB 100%);
}

.cf-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cf-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cf-label {
  width: 62px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.cf-value {
  width: 52px;
  text-align: right;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #64748B;
}

.cf-code {
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
