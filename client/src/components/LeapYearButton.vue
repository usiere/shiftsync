<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Leap year checker"
        size="large"
      >
        <v-icon size="22">mdi-calendar-refresh</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Leap year</div>
      <v-text-field
        v-model.number="year"
        type="number"
        label="Year"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div class="ly-result" :class="isLeap ? 'ly-yes' : 'ly-no'">
        <v-icon size="16" class="me-1">{{ isLeap ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
        {{ isLeap ? `${year} is a leap year` : `${year} is not a leap year` }}
      </div>
      <div class="text-caption text-medium-emphasis text-center mt-2">
        Next leap: <strong>{{ nextLeap }}</strong> · Previous: <strong>{{ prevLeap }}</strong>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const year = ref<number>(new Date().getFullYear())

function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

const isLeap = computed(() => Number.isInteger(Number(year.value)) && isLeapYear(Number(year.value)))

const nextLeap = computed(() => {
  const y = Math.floor(Number(year.value)) || 0
  for (let i = y + 1; i < y + 10; i++) if (isLeapYear(i)) return i
  return '—'
})

const prevLeap = computed(() => {
  const y = Math.floor(Number(year.value)) || 0
  for (let i = y - 1; i > y - 10; i--) if (isLeapYear(i)) return i
  return '—'
})
</script>

<style scoped>
.ly-result {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.ly-yes {
  background: #DCFCE7;
  color: #166534;
}

.ly-no {
  background: #FEE2E2;
  color: #991B1B;
}
</style>
