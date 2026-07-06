<template>
  <div class="cpu-chip" :title="tooltip">
    <v-icon size="14" class="cpu-chip__icon">mdi-chip</v-icon>
    <span class="cpu-chip__label">{{ cores }} cores</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

const cores = navigator.hardwareConcurrency || 1
const memory = (navigator as NavigatorWithMemory).deviceMemory

const tooltip = computed(() => {
  const parts = [`Logical cores: ${cores}`]
  if (memory) parts.push(`Device memory: ~${memory} GB`)
  parts.push(`Platform: ${navigator.platform || 'unknown'}`)
  return parts.join(' — ')
})
</script>

<style scoped>
.cpu-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.cpu-chip__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1300px) {
  .cpu-chip {
    display: none;
  }
}
</style>
