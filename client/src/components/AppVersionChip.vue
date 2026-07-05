<template>
  <div class="app-version" :title="tooltip">
    <v-icon size="14" class="app-version__icon">mdi-tag-outline</v-icon>
    <span class="app-version__label">v{{ version }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const version = __APP_VERSION__
const buildTime = __APP_BUILD_TIME__

const tooltip = computed(() => {
  try {
    const d = new Date(buildTime)
    return `ShiftSync v${version} — built ${d.toLocaleString()}`
  } catch {
    return `ShiftSync v${version}`
  }
})
</script>

<style scoped>
.app-version {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.app-version__icon {
  color: #94A3B8 !important;
}

.app-version__label {
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1200px) {
  .app-version {
    display: none;
  }
}
</style>
