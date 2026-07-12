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
        title="CSS border-radius generator"
        size="large"
      >
        <v-icon size="22">mdi-rounded-corner</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="br-preview-wrap">
        <div class="br-preview" :style="{ borderRadius: css }" />
      </div>

      <v-checkbox v-model="linked" density="compact" hide-details label="Same on all corners" class="mb-2" />

      <template v-if="linked">
        <div class="d-flex align-center gap-8 mb-2">
          <span class="br-label">All</span>
          <v-slider v-model="all" :min="0" :max="80" :step="1" hide-details density="compact" class="flex-grow-1" />
          <span class="br-value">{{ all }}px</span>
        </div>
      </template>
      <template v-else>
        <div v-for="c in corners" :key="c.key" class="d-flex align-center gap-8 mb-1">
          <span class="br-label">{{ c.label }}</span>
          <v-slider :model-value="values[c.key]" @update:model-value="values[c.key] = $event" :min="0" :max="80" :step="1" hide-details density="compact" class="flex-grow-1" />
          <span class="br-value">{{ values[c.key] }}px</span>
        </div>
      </template>

      <div class="d-flex align-center gap-8 mt-2">
        <code class="br-code flex-grow-1">border-radius: {{ css }};</code>
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

type Corner = 'tl' | 'tr' | 'br' | 'bl'

const open = ref(false)
const linked = ref(true)
const all = ref(12)
const values = reactive<Record<Corner, number>>({ tl: 12, tr: 12, br: 12, bl: 12 })
const notify = useNotificationStore()

const corners: Array<{ key: Corner; label: string }> = [
  { key: 'tl', label: 'Top-L' },
  { key: 'tr', label: 'Top-R' },
  { key: 'br', label: 'Bot-R' },
  { key: 'bl', label: 'Bot-L' },
]

const css = computed(() => {
  if (linked.value) return `${all.value}px`
  return `${values.tl}px ${values.tr}px ${values.br}px ${values.bl}px`
})

async function copy() {
  try {
    await navigator.clipboard.writeText(`border-radius: ${css.value};`)
    notify.showToast({
      type: 'success',
      title: 'Border-radius copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.br-preview-wrap {
  padding: 12px;
  background: repeating-conic-gradient(#F1F5F9 0% 25%, #FFFFFF 0% 50%) 50% / 20px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 130px;
  margin-bottom: 8px;
}

.br-preview {
  width: 90px;
  height: 90px;
  background: #2563EB;
}

.br-label {
  width: 46px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.br-value {
  width: 44px;
  text-align: right;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #64748B;
}

.br-code {
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
