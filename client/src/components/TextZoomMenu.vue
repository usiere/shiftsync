<template>
  <v-menu location="bottom end" :close-on-content-click="false">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        icon
        variant="text"
        class="me-2"
        title="Text size"
        size="large"
      >
        <span class="text-zoom-activator">Aa</span>
      </v-btn>
    </template>

    <v-list class="text-zoom-menu" density="compact">
      <div class="text-zoom-menu__title">Text size</div>
      <div class="text-zoom-menu__row">
        <button
          class="text-zoom-btn"
          :disabled="atMin"
          title="Decrease text size"
          @click="decrease"
        >
          <v-icon size="16">mdi-format-font-size-decrease</v-icon>
        </button>
        <button
          class="text-zoom-btn text-zoom-btn--wide"
          title="Reset to default"
          @click="reset"
        >
          {{ percent }}%
        </button>
        <button
          class="text-zoom-btn"
          :disabled="atMax"
          title="Increase text size"
          @click="increase"
        >
          <v-icon size="16">mdi-format-font-size-increase</v-icon>
        </button>
      </div>
      <div class="text-zoom-menu__hint">Click the percentage to reset.</div>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  decreaseZoom,
  increaseZoom,
  resetZoom,
  textZoom,
  TEXT_ZOOM_MAX,
  TEXT_ZOOM_MIN,
} from '../utils/textZoom'

const percent = computed(() => Math.round(textZoom.value * 100))
const atMin = computed(() => textZoom.value <= TEXT_ZOOM_MIN + 0.001)
const atMax = computed(() => textZoom.value >= TEXT_ZOOM_MAX - 0.001)

function increase() {
  increaseZoom()
}
function decrease() {
  decreaseZoom()
}
function reset() {
  resetZoom()
}
</script>

<style scoped>
.text-zoom-activator {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: -0.01em;
}

.text-zoom-menu {
  min-width: 220px;
  padding: 10px 12px;
}

.text-zoom-menu__title {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 8px;
}

.text-zoom-menu__row {
  display: flex;
  gap: 6px;
  align-items: stretch;
}

.text-zoom-btn {
  flex: 0 0 auto;
  height: 32px;
  min-width: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: transparent;
  color: rgb(var(--v-theme-on-surface));
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 120ms ease, border-color 120ms ease;
}

.text-zoom-btn--wide {
  flex: 1 1 auto;
  font-variant-numeric: tabular-nums;
}

.text-zoom-btn:hover:not(:disabled) {
  background: rgba(148, 163, 184, 0.12);
  border-color: rgba(148, 163, 184, 0.5);
}

.text-zoom-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.text-zoom-menu__hint {
  margin-top: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #94A3B8;
}
</style>
