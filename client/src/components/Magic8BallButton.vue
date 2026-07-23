<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Magic 8-ball"
        size="large"
      >
        <v-icon size="22">mdi-billiards</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Magic 8-ball</div>
      <v-text-field
        v-model="question"
        label="Ask a yes/no question"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-3"
        @keyup.enter="shake"
      />
      <div class="mb-ball" :class="{ 'mb-ball--shake': shaking }">
        <div class="mb-ball__inner">
          <span class="mb-ball__text" :class="answerClass">{{ answer || '8' }}</span>
        </div>
      </div>
      <v-btn color="primary" size="small" class="mt-3" @click="shake">
        <v-icon start size="16">mdi-refresh</v-icon>
        Shake
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const POSITIVE = [
  'It is certain',
  'Without a doubt',
  'Yes, definitely',
  'You may rely on it',
  'Signs point to yes',
  'Yes',
  'Most likely',
  'Outlook good',
]
const NEUTRAL = [
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
]
const NEGATIVE = [
  'Don’t count on it',
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful',
]

const ALL = [...POSITIVE, ...NEUTRAL, ...NEGATIVE]

const question = ref('')
const answer = ref('')
const shaking = ref(false)

const answerClass = computed(() => {
  if (POSITIVE.includes(answer.value)) return 'mb-pos'
  if (NEGATIVE.includes(answer.value)) return 'mb-neg'
  if (NEUTRAL.includes(answer.value)) return 'mb-neu'
  return ''
})

function shake() {
  shaking.value = true
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  const pick = ALL[buf[0] % ALL.length]
  setTimeout(() => {
    answer.value = pick
    shaking.value = false
  }, 500)
}
</script>

<style scoped>
.mb-ball {
  width: 140px;
  height: 140px;
  margin: 0 auto;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4B5563, #111827 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 -10px 20px rgba(0, 0, 0, 0.5);
}

.mb-ball--shake {
  animation: mb-shake 0.5s ease-in-out;
}

.mb-ball__inner {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #0F172A;
  border: 2px solid #1E293B;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}

.mb-ball__text {
  color: #E2E8F0;
  font-family: 'DM Sans', sans-serif;
  font-size: 9px;
  font-weight: 700;
  text-align: center;
  line-height: 1.15;
}

.mb-pos { color: #86EFAC; }
.mb-neg { color: #FCA5A5; }
.mb-neu { color: #FDE68A; }

@keyframes mb-shake {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  20% { transform: translate(-4px, 2px) rotate(-4deg); }
  40% { transform: translate(4px, -2px) rotate(4deg); }
  60% { transform: translate(-3px, -2px) rotate(-3deg); }
  80% { transform: translate(3px, 2px) rotate(3deg); }
}
</style>
