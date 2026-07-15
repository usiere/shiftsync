<template>
  <div class="ny-chip" :title="tooltip">
    <v-icon size="14" class="ny-chip__icon">mdi-firework</v-icon>
    <span class="ny-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const nextYear = computed(() => new Date(now.value.getFullYear() + 1, 0, 1))

const remaining = computed(() => {
  const ms = nextYear.value.getTime() - now.value.getTime()
  return Math.max(0, ms)
})

const label = computed(() => {
  const totalMin = Math.floor(remaining.value / 60_000)
  const days = Math.floor(totalMin / (24 * 60))
  const hours = Math.floor((totalMin % (24 * 60)) / 60)
  if (days > 0) return `NY: ${days}d ${hours}h`
  const mins = totalMin % 60
  if (hours > 0) return `NY: ${hours}h ${mins}m`
  return `NY: ${mins}m`
})

const tooltip = computed(
  () => `Countdown to Jan 1 ${nextYear.value.getFullYear()}`,
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
.ny-chip {
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

.ny-chip__icon {
  color: #A855F7 !important;
}

@media (max-width: 1200px) {
  .ny-chip {
    display: none;
  }
}
</style>
