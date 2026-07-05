<template>
  <div class="weekend-chip" :class="{ 'weekend-chip--weekend': isWeekend }" :title="tooltip">
    <v-icon size="14" class="weekend-chip__icon">
      {{ isWeekend ? 'mdi-beach' : 'mdi-briefcase-outline' }}
    </v-icon>
    <span class="weekend-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'long' })

const isWeekend = computed(() => {
  const day = now.value.getDay()
  return day === 0 || day === 6
})

const label = computed(() => (isWeekend.value ? 'Weekend' : 'Weekday'))

const tooltip = computed(() => `${weekdayFormatter.format(now.value)} — ${label.value}`)

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
.weekend-chip {
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

.weekend-chip__icon {
  color: #94A3B8 !important;
}

.weekend-chip--weekend {
  background: #FEF3C7;
  border-color: #FDE68A;
  color: #92400E;
}

.weekend-chip--weekend .weekend-chip__icon {
  color: #B45309 !important;
}

@media (max-width: 1100px) {
  .weekend-chip {
    display: none;
  }
}
</style>
