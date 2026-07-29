<template>
  <v-menu offset-y :close-on-content-click="false" @update:model-value="onOpen">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Random compliment"
        size="large"
      >
        <v-icon size="22">mdi-hand-heart</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">A little pick-me-up</div>
      <div class="rc-out">
        <v-icon size="26" color="pink">mdi-heart</v-icon>
        <div class="rc-text mt-2">{{ compliment }}</div>
      </div>
      <v-btn color="primary" size="small" class="mt-3" @click="next">
        <v-icon start size="16">mdi-refresh</v-icon>
        Another
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const COMPLIMENTS = [
  'You have a great sense of humor.',
  'Your kindness is contagious.',
  'You bring out the best in people.',
  'You’re braver than you think.',
  'Your effort is not going unnoticed.',
  'You have a beautiful smile.',
  'You’re a great listener.',
  'You inspire people to try harder.',
  'You’re doing better than you realize.',
  'Your work ethic is admirable.',
  'You radiate positive energy.',
  'You’re smarter than you give yourself credit for.',
  'You’re creative in ways I didn’t know were possible.',
  'The way you think is refreshing.',
  'You handle stress with grace.',
  'You make ordinary moments feel special.',
  'You’re a genuine, thoughtful person.',
  'You have great taste.',
  'You’re resilient.',
  'Your presence is calming.',
]

const compliment = ref('')

function next() {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  let pick = COMPLIMENTS[buf[0] % COMPLIMENTS.length]
  if (pick === compliment.value && COMPLIMENTS.length > 1) {
    pick = COMPLIMENTS[(buf[0] + 1) % COMPLIMENTS.length]
  }
  compliment.value = pick
}

function onOpen(open: boolean) {
  if (open && !compliment.value) next()
}
</script>

<style scoped>
.rc-out {
  padding: 16px 12px;
  border-radius: 6px;
  background: #FDF2F8;
  border: 1px solid #FBCFE8;
}

.rc-text {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  color: #9F1239;
  font-size: 14px;
  line-height: 1.4;
}
</style>
