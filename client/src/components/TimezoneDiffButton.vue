<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Timezone difference"
        size="large"
      >
        <v-icon size="22">mdi-clock-time-two-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <v-select
        v-model="tzA"
        :items="zones"
        label="Zone A"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-select
        v-model="tzB"
        :items="zones"
        label="Zone B"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />

      <div class="tz-row">
        <span class="tz-label">A now</span>
        <code class="tz-value">{{ timeIn(tzA) }}</code>
      </div>
      <div class="tz-row">
        <span class="tz-label">B now</span>
        <code class="tz-value">{{ timeIn(tzB) }}</code>
      </div>
      <div class="tz-row">
        <span class="tz-label">Delta</span>
        <code class="tz-value">B − A = {{ deltaLabel }}</code>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const open = ref(false)
const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone
const tzA = ref(localTz)
const tzB = ref('UTC')
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const zones = [
  localTz,
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
]

function timeIn(zone: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: zone,
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(now.value)
  } catch {
    return '—'
  }
}

function offsetMinutes(zone: string): number {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    const parts = dtf.formatToParts(now.value)
    const map: Record<string, string> = {}
    for (const p of parts) if (p.type !== 'literal') map[p.type] = p.value
    const asUtc = Date.UTC(
      Number(map.year),
      Number(map.month) - 1,
      Number(map.day),
      Number(map.hour),
      Number(map.minute),
      Number(map.second),
    )
    return Math.round((asUtc - now.value.getTime()) / 60_000)
  } catch {
    return 0
  }
}

const delta = computed(() => offsetMinutes(tzB.value) - offsetMinutes(tzA.value))

const deltaLabel = computed(() => {
  const m = delta.value
  const sign = m >= 0 ? '+' : '-'
  const abs = Math.abs(m)
  const h = Math.floor(abs / 60)
  const mm = abs % 60
  return `${sign}${h}h ${mm}m`
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
.tz-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.tz-label {
  width: 60px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tz-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
}
</style>
