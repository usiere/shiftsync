<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Chinese zodiac lookup"
        size="large"
      >
        <v-icon size="22">mdi-rabbit</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Chinese zodiac</div>
      <v-text-field
        v-model.number="year"
        type="number"
        label="Year"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />
      <div v-if="animal" class="cz-card">
        <div class="cz-emoji">{{ animal.emoji }}</div>
        <div class="cz-name">{{ animal.name }}</div>
        <div class="text-caption text-medium-emphasis">Element: <strong>{{ element }}</strong></div>
      </div>
      <div v-else class="text-caption text-medium-emphasis text-center">
        Enter a year.
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const ANIMALS = [
  { name: 'Rat', emoji: '🐀' },
  { name: 'Ox', emoji: '🐂' },
  { name: 'Tiger', emoji: '🐅' },
  { name: 'Rabbit', emoji: '🐇' },
  { name: 'Dragon', emoji: '🐉' },
  { name: 'Snake', emoji: '🐍' },
  { name: 'Horse', emoji: '🐎' },
  { name: 'Goat', emoji: '🐐' },
  { name: 'Monkey', emoji: '🐒' },
  { name: 'Rooster', emoji: '🐓' },
  { name: 'Dog', emoji: '🐕' },
  { name: 'Pig', emoji: '🐖' },
]

const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']

const year = ref<number>(new Date().getFullYear())

const animal = computed(() => {
  const y = Number(year.value)
  if (!Number.isInteger(y)) return null
  return ANIMALS[((y - 4) % 12 + 12) % 12]
})

const element = computed(() => {
  const y = Number(year.value)
  if (!Number.isInteger(y)) return ''
  return ELEMENTS[Math.floor((((y - 4) % 10 + 10) % 10) / 2)]
})
</script>

<style scoped>
.cz-card {
  padding: 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.cz-emoji {
  font-size: 40px;
  line-height: 1;
}

.cz-name {
  font-weight: 700;
  font-size: 16px;
  color: #1E293B;
  margin-top: 4px;
}
</style>
