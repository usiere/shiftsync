<template>
  <div class="topbar-clock" :title="fullLabel">
    <v-icon size="16" class="topbar-clock__icon">mdi-clock-outline</v-icon>
    <span class="topbar-clock__time">{{ timeLabel }}</span>
    <span class="topbar-clock__tz">{{ tzAbbrev }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { clockShowSeconds } from '../utils/clockFormat'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const timeFormatterHM = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const timeFormatterHMS = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const fullFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'long',
})

const timeLabel = computed(() =>
  clockShowSeconds.value
    ? timeFormatterHMS.format(now.value)
    : timeFormatterHM.format(now.value),
)
const fullLabel = computed(() => fullFormatter.format(now.value))

const tzAbbrev = computed(() => {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'short',
    hour: '2-digit',
  }).formatToParts(now.value)
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
})

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
.topbar-clock {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.topbar-clock__icon {
  color: #94A3B8 !important;
}

.topbar-clock__tz {
  color: #94A3B8;
  font-size: 10px;
  letter-spacing: 0.03em;
}

@media (max-width: 900px) {
  .topbar-clock {
    display: none;
  }
}
</style>
