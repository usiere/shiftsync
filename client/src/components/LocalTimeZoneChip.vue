<template>
  <div class="tz-chip" :title="fullLabel">
    <v-icon size="14" class="tz-chip__icon">mdi-earth</v-icon>
    <span class="tz-chip__abbrev">{{ abbrev }}</span>
    <span class="tz-chip__offset">{{ offsetLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const abbrev = computed(() => {
  const parts = new Intl.DateTimeFormat(undefined, {
    timeZoneName: 'short',
    hour: '2-digit',
  }).formatToParts(now.value)
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? ''
})

const zoneName = computed(() => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
})

const offsetLabel = computed(() => {
  const minutes = -now.value.getTimezoneOffset()
  const sign = minutes >= 0 ? '+' : '-'
  const abs = Math.abs(minutes)
  const h = String(Math.floor(abs / 60)).padStart(2, '0')
  const m = String(abs % 60).padStart(2, '0')
  return `UTC${sign}${h}:${m}`
})

const fullLabel = computed(() => `${zoneName.value} (${offsetLabel.value})`)

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
.tz-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.tz-chip__icon {
  color: #94A3B8 !important;
}

.tz-chip__abbrev {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.tz-chip__offset {
  color: #94A3B8;
  font-size: 10px;
  letter-spacing: 0.03em;
  font-family: 'DM Mono', monospace;
}

@media (max-width: 1100px) {
  .tz-chip {
    display: none;
  }
}
</style>
