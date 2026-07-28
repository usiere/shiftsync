<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="What day of the week were you born?"
        size="large"
      >
        <v-icon size="22">mdi-calendar-question</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Weekday of a date</div>
      <v-text-field
        v-model="date"
        type="date"
        label="Date"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />
      <div v-if="weekday" class="bw-card">
        <div class="bw-day">{{ weekday }}</div>
        <div class="text-caption text-medium-emphasis">{{ rhyme }}</div>
      </div>
      <div v-else class="text-caption text-medium-emphasis text-center">
        Pick a date.
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const RHYME = [
  'Sunday’s child is bonny and blithe',
  'Monday’s child is fair of face',
  'Tuesday’s child is full of grace',
  'Wednesday’s child is full of woe',
  'Thursday’s child has far to go',
  'Friday’s child is loving and giving',
  'Saturday’s child works hard for a living',
]

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const date = ref('')

const parsed = computed(() => {
  if (!date.value) return null
  const [y, m, d] = date.value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
})

const weekday = computed(() => (parsed.value ? DAYS[parsed.value.getDay()] : ''))
const rhyme = computed(() => (parsed.value ? RHYME[parsed.value.getDay()] : ''))
</script>

<style scoped>
.bw-card {
  padding: 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.bw-day {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 22px;
  color: #1E40AF;
  margin-bottom: 4px;
}
</style>
