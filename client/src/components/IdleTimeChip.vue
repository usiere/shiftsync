<template>
  <div class="idle-chip" :class="stateClass" :title="tooltip">
    <v-icon size="14" class="idle-chip__icon">{{ icon }}</v-icon>
    <span class="idle-chip__label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const lastActivity = ref(Date.now())
const now = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel']

function markActive() {
  lastActivity.value = Date.now()
}

const idleMs = computed(() => now.value - lastActivity.value)

const label = computed(() => {
  const totalSec = Math.floor(idleMs.value / 1000)
  if (totalSec < 60) return 'active'
  const m = Math.floor(totalSec / 60)
  if (m < 60) return `${m}m idle`
  const h = Math.floor(m / 60)
  const rest = m % 60
  return `${h}h ${rest}m idle`
})

const icon = computed(() => {
  if (idleMs.value < 60_000) return 'mdi-account-check'
  if (idleMs.value < 5 * 60_000) return 'mdi-account-clock'
  return 'mdi-account-off'
})

const stateClass = computed(() => {
  if (idleMs.value < 60_000) return 'idle-chip--active'
  if (idleMs.value < 5 * 60_000) return 'idle-chip--warn'
  return 'idle-chip--idle'
})

const tooltip = computed(
  () => `Last input ${new Date(lastActivity.value).toLocaleTimeString()}`,
)

onMounted(() => {
  for (const e of EVENTS) window.addEventListener(e, markActive, { passive: true })
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  for (const e of EVENTS) window.removeEventListener(e, markActive)
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.idle-chip {
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

.idle-chip__icon {
  color: #94A3B8 !important;
}

.idle-chip--active {
  background: #F0FDF4;
  border-color: #86EFAC;
  color: #166534;
}

.idle-chip--active .idle-chip__icon { color: #16A34A !important; }

.idle-chip--warn {
  background: #FEF3C7;
  border-color: #FDE68A;
  color: #92400E;
}

.idle-chip--warn .idle-chip__icon { color: #B45309 !important; }

.idle-chip--idle {
  background: #FEF2F2;
  border-color: #FCA5A5;
  color: #991B1B;
}

.idle-chip--idle .idle-chip__icon { color: #DC2626 !important; }

@media (max-width: 1300px) {
  .idle-chip {
    display: none;
  }
}
</style>
