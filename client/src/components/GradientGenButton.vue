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
        title="CSS gradient generator"
        size="large"
      >
        <v-icon size="22">mdi-gradient-vertical</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="gradient-preview" :style="{ background: css }" />

      <div class="d-flex align-center gap-8 mt-3">
        <input type="color" v-model="from" class="gg-input" />
        <span class="text-caption text-medium-emphasis">→</span>
        <input type="color" v-model="to" class="gg-input" />
      </div>

      <div class="d-flex align-center gap-8 mt-2">
        <span class="text-caption text-medium-emphasis" style="width: 60px">Angle</span>
        <v-slider
          v-model="angle"
          :min="0"
          :max="360"
          :step="1"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <span class="text-caption" style="width: 40px; text-align: right">
          {{ angle }}°
        </span>
      </div>

      <div class="d-flex align-center gap-8 mt-3">
        <code class="gg-code flex-grow-1">{{ css }}</code>
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
const from = ref('#2563EB')
const to = ref('#7C3AED')
const angle = ref(135)
const notify = useNotificationStore()

const css = computed(
  () => `linear-gradient(${angle.value}deg, ${from.value}, ${to.value})`,
)

async function copy() {
  try {
    await navigator.clipboard.writeText(css.value)
    notify.showToast({
      type: 'success',
      title: 'Gradient CSS copied',
      message: css.value,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.gradient-preview {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.gg-input {
  width: 60px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.gg-code {
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
