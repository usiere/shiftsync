<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Anniversary gift"
        size="large"
      >
        <v-icon size="22">mdi-heart-multiple-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Anniversary Gift</div>
      <v-text-field
        v-model.number="year"
        type="number"
        label="Year (1-75)"
        density="compact"
        variant="outlined"
        hide-details
        min="1"
        max="75"
      />
      <div v-if="error" class="text-caption text-error text-center mt-2">{{ error }}</div>
      <template v-else>
        <div class="an-row">
          <div class="an-col">
            <div class="an-label">Traditional</div>
            <div class="an-val">{{ entry.traditional }}</div>
          </div>
          <div class="an-col">
            <div class="an-label">Modern</div>
            <div class="an-val">{{ entry.modern }}</div>
          </div>
        </div>
      </template>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const year = ref<number>(1)

interface Gift { year: number; traditional: string; modern: string }

const GIFTS: Gift[] = [
  { year: 1,  traditional: 'Paper',            modern: 'Clocks' },
  { year: 2,  traditional: 'Cotton',           modern: 'China' },
  { year: 3,  traditional: 'Leather',          modern: 'Crystal / glass' },
  { year: 4,  traditional: 'Fruit / flowers',  modern: 'Appliances' },
  { year: 5,  traditional: 'Wood',             modern: 'Silverware' },
  { year: 6,  traditional: 'Candy / iron',     modern: 'Wood' },
  { year: 7,  traditional: 'Wool / copper',    modern: 'Desk sets' },
  { year: 8,  traditional: 'Pottery / bronze', modern: 'Linens / lace' },
  { year: 9,  traditional: 'Pottery / willow', modern: 'Leather' },
  { year: 10, traditional: 'Tin / aluminum',   modern: 'Diamond' },
  { year: 11, traditional: 'Steel',            modern: 'Fashion jewelry' },
  { year: 12, traditional: 'Silk / linen',     modern: 'Pearls' },
  { year: 13, traditional: 'Lace',             modern: 'Textiles / furs' },
  { year: 14, traditional: 'Ivory',            modern: 'Gold jewelry' },
  { year: 15, traditional: 'Crystal',          modern: 'Watches' },
  { year: 20, traditional: 'China',            modern: 'Platinum' },
  { year: 25, traditional: 'Silver',           modern: 'Silver' },
  { year: 30, traditional: 'Pearl',            modern: 'Diamond' },
  { year: 35, traditional: 'Coral',            modern: 'Jade' },
  { year: 40, traditional: 'Ruby',             modern: 'Ruby' },
  { year: 45, traditional: 'Sapphire',         modern: 'Sapphire' },
  { year: 50, traditional: 'Gold',             modern: 'Gold' },
  { year: 55, traditional: 'Emerald',          modern: 'Emerald' },
  { year: 60, traditional: 'Diamond',          modern: 'Diamond' },
  { year: 65, traditional: 'Blue sapphire',    modern: 'Blue sapphire' },
  { year: 70, traditional: 'Platinum',         modern: 'Platinum' },
  { year: 75, traditional: 'Diamond / gold',   modern: 'Diamond / gold' },
]

const error = computed(() => {
  const y = Number(year.value)
  if (!Number.isInteger(y) || y < 1 || y > 75) return 'Year must be 1-75'
  return ''
})

const entry = computed(() => {
  const y = Number(year.value)
  let match = GIFTS.find(g => g.year === y)
  if (match) return match
  const lower = [...GIFTS].reverse().find(g => g.year < y)
  return lower || GIFTS[0]
})
</script>

<style scoped>
.an-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.an-col {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
  text-align: center;
}

.an-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  margin-bottom: 4px;
}

.an-val {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  color: #0F172A;
  font-size: 13px;
}
</style>
