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
        title="Days between dates"
        size="large"
      >
        <v-icon size="22">mdi-calendar-range</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="d-flex gap-8 mb-3">
        <v-text-field
          v-model="from"
          type="date"
          label="From"
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-text-field
          v-model="to"
          type="date"
          label="To"
          density="compact"
          variant="outlined"
          hide-details
        />
      </div>

      <div v-if="valid" class="dd-grid">
        <div class="dd-cell">
          <div class="dd-value">{{ diff.days.toLocaleString() }}</div>
          <div class="dd-label">Days</div>
        </div>
        <div class="dd-cell">
          <div class="dd-value">{{ diff.weeks.toLocaleString() }}</div>
          <div class="dd-label">Weeks</div>
        </div>
        <div class="dd-cell">
          <div class="dd-value">{{ diff.business.toLocaleString() }}</div>
          <div class="dd-label">Weekdays</div>
        </div>
      </div>
      <div v-if="valid" class="text-caption text-medium-emphasis mt-2">
        {{ direction }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const from = ref(new Date().toISOString().slice(0, 10))
const to = ref(new Date().toISOString().slice(0, 10))

const parsedFrom = computed(() => new Date(from.value))
const parsedTo = computed(() => new Date(to.value))

const valid = computed(
  () =>
    !Number.isNaN(parsedFrom.value.getTime()) &&
    !Number.isNaN(parsedTo.value.getTime()),
)

function countBusiness(a: Date, b: Date): number {
  const start = a < b ? a : b
  const end = a < b ? b : a
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDay()
    if (day !== 0 && day !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

const diff = computed(() => {
  if (!valid.value) return { days: 0, weeks: 0, business: 0 }
  const a = parsedFrom.value
  const b = parsedTo.value
  const days = Math.round(Math.abs(b.getTime() - a.getTime()) / 86_400_000)
  return {
    days,
    weeks: Math.round((days / 7) * 100) / 100,
    business: countBusiness(a, b),
  }
})

const direction = computed(() => {
  if (!valid.value) return ''
  const forward = parsedTo.value.getTime() >= parsedFrom.value.getTime()
  return forward ? 'To is on or after From' : 'To is before From (dates reversed)'
})
</script>

<style scoped>
.dd-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.dd-cell {
  padding: 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  text-align: center;
}

.dd-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  font-weight: 700;
}

.dd-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94A3B8;
  margin-top: 2px;
}

.gap-8 {
  gap: 8px;
}
</style>
