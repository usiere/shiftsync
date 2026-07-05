<template>
  <div class="vp-size" :title="tooltip">
    <v-icon size="14" class="vp-size__icon">mdi-monitor</v-icon>
    <span class="vp-size__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const width = ref(window.innerWidth)
const height = ref(window.innerHeight)

const label = computed(() => `${width.value}×${height.value}`)

const tooltip = computed(() => {
  const bp = width.value < 600
    ? 'xs'
    : width.value < 960
      ? 'sm'
      : width.value < 1280
        ? 'md'
        : width.value < 1920
          ? 'lg'
          : 'xl'
  return `Viewport ${width.value}×${height.value} (breakpoint: ${bp})`
})

function onResize() {
  width.value = window.innerWidth
  height.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.vp-size {
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

.vp-size__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1280px) {
  .vp-size {
    display: none;
  }
}
</style>
