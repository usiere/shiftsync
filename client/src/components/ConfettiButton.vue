<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    title="Celebrate 🎉"
    size="large"
    @click="fire"
  >
    <v-icon size="22">mdi-party-popper</v-icon>
  </v-btn>

  <Teleport to="body">
    <div v-if="pieces.length" class="confetti-layer" aria-hidden="true">
      <span
        v-for="p in pieces"
        :key="p.id"
        class="confetti-piece"
        :style="{
          left: p.left + '%',
          background: p.color,
          animationDuration: p.duration + 'ms',
          animationDelay: p.delay + 'ms',
          transform: `rotate(${p.rotate}deg)`,
        }"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Piece {
  id: number
  left: number
  color: string
  duration: number
  delay: number
  rotate: number
}

const pieces = ref<Piece[]>([])
const COLORS = ['#F97316', '#EF4444', '#22C55E', '#3B82F6', '#A855F7', '#EAB308']
let counter = 0

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function fire() {
  const batch: Piece[] = []
  for (let i = 0; i < 60; i++) {
    batch.push({
      id: ++counter,
      left: Math.random() * 100,
      color: pick(COLORS),
      duration: 1500 + Math.random() * 1200,
      delay: Math.random() * 200,
      rotate: Math.random() * 360,
    })
  }
  pieces.value = batch
  setTimeout(() => {
    pieces.value = []
  }, 3200)
}
</script>

<style scoped>
.confetti-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}

.confetti-piece {
  position: absolute;
  top: -12px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  opacity: 0.95;
  animation-name: confetti-fall;
  animation-timing-function: cubic-bezier(0.4, 0, 0.3, 1);
  animation-fill-mode: forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(105vh) rotate(720deg);
    opacity: 0.2;
  }
}
</style>
