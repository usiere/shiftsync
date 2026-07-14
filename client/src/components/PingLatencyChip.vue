<template>
  <div class="ping-chip" :class="stateClass" :title="tooltip">
    <v-icon size="14" class="ping-chip__icon">
      {{ pending ? 'mdi-lan-pending' : icon }}
    </v-icon>
    <span class="ping-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const latencyMs = ref<number | null>(null)
const pending = ref(false)
const failed = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

async function measure() {
  pending.value = true
  failed.value = false
  const start = performance.now()
  try {
    const url = `${window.location.origin}/favicon.ico?_=${Date.now()}`
    await fetch(url, { method: 'HEAD', cache: 'no-store' })
    latencyMs.value = Math.round(performance.now() - start)
  } catch {
    latencyMs.value = null
    failed.value = true
  } finally {
    pending.value = false
  }
}

const label = computed(() => {
  if (failed.value) return 'offline'
  if (latencyMs.value === null) return '—'
  return `${latencyMs.value} ms`
})

const icon = computed(() => {
  if (failed.value) return 'mdi-lan-disconnect'
  return 'mdi-lan-connect'
})

const stateClass = computed(() => {
  if (failed.value) return 'ping-chip--fail'
  if (latencyMs.value === null) return ''
  if (latencyMs.value > 500) return 'ping-chip--slow'
  if (latencyMs.value > 150) return 'ping-chip--med'
  return 'ping-chip--fast'
})

const tooltip = computed(() => {
  if (failed.value) return 'Network unreachable'
  if (latencyMs.value === null) return 'Measuring…'
  return `Round-trip: ${latencyMs.value} ms (updates every 30s)`
})

onMounted(() => {
  void measure()
  timer = setInterval(measure, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.ping-chip {
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

.ping-chip__icon {
  color: #94A3B8 !important;
}

.ping-chip--fast {
  border-color: #86EFAC;
  background: #F0FDF4;
  color: #166534;
}

.ping-chip--fast .ping-chip__icon {
  color: #16A34A !important;
}

.ping-chip--med {
  border-color: #FDE68A;
  background: #FEF3C7;
  color: #92400E;
}

.ping-chip--med .ping-chip__icon {
  color: #B45309 !important;
}

.ping-chip--slow,
.ping-chip--fail {
  border-color: #FCA5A5;
  background: #FEF2F2;
  color: #991B1B;
}

.ping-chip--slow .ping-chip__icon,
.ping-chip--fail .ping-chip__icon {
  color: #DC2626 !important;
}

@media (max-width: 1200px) {
  .ping-chip {
    display: none;
  }
}
</style>
