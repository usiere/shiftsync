<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="I Ching hexagram"
        size="large"
      >
        <v-icon size="22">mdi-yin-yang</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">I Ching</div>
      <div class="ic-card">
        <div class="ic-glyph">{{ pick.glyph }}</div>
        <div class="ic-name">{{ pick.num }}. {{ pick.name }}</div>
        <div class="ic-mean">{{ pick.meaning }}</div>
      </div>
      <v-btn block variant="tonal" size="small" class="mt-2" @click="draw">Cast again</v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Hex { num: number; glyph: string; name: string; meaning: string }

const HEXAGRAMS: Hex[] = [
  { num: 1,  glyph: '䷀', name: 'The Creative',          meaning: 'Pure yang; initiate with strength.' },
  { num: 2,  glyph: '䷁', name: 'The Receptive',         meaning: 'Pure yin; yield and support.' },
  { num: 3,  glyph: '䷂', name: 'Difficulty at Beginning', meaning: 'Chaotic start; persevere.' },
  { num: 4,  glyph: '䷃', name: 'Youthful Folly',        meaning: 'Learn from a teacher.' },
  { num: 5,  glyph: '䷄', name: 'Waiting',               meaning: 'Nourish patience.' },
  { num: 6,  glyph: '䷅', name: 'Conflict',              meaning: 'Retreat, seek mediation.' },
  { num: 7,  glyph: '䷆', name: 'The Army',              meaning: 'Discipline and leadership.' },
  { num: 8,  glyph: '䷇', name: 'Holding Together',       meaning: 'Union with the right people.' },
  { num: 11, glyph: '䷊', name: 'Peace',                 meaning: 'Harmony between forces.' },
  { num: 12, glyph: '䷋', name: 'Standstill',            meaning: 'Withdraw with dignity.' },
  { num: 14, glyph: '䷍', name: 'Great Possession',      meaning: 'Modesty amid abundance.' },
  { num: 15, glyph: '䷎', name: 'Modesty',               meaning: 'Success through humility.' },
  { num: 22, glyph: '䷕', name: 'Grace',                 meaning: 'Form matters, but not more than substance.' },
  { num: 24, glyph: '䷗', name: 'Return',                meaning: 'A new cycle begins.' },
  { num: 27, glyph: '䷚', name: 'Nourishment',           meaning: 'Mind what you take in.' },
  { num: 30, glyph: '䷝', name: 'The Clinging',          meaning: 'Depend on what is right.' },
  { num: 32, glyph: '䷟', name: 'Duration',              meaning: 'Steadfastness endures.' },
  { num: 39, glyph: '䷦', name: 'Obstruction',           meaning: 'Turn inward and reflect.' },
  { num: 41, glyph: '䷨', name: 'Decrease',              meaning: 'Simplify and offer.' },
  { num: 42, glyph: '䷩', name: 'Increase',              meaning: 'Move; benefit others.' },
  { num: 51, glyph: '䷲', name: 'The Arousing',          meaning: 'Sudden shock, act with clarity.' },
  { num: 52, glyph: '䷳', name: 'Keeping Still',         meaning: 'Rest, quiet the mind.' },
  { num: 55, glyph: '䷶', name: 'Abundance',             meaning: 'Peak; enjoy but prepare for change.' },
  { num: 63, glyph: '䷾', name: 'After Completion',      meaning: 'Success — stay vigilant.' },
  { num: 64, glyph: '䷿', name: 'Before Completion',     meaning: 'Almost there; keep focus.' },
]

const pick = ref<Hex>(HEXAGRAMS[0])

function draw() {
  pick.value = HEXAGRAMS[Math.floor(Math.random() * HEXAGRAMS.length)]
}

draw()
</script>

<style scoped>
.ic-card {
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #0F172A, #1E293B);
  color: #F1F5F9;
  text-align: center;
}

.ic-glyph {
  font-size: 60px;
  line-height: 1;
  color: #FEF3C7;
}

.ic-name {
  margin-top: 6px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 14px;
}

.ic-mean {
  margin-top: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  opacity: 0.9;
}
</style>
