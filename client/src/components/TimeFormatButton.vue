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
        title="12h ↔ 24h converter"
        size="large"
      >
        <v-icon size="22">mdi-clock-time-nine-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model="input24"
          label="24-hour (HH:MM)"
          density="compact"
          variant="outlined"
          hide-details
          placeholder="13:45"
          @update:model-value="from24"
        />
        <v-text-field
          v-model="input12"
          label="12-hour"
          density="compact"
          variant="outlined"
          hide-details
          placeholder="1:45 PM"
          @update:model-value="from12"
        />
      </div>
      <div v-if="error" class="text-error text-caption">{{ error }}</div>
      <div v-else-if="minutes" class="text-caption text-medium-emphasis">
        {{ minutes }} min past midnight
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const input24 = ref('')
const input12 = ref('')
const error = ref('')
const minutes = ref<number | null>(null)

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function apply(hour24: number, min: number) {
  input24.value = `${pad(hour24)}:${pad(min)}`
  const suffix = hour24 >= 12 ? 'PM' : 'AM'
  const hour12Raw = hour24 % 12
  const hour12 = hour12Raw === 0 ? 12 : hour12Raw
  input12.value = `${hour12}:${pad(min)} ${suffix}`
  minutes.value = hour24 * 60 + min
}

function from24(raw: string) {
  error.value = ''
  input24.value = raw
  if (!raw) { input12.value = ''; minutes.value = null; return }
  const m = raw.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) { error.value = 'Use HH:MM (24h)'; input12.value = ''; return }
  const hh = Number(m[1])
  const mm = Number(m[2])
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) { error.value = 'Out of range'; input12.value = ''; return }
  apply(hh, mm)
}

function from12(raw: string) {
  error.value = ''
  input12.value = raw
  if (!raw) { input24.value = ''; minutes.value = null; return }
  const m = raw.trim().toUpperCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)
  if (!m) { error.value = 'Use H:MM AM/PM'; input24.value = ''; return }
  let hh = Number(m[1])
  const mm = m[2] ? Number(m[2]) : 0
  const suffix = m[3]
  if (hh < 1 || hh > 12 || mm < 0 || mm > 59) { error.value = 'Out of range'; input24.value = ''; return }
  if (suffix === 'AM') hh = hh === 12 ? 0 : hh
  else hh = hh === 12 ? 12 : hh + 12
  apply(hh, mm)
}
</script>

<style scoped>
.gap-8 {
  gap: 8px;
}
</style>
