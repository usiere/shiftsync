<template>
  <div class="parity-chip" :class="parityClass" :title="tooltip">
    <v-icon size="14" class="parity-chip__icon">
      {{ isOdd ? 'mdi-numeric-1-box-outline' : 'mdi-numeric-2-box-outline' }}
    </v-icon>
    <span class="parity-chip__label">{{ isOdd ? 'Odd' : 'Even' }} week</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

const week = computed(() => isoWeek(now.value))
const isOdd = computed(() => week.value % 2 === 1)

const parityClass = computed(() =>
  isOdd.value ? 'parity-chip--odd' : 'parity-chip--even',
)

const tooltip = computed(
  () => `ISO week ${week.value} — ${isOdd.value ? 'odd' : 'even'} (useful for rotating schedules)`,
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
.parity-chip {
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

.parity-chip__icon {
  color: #94A3B8 !important;
}

.parity-chip--odd {
  background: #EFF6FF;
  border-color: #BFDBFE;
  color: #1E40AF;
}

.parity-chip--odd .parity-chip__icon {
  color: #2563EB !important;
}

.parity-chip--even {
  background: #F5F3FF;
  border-color: #DDD6FE;
  color: #5B21B6;
}

.parity-chip--even .parity-chip__icon {
  color: #7C3AED !important;
}

@media (max-width: 1200px) {
  .parity-chip {
    display: none;
  }
}
</style>
