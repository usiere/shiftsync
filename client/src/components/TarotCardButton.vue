<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Random tarot card"
        size="large"
      >
        <v-icon size="22">mdi-cards-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Tarot Draw</div>
      <div class="tc-card">
        <div class="tc-name">{{ card.name }}</div>
        <div class="tc-orient" :class="reversed ? 'tc-orient--rev' : 'tc-orient--up'">
          {{ reversed ? 'Reversed' : 'Upright' }}
        </div>
        <div class="tc-mean">{{ reversed ? card.reversed : card.upright }}</div>
      </div>
      <v-btn block variant="tonal" size="small" class="mt-2" @click="draw">Draw again</v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Card {
  name: string
  upright: string
  reversed: string
}

const DECK: Card[] = [
  { name: 'The Fool',            upright: 'Beginnings, spontaneity', reversed: 'Recklessness, held back' },
  { name: 'The Magician',        upright: 'Skill, willpower',        reversed: 'Manipulation, illusion' },
  { name: 'The High Priestess',  upright: 'Intuition, mystery',      reversed: 'Secrets, disconnection' },
  { name: 'The Empress',         upright: 'Abundance, nurture',      reversed: 'Dependence, stagnation' },
  { name: 'The Emperor',         upright: 'Authority, structure',    reversed: 'Rigidity, control' },
  { name: 'The Hierophant',      upright: 'Tradition, guidance',     reversed: 'Rebellion, dogma' },
  { name: 'The Lovers',          upright: 'Union, choice',           reversed: 'Disharmony, imbalance' },
  { name: 'The Chariot',         upright: 'Determination, drive',    reversed: 'Lack of control' },
  { name: 'Strength',            upright: 'Courage, patience',       reversed: 'Self-doubt, weakness' },
  { name: 'The Hermit',          upright: 'Reflection, solitude',    reversed: 'Isolation, withdrawal' },
  { name: 'Wheel of Fortune',    upright: 'Cycles, luck',            reversed: 'Setbacks, resistance' },
  { name: 'Justice',             upright: 'Fairness, truth',         reversed: 'Bias, unfairness' },
  { name: 'The Hanged Man',      upright: 'Surrender, new view',     reversed: 'Stalling, stuck' },
  { name: 'Death',               upright: 'Endings, transformation', reversed: 'Resistance to change' },
  { name: 'Temperance',          upright: 'Balance, moderation',     reversed: 'Excess, imbalance' },
  { name: 'The Devil',           upright: 'Attachment, shadow',      reversed: 'Breaking free' },
  { name: 'The Tower',           upright: 'Sudden upheaval',         reversed: 'Averted disaster' },
  { name: 'The Star',            upright: 'Hope, renewal',           reversed: 'Discouragement' },
  { name: 'The Moon',            upright: 'Illusion, dreams',        reversed: 'Clarity, release fear' },
  { name: 'The Sun',             upright: 'Joy, vitality',           reversed: 'Temporary gloom' },
  { name: 'Judgement',           upright: 'Reckoning, awakening',    reversed: 'Self-doubt' },
  { name: 'The World',           upright: 'Completion, fulfillment', reversed: 'Loose ends' },
]

const card = ref<Card>(DECK[0])
const reversed = ref<boolean>(false)

function draw() {
  card.value = DECK[Math.floor(Math.random() * DECK.length)]
  reversed.value = Math.random() < 0.5
}

draw()
</script>

<style scoped>
.tc-card {
  padding: 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4C1D95, #7C3AED);
  color: #F5F3FF;
  text-align: center;
}

.tc-name {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.02em;
}

.tc-orient {
  margin-top: 4px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.85;
}

.tc-orient--rev {
  color: #FDA4AF;
}

.tc-mean {
  margin-top: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  opacity: 0.95;
}
</style>
