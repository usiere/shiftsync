<template>
  <div class="mc-chip" :title="tooltip">
    <v-icon size="14" class="mc-chip__icon">mdi-cursor-move</v-icon>
    <span class="mc-chip__label">{{ x }},{{ y }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const x = ref(0)
const y = ref(0)

function onMove(e: MouseEvent) {
  x.value = e.clientX
  y.value = e.clientY
}

const tooltip = computed(() => `Cursor at (${x.value}, ${y.value})`)

onMounted(() => {
  window.addEventListener('mousemove', onMove, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMove)
})
</script>

<style scoped>
.mc-chip {
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

.mc-chip__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1400px) {
  .mc-chip {
    display: none;
  }
}
</style>
