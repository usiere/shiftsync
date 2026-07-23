<template>
  <div class="jd-chip" :title="tooltip">
    <v-icon size="14" class="jd-chip__icon">mdi-calendar-star</v-icon>
    <span class="jd-chip__label">JD {{ julian }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

function julianDay(d: Date): number {
  const jdEpoch = 2440587.5
  return jdEpoch + d.getTime() / 86_400_000
}

const julian = computed(() => julianDay(now.value).toFixed(4))

const tooltip = computed(
  () => `Julian Date: ${julian.value} (days since noon UTC on 24 Nov 4714 BC proleptic Gregorian)`,
)

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.jd-chip {
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

.jd-chip__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1200px) {
  .jd-chip {
    display: none;
  }
}
</style>
