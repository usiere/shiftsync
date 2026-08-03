<template>
  <div class="q-chip" :title="tooltip">
    <v-icon size="14" class="q-chip__icon">mdi-numeric</v-icon>
    <span class="q-chip__label">Q{{ quarter }}</span>
    <span class="q-chip__meta">{{ progress }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const quarter = computed(() => Math.floor(now.value.getMonth() / 3) + 1)

const quarterBounds = computed(() => {
  const y = now.value.getFullYear()
  const q = quarter.value
  const start = new Date(y, (q - 1) * 3, 1)
  const end = new Date(y, q * 3, 1)
  return { start, end }
})

const progress = computed(() => {
  const { start, end } = quarterBounds.value
  const total = end.getTime() - start.getTime()
  const done = now.value.getTime() - start.getTime()
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)))
})

const tooltip = computed(() => {
  const { start, end } = quarterBounds.value
  const endLabel = new Date(end.getTime() - 86_400_000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `Q${quarter.value} of ${now.value.getFullYear()} · ${startLabel} – ${endLabel} · ${progress.value}% through`
})

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
.q-chip {
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

.q-chip__icon {
  color: #94A3B8 !important;
}

.q-chip__meta {
  color: #94A3B8;
}

@media (max-width: 1200px) {
  .q-chip {
    display: none;
  }
}
</style>
