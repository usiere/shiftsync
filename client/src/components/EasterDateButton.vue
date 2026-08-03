<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Easter Sunday date"
        size="large"
      >
        <v-icon size="22">mdi-egg-easter</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Easter Sunday</div>
      <v-text-field
        v-model.number="year"
        type="number"
        label="Year"
        density="compact"
        variant="outlined"
        hide-details
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="ea-badge">{{ formatted }}</div>
        <div class="ea-note">Month {{ result.month }} · Day {{ result.day }}</div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const year = ref<number>(2026)

const error = computed(() => {
  const y = Number(year.value)
  if (!Number.isInteger(y) || y < 1583 || y > 4099) return 'Year must be 1583-4099 (Gregorian)'
  return ''
})

const result = computed(() => {
  const y = Number(year.value)
  const a = y % 19
  const b = Math.floor(y / 100)
  const c = y % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return { month, day }
})

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const formatted = computed(() => {
  const { month, day } = result.value
  return `${MONTHS[month]} ${day}, ${year.value}`
})
</script>

<style scoped>
.ea-badge {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  background: #FCE7F3;
  color: #831843;
}

.ea-note {
  margin-top: 8px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
}
</style>
