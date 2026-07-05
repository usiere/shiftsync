<template>
  <div class="utc-clock" :title="fullLabel">
    <v-icon size="14" class="utc-clock__icon">mdi-earth</v-icon>
    <span class="utc-clock__time">{{ timeLabel }}</span>
    <span class="utc-clock__tag">UTC</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

const fullFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
})

const timeLabel = computed(() => timeFormatter.format(now.value))
const fullLabel = computed(() => `UTC — ${fullFormatter.format(now.value)}`)

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
.utc-clock {
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

.utc-clock__icon {
  color: #94A3B8 !important;
}

.utc-clock__tag {
  color: #94A3B8;
  font-size: 10px;
  letter-spacing: 0.05em;
}

@media (max-width: 1100px) {
  .utc-clock {
    display: none;
  }
}
</style>
