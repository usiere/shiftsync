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
        title="Age calculator"
        size="large"
      >
        <v-icon size="22">mdi-cake-variant-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <v-text-field
        v-model="dob"
        type="date"
        label="Date of birth"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />

      <div v-if="valid" class="age-grid">
        <div class="age-cell">
          <div class="age-value">{{ age.years }}</div>
          <div class="age-label">Years</div>
        </div>
        <div class="age-cell">
          <div class="age-value">{{ age.months }}</div>
          <div class="age-label">Months</div>
        </div>
        <div class="age-cell">
          <div class="age-value">{{ age.days }}</div>
          <div class="age-label">Days</div>
        </div>
      </div>
      <div v-if="valid" class="text-caption text-medium-emphasis mt-2">
        {{ totals }}
      </div>
      <div v-if="valid" class="text-caption text-medium-emphasis mt-1">
        Next birthday: {{ nextBirthday }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const dob = ref('')

const valid = computed(() => {
  if (!dob.value) return false
  const d = new Date(dob.value)
  return !Number.isNaN(d.getTime()) && d.getTime() <= Date.now()
})

const age = computed(() => {
  if (!valid.value) return { years: 0, months: 0, days: 0 }
  const b = new Date(dob.value)
  const now = new Date()
  let years = now.getFullYear() - b.getFullYear()
  let months = now.getMonth() - b.getMonth()
  let days = now.getDate() - b.getDate()
  if (days < 0) {
    months--
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
    days += prevMonth
  }
  if (months < 0) {
    years--
    months += 12
  }
  return { years, months, days }
})

const totals = computed(() => {
  if (!valid.value) return ''
  const ms = Date.now() - new Date(dob.value).getTime()
  const totalDays = Math.floor(ms / 86_400_000)
  const totalHours = Math.floor(ms / 3_600_000)
  return `${totalDays.toLocaleString()} days · ${totalHours.toLocaleString()} hours`
})

const nextBirthday = computed(() => {
  if (!valid.value) return ''
  const b = new Date(dob.value)
  const now = new Date()
  let next = new Date(now.getFullYear(), b.getMonth(), b.getDate())
  if (next.getTime() < now.getTime()) {
    next = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate())
  }
  const days = Math.ceil((next.getTime() - now.getTime()) / 86_400_000)
  return `${next.toLocaleDateString()} (in ${days} days)`
})
</script>

<style scoped>
.age-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.age-cell {
  padding: 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  text-align: center;
}

.age-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.age-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94A3B8;
  margin-top: 2px;
}
</style>
