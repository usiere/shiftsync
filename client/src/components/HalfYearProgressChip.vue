<template>
  <div class="hy-chip" :class="`hy-chip--${half}`" :title="tooltip">
    <v-icon size="14" class="hy-chip__icon">mdi-timeline-check-outline</v-icon>
    <span class="hy-chip__label">{{ half.toUpperCase() }} · {{ percent }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const half = computed<'h1' | 'h2'>(() => (now.value.getMonth() < 6 ? 'h1' : 'h2'))

const percent = computed(() => {
  const y = now.value.getFullYear()
  const start = half.value === 'h1'
    ? new Date(y, 0, 1).getTime()
    : new Date(y, 6, 1).getTime()
  const end = half.value === 'h1'
    ? new Date(y, 6, 1).getTime()
    : new Date(y + 1, 0, 1).getTime()
  const pct = ((now.value.getTime() - start) / (end - start)) * 100
  return Math.max(0, Math.min(100, pct)).toFixed(1)
})

const tooltip = computed(
  () => `${percent.value}% through ${half.value.toUpperCase()} ${now.value.getFullYear()}`,
)

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.hy-chip {
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

.hy-chip__icon {
  color: #94A3B8 !important;
}

.hy-chip--h1 { background: #EFF6FF; border-color: #BFDBFE; color: #1E40AF; }
.hy-chip--h1 .hy-chip__icon { color: #2563EB !important; }

.hy-chip--h2 { background: #FEF3C7; border-color: #FDE68A; color: #92400E; }
.hy-chip--h2 .hy-chip__icon { color: #D97706 !important; }

@media (max-width: 1200px) {
  .hy-chip {
    display: none;
  }
}
</style>
