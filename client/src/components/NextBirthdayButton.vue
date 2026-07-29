<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Days to next birthday"
        size="large"
      >
        <v-icon size="22">mdi-cake</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Next birthday</div>
      <v-text-field
        v-model="birthday"
        type="date"
        label="Birthday"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div v-if="!next" class="text-caption text-medium-emphasis text-center">
        Pick a date.
      </div>
      <template v-else>
        <div class="nb-big">{{ days }} <span class="nb-unit">days</span></div>
        <div class="nb-row">
          <span class="text-caption text-medium-emphasis">Next date</span>
          <span class="nb-value">{{ dateLabel }}</span>
        </div>
        <div class="nb-row">
          <span class="text-caption text-medium-emphasis">Weekday</span>
          <span class="nb-value">{{ weekdayLabel }}</span>
        </div>
        <div class="nb-row">
          <span class="text-caption text-medium-emphasis">Turning</span>
          <span class="nb-value">{{ turning }}</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const birthday = ref('')

const parsed = computed(() => {
  if (!birthday.value) return null
  const [y, m, d] = birthday.value.split('-').map(Number)
  if (!y || !m || !d) return null
  return { y, m, d }
})

const next = computed(() => {
  if (!parsed.value) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const thisYear = new Date(today.getFullYear(), parsed.value.m - 1, parsed.value.d)
  if (thisYear.getTime() < today.getTime()) {
    return new Date(today.getFullYear() + 1, parsed.value.m - 1, parsed.value.d)
  }
  return thisYear
})

const days = computed(() => {
  if (!next.value) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((next.value.getTime() - today.getTime()) / 86_400_000)
})

const dateLabel = computed(() =>
  next.value ? next.value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '',
)

const weekdayLabel = computed(() =>
  next.value ? next.value.toLocaleDateString(undefined, { weekday: 'long' }) : '',
)

const turning = computed(() => {
  if (!parsed.value || !next.value) return ''
  return `${next.value.getFullYear() - parsed.value.y}`
})
</script>

<style scoped>
.nb-big {
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  font-size: 32px;
  color: #1E40AF;
  padding: 8px 0;
}

.nb-unit {
  font-size: 14px;
  color: #64748B;
  font-weight: 400;
}

.nb-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 10px;
  border-radius: 4px;
  background: rgba(148, 163, 184, 0.06);
  margin-bottom: 3px;
  font-size: 12px;
}

.nb-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
}
</style>
