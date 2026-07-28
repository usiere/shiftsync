<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Age on other planets"
        size="large"
      >
        <v-icon size="22">mdi-earth</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Age on other planets</div>
      <v-text-field
        v-model="birthday"
        type="date"
        label="Birthday"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div v-if="!earthYears" class="text-caption text-medium-emphasis text-center">
        Pick a date.
      </div>
      <template v-else>
        <div v-for="p in ages" :key="p.name" class="pa-row">
          <span class="pa-planet">{{ p.emoji }} {{ p.name }}</span>
          <span class="pa-value">{{ p.years }} yrs</span>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const PLANETS = [
  { name: 'Mercury', period: 0.2408467, emoji: '☿' },
  { name: 'Venus',   period: 0.61519726, emoji: '♀' },
  { name: 'Earth',   period: 1.0, emoji: '🌍' },
  { name: 'Mars',    period: 1.8808158, emoji: '♂' },
  { name: 'Jupiter', period: 11.862615, emoji: '♃' },
  { name: 'Saturn',  period: 29.447498, emoji: '♄' },
  { name: 'Uranus',  period: 84.016846, emoji: '♅' },
  { name: 'Neptune', period: 164.79132, emoji: '♆' },
]

const birthday = ref('')

const earthYears = computed(() => {
  if (!birthday.value) return 0
  const d = new Date(birthday.value)
  if (Number.isNaN(d.getTime())) return 0
  const ms = Date.now() - d.getTime()
  if (ms <= 0) return 0
  return ms / (365.25 * 86_400_000)
})

const ages = computed(() =>
  PLANETS.map((p) => ({
    ...p,
    years: (earthYears.value / p.period).toFixed(2),
  })),
)
</script>

<style scoped>
.pa-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px;
  border-radius: 4px;
  margin-bottom: 3px;
  background: rgba(148, 163, 184, 0.06);
}

.pa-planet {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #1E293B;
}

.pa-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
  font-size: 12px;
}
</style>
