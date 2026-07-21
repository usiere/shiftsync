<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Rock / paper / scissors"
        size="large"
      >
        <v-icon size="22">mdi-hand-front-right-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Rock · Paper · Scissors</div>
      <div class="rps-round mb-2">
        <div class="rps-side">
          <div class="rps-label">You</div>
          <div class="rps-symbol">{{ ICONS[playerChoice] ?? '?' }}</div>
        </div>
        <div class="rps-vs">VS</div>
        <div class="rps-side">
          <div class="rps-label">CPU</div>
          <div class="rps-symbol">{{ ICONS[cpuChoice] ?? '?' }}</div>
        </div>
      </div>
      <div class="rps-verdict mb-2" :class="`rps-verdict--${verdictClass}`">
        {{ verdictLabel }}
      </div>
      <div class="d-flex justify-center gap-8 mb-2">
        <v-btn v-for="c in choices" :key="c" size="small" variant="tonal" @click="play(c)">
          {{ ICONS[c] }} {{ c }}
        </v-btn>
      </div>
      <div class="text-caption text-medium-emphasis">
        You {{ wins }} · CPU {{ losses }} · Ties {{ ties }}
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Choice = 'rock' | 'paper' | 'scissors'

const ICONS: Record<Choice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
}

const choices: Choice[] = ['rock', 'paper', 'scissors']

const playerChoice = ref<Choice | ''>('')
const cpuChoice = ref<Choice | ''>('')
const wins = ref(0)
const losses = ref(0)
const ties = ref(0)

const verdictClass = computed(() => {
  if (!playerChoice.value || !cpuChoice.value) return 'idle'
  if (playerChoice.value === cpuChoice.value) return 'tie'
  const winsMap: Record<Choice, Choice> = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper',
  }
  return winsMap[playerChoice.value] === cpuChoice.value ? 'win' : 'lose'
})

const verdictLabel = computed(() => {
  switch (verdictClass.value) {
    case 'win': return 'You win!'
    case 'lose': return 'CPU wins!'
    case 'tie': return 'Tie'
    default: return 'Make a choice'
  }
})

function play(choice: Choice) {
  const bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes)
  const cpu = choices[bytes[0] % 3]
  playerChoice.value = choice
  cpuChoice.value = cpu
  const v = verdictClass.value
  if (v === 'win') wins.value++
  else if (v === 'lose') losses.value++
  else if (v === 'tie') ties.value++
}
</script>

<style scoped>
.rps-round {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}

.rps-side {
  padding: 10px;
  border-radius: 8px;
  background: rgba(148, 163, 184, 0.08);
}

.rps-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rps-symbol {
  font-size: 32px;
  line-height: 1.1;
  margin-top: 4px;
}

.rps-vs {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #94A3B8;
}

.rps-verdict {
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 13px;
}

.rps-verdict--win { background: #F0FDF4; color: #166534; }
.rps-verdict--lose { background: #FEF2F2; color: #991B1B; }
.rps-verdict--tie { background: #FEF3C7; color: #92400E; }
.rps-verdict--idle { color: #94A3B8; }

.gap-8 {
  gap: 8px;
}
</style>
