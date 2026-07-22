<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Whack-a-mole"
        size="large"
      >
        <v-icon size="22">mdi-emoticon-devil-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3 text-center">
      <div class="text-subtitle-2 mb-2">Whack the mole</div>
      <div class="wam-grid">
        <button
          v-for="i in 9"
          :key="i"
          class="wam-hole"
          :class="{ 'wam-hole--up': activeIdx === i - 1 }"
          :disabled="!running"
          @click="hit(i - 1)"
        >
          <span v-if="activeIdx === i - 1">🐭</span>
        </button>
      </div>
      <div class="d-flex align-center mt-3">
        <span class="text-caption text-medium-emphasis flex-grow-1">
          Score {{ score }} · {{ timeLeft }}s
        </span>
        <v-btn v-if="!running" color="primary" size="small" @click="start">
          {{ score > 0 ? 'Play again' : 'Start' }}
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const running = ref(false)
const score = ref(0)
const timeLeft = ref(20)
const activeIdx = ref(-1)
let moleTimer: ReturnType<typeof setTimeout> | null = null
let clockTimer: ReturnType<typeof setInterval> | null = null

function scheduleMole() {
  if (moleTimer) clearTimeout(moleTimer)
  if (!running.value) return
  const bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes)
  activeIdx.value = bytes[0] % 9
  moleTimer = setTimeout(() => {
    activeIdx.value = -1
    setTimeout(scheduleMole, 200 + Math.random() * 300)
  }, 600 + Math.random() * 500)
}

function start() {
  score.value = 0
  timeLeft.value = 20
  running.value = true
  scheduleMole()
  clockTimer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) stop()
  }, 1000)
}

function stop() {
  running.value = false
  activeIdx.value = -1
  if (moleTimer) clearTimeout(moleTimer)
  if (clockTimer) clearInterval(clockTimer)
  moleTimer = null
  clockTimer = null
}

function hit(idx: number) {
  if (!running.value) return
  if (idx === activeIdx.value) {
    score.value++
    activeIdx.value = -1
    scheduleMole()
  }
}

onBeforeUnmount(stop)
</script>

<style scoped>
.wam-grid {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  gap: 6px;
  justify-content: center;
}

.wam-hole {
  width: 60px;
  height: 60px;
  border-radius: 30px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: #78350F;
  color: #FFF;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 100ms ease;
}

.wam-hole--up {
  background: #16A34A;
  transform: scale(1.05);
}

.wam-hole:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
