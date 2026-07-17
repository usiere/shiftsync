<template>
  <div class="nh-chip" :title="tooltip">
    <v-icon size="14" class="nh-chip__icon">mdi-clock-fast</v-icon>
    <span class="nh-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const nextHour = computed(() => {
  const d = new Date(now.value)
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return d
})

const label = computed(() => {
  const ms = nextHour.value.getTime() - now.value.getTime()
  const seconds = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} to :00`
})

const tooltip = computed(
  () => `Time until ${nextHour.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
)

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.nh-chip {
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

.nh-chip__icon {
  color: #94A3B8 !important;
}

@media (max-width: 1200px) {
  .nh-chip {
    display: none;
  }
}
</style>
