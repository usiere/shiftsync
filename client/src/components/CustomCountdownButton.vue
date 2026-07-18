<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="target ? `${label} left until ${targetLabel}` : 'Countdown to a date'"
        size="large"
      >
        <v-icon size="22" :color="target ? 'primary' : undefined">
          {{ target ? 'mdi-calendar-clock' : 'mdi-calendar-clock-outline' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <v-text-field
        v-model="dateStr"
        type="date"
        label="Target date"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-text-field
        v-model="titleStr"
        label="Title (optional)"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />

      <div v-if="target" class="countdown-display">
        <div class="cd-grid">
          <div class="cd-cell">
            <div class="cd-value">{{ parts.days }}</div>
            <div class="cd-label">Days</div>
          </div>
          <div class="cd-cell">
            <div class="cd-value">{{ parts.hours }}</div>
            <div class="cd-label">Hours</div>
          </div>
          <div class="cd-cell">
            <div class="cd-value">{{ parts.minutes }}</div>
            <div class="cd-label">Min</div>
          </div>
        </div>
        <div class="text-caption text-medium-emphasis mt-2 text-center">
          Until {{ targetLabel }}<span v-if="titleStr"> — {{ titleStr }}</span>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const STORAGE_KEY = 'shiftsync.customCountdown'

interface Stored {
  date: string
  title: string
}

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (typeof parsed === 'object' && parsed !== null) return parsed as Stored
    return null
  } catch {
    return null
  }
}

const initial = read()
const dateStr = ref(initial?.date ?? '')
const titleStr = ref(initial?.title ?? '')
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const target = computed(() => {
  if (!dateStr.value) return null
  const d = new Date(dateStr.value)
  return Number.isNaN(d.getTime()) ? null : d
})

const remainingMs = computed(() => {
  if (!target.value) return 0
  return Math.max(0, target.value.getTime() - now.value.getTime())
})

const parts = computed(() => {
  const totalSec = Math.floor(remainingMs.value / 1000)
  const days = Math.floor(totalSec / 86_400)
  const hours = Math.floor((totalSec % 86_400) / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  return { days, hours, minutes }
})

const label = computed(() => `${parts.value.days}d ${parts.value.hours}h`)

const targetLabel = computed(() =>
  target.value ? target.value.toLocaleDateString() : '',
)

watch([dateStr, titleStr], ([d, t]) => {
  try {
    if (d) localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: d, title: t }))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
})

onMounted(() => {
  timer = setInterval(() => { now.value = new Date() }, 60_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.cd-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.cd-cell {
  padding: 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  text-align: center;
}

.cd-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 24px;
  font-weight: 700;
}

.cd-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94A3B8;
  margin-top: 2px;
}
</style>
