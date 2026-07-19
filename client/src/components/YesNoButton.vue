<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Yes / No decider"
        size="large"
      >
        <v-icon size="22">mdi-help-network-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="240" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Should you?</div>
      <div class="decision" :class="`decision--${answer.class}`">
        <span class="decision__symbol">{{ answer.symbol }}</span>
        <span class="decision__label">{{ answer.label }}</span>
      </div>
      <v-btn color="primary" size="small" class="mt-3" @click="decide">
        <v-icon start size="16">mdi-dice-multiple</v-icon>
        Decide
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface Answer {
  label: string
  symbol: string
  class: string
}

const CHOICES: Answer[] = [
  { label: 'Yes', symbol: '✓', class: 'yes' },
  { label: 'No', symbol: '✗', class: 'no' },
  { label: 'Maybe', symbol: '?', class: 'maybe' },
  { label: 'Later', symbol: '⏱', class: 'maybe' },
  { label: 'Definitely', symbol: '✓✓', class: 'yes' },
  { label: 'Absolutely not', symbol: '✗✗', class: 'no' },
]

const answer = ref<Answer>({ label: '—', symbol: '?', class: 'maybe' })

function decide() {
  const bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes)
  answer.value = CHOICES[bytes[0] % CHOICES.length]
}

onMounted(decide)
</script>

<style scoped>
.decision {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.1);
}

.decision__symbol {
  font-family: 'DM Mono', monospace;
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}

.decision__label {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.decision--yes {
  background: #F0FDF4;
  color: #166534;
}

.decision--no {
  background: #FEF2F2;
  color: #991B1B;
}

.decision--maybe {
  background: #FEF3C7;
  color: #92400E;
}
</style>
