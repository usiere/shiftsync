<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Zodiac sign lookup"
        size="large"
      >
        <v-icon size="22">mdi-zodiac-libra</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Zodiac sign</div>
      <v-text-field
        v-model="birthday"
        type="date"
        label="Birthday"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
      />
      <div v-if="sign" class="zl-card">
        <div class="zl-symbol">{{ sign.symbol }}</div>
        <div class="zl-name">{{ sign.name }}</div>
        <div class="text-caption text-medium-emphasis">{{ sign.range }}</div>
        <div class="text-caption mt-1">Element: <strong>{{ sign.element }}</strong></div>
      </div>
      <div v-else class="text-caption text-medium-emphasis text-center">
        Pick a date to see the sign.
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Sign {
  name: string
  symbol: string
  element: string
  range: string
}

const SIGNS: Array<Sign & { start: [number, number] }> = [
  { name: 'Capricorn', symbol: '♑', element: 'Earth', range: 'Dec 22 – Jan 19', start: [12, 22] },
  { name: 'Aquarius', symbol: '♒', element: 'Air', range: 'Jan 20 – Feb 18', start: [1, 20] },
  { name: 'Pisces', symbol: '♓', element: 'Water', range: 'Feb 19 – Mar 20', start: [2, 19] },
  { name: 'Aries', symbol: '♈', element: 'Fire', range: 'Mar 21 – Apr 19', start: [3, 21] },
  { name: 'Taurus', symbol: '♉', element: 'Earth', range: 'Apr 20 – May 20', start: [4, 20] },
  { name: 'Gemini', symbol: '♊', element: 'Air', range: 'May 21 – Jun 20', start: [5, 21] },
  { name: 'Cancer', symbol: '♋', element: 'Water', range: 'Jun 21 – Jul 22', start: [6, 21] },
  { name: 'Leo', symbol: '♌', element: 'Fire', range: 'Jul 23 – Aug 22', start: [7, 23] },
  { name: 'Virgo', symbol: '♍', element: 'Earth', range: 'Aug 23 – Sep 22', start: [8, 23] },
  { name: 'Libra', symbol: '♎', element: 'Air', range: 'Sep 23 – Oct 22', start: [9, 23] },
  { name: 'Scorpio', symbol: '♏', element: 'Water', range: 'Oct 23 – Nov 21', start: [10, 23] },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', range: 'Nov 22 – Dec 21', start: [11, 22] },
]

const birthday = ref('')

const sign = computed<Sign | null>(() => {
  if (!birthday.value) return null
  const [_, mStr, dStr] = birthday.value.split('-')
  const m = Number(mStr), d = Number(dStr)
  if (!Number.isFinite(m) || !Number.isFinite(d)) return null
  for (let i = SIGNS.length - 1; i >= 0; i--) {
    const s = SIGNS[i]
    if (m > s.start[0] || (m === s.start[0] && d >= s.start[1])) return s
  }
  return SIGNS[0]
})
</script>

<style scoped>
.zl-card {
  padding: 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.zl-symbol {
  font-size: 40px;
  line-height: 1;
  color: #7C3AED;
}

.zl-name {
  font-weight: 700;
  font-size: 16px;
  color: #1E293B;
  margin-top: 4px;
}
</style>
