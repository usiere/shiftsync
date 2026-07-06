<template>
  <div class="locale-chip" :title="tooltip">
    <v-icon size="14" class="locale-chip__icon">mdi-translate</v-icon>
    <span class="locale-chip__label">{{ locale }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const locale = navigator.language || 'en-US'

const tooltip = computed(() => {
  try {
    const display = new Intl.DisplayNames([locale], { type: 'language' })
    const region = new Intl.DisplayNames([locale], { type: 'region' })
    const parts = locale.split('-')
    const langName = display.of(parts[0])
    const regionName = parts[1] ? region.of(parts[1]) : null
    if (regionName) return `Browser locale: ${langName} (${regionName}) — ${locale}`
    return `Browser locale: ${langName} — ${locale}`
  } catch {
    return `Browser locale: ${locale}`
  }
})
</script>

<style scoped>
.locale-chip {
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

.locale-chip__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1300px) {
  .locale-chip {
    display: none;
  }
}
</style>
