<template>
  <div class="yec-chip" :title="tooltip">
    <v-icon size="14" class="yec-chip__icon">mdi-flag-checkered</v-icon>
    <span class="yec-chip__label">
      {{ daysLeft }} {{ daysLeft === 1 ? 'day' : 'days' }} left
    </span>
    <span class="yec-chip__meta">in {{ year }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const year = computed(() => now.value.getFullYear())

const daysLeft = computed(() => {
  const yearEnd = new Date(now.value.getFullYear(), 11, 31, 23, 59, 59, 999)
  const ms = yearEnd.getTime() - now.value.getTime()
  return Math.max(0, Math.ceil(ms / 86_400_000))
})

const tooltip = computed(
  () => `${daysLeft.value} days remaining until Dec 31, ${year.value}`,
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
.yec-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.yec-chip__icon {
  color: #94A3B8 !important;
}

.yec-chip__meta {
  color: #94A3B8;
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 1200px) {
  .yec-chip {
    display: none;
  }
}
</style>
