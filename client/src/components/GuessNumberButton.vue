<template>
  <v-menu offset-y :close-on-content-click="false" @update:model-value="onOpen">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Guess the number"
        size="large"
      >
        <v-icon size="22">mdi-help-circle-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-1">Guess the number</div>
      <div class="text-caption text-medium-emphasis mb-2">
        I'm thinking of 1–{{ max }}
      </div>
      <v-text-field
        v-model.number="guess"
        type="number"
        label="Your guess"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        :disabled="won"
        @keyup.enter="submit"
      />
      <div class="gn-msg" :class="msg.klass">
        <v-icon size="16" class="me-1">{{ msg.icon }}</v-icon>
        {{ msg.text }}
      </div>
      <div class="text-caption text-medium-emphasis mt-2">
        Guesses: {{ tries }} · Best: {{ best === Infinity ? '—' : best }}
      </div>
      <v-btn size="small" class="mt-2" @click="restart">
        <v-icon start size="16">mdi-refresh</v-icon>
        New game
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const max = 100
const target = ref(1)
const guess = ref<number | null>(null)
const tries = ref(0)
const won = ref(false)
const feedback = ref<'idle' | 'higher' | 'lower' | 'win' | 'invalid'>('idle')
const best = ref<number>(Infinity)

function pickTarget() {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return 1 + (buf[0] % max)
}

function restart() {
  target.value = pickTarget()
  guess.value = null
  tries.value = 0
  won.value = false
  feedback.value = 'idle'
}

function onOpen(open: boolean) {
  if (open && tries.value === 0 && !won.value) restart()
}

function submit() {
  const g = Number(guess.value)
  if (!Number.isInteger(g) || g < 1 || g > max) {
    feedback.value = 'invalid'
    return
  }
  tries.value++
  if (g === target.value) {
    won.value = true
    feedback.value = 'win'
    if (tries.value < best.value) best.value = tries.value
  } else {
    feedback.value = g < target.value ? 'higher' : 'lower'
  }
}

const msg = computed(() => {
  switch (feedback.value) {
    case 'higher': return { text: 'Higher!', icon: 'mdi-arrow-up-bold', klass: 'gn-hi' }
    case 'lower': return { text: 'Lower!', icon: 'mdi-arrow-down-bold', klass: 'gn-hi' }
    case 'win': return { text: `Got it in ${tries.value}!`, icon: 'mdi-trophy', klass: 'gn-win' }
    case 'invalid': return { text: `Enter 1–${max}`, icon: 'mdi-alert-circle-outline', klass: 'gn-idle' }
    default: return { text: 'Take a guess', icon: 'mdi-help-circle-outline', klass: 'gn-idle' }
  }
})

restart()
</script>

<style scoped>
.gn-msg {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 13px;
}

.gn-idle {
  background: rgba(148, 163, 184, 0.12);
  color: #64748B;
}

.gn-hi {
  background: #FEF3C7;
  color: #92400E;
}

.gn-win {
  background: #DCFCE7;
  color: #166534;
}
</style>
