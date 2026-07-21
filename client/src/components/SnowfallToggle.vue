<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="enabled ? 'Turn off snowfall' : 'Turn on snowfall'"
    size="large"
    @click="toggle"
  >
    <v-icon size="22" :color="enabled ? 'primary' : undefined">
      mdi-weather-snowy-heavy
    </v-icon>
  </v-btn>

  <Teleport to="body">
    <div v-if="enabled" class="snow-layer" aria-hidden="true">
      <span
        v-for="f in flakes"
        :key="f.id"
        class="snow-flake"
        :style="{
          left: f.left + '%',
          fontSize: f.size + 'px',
          animationDuration: f.duration + 's',
          animationDelay: f.delay + 's',
        }"
      >❄</span>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Flake {
  id: number
  left: number
  size: number
  duration: number
  delay: number
}

const enabled = ref(false)
const seed = ref(0)

const flakes = computed<Flake[]>(() => {
  void seed.value
  return Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 8 + Math.random() * 14,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 8,
  }))
})

function toggle() {
  enabled.value = !enabled.value
  if (enabled.value) seed.value++
}
</script>

<style scoped>
.snow-layer {
  position: fixed;
  inset: 0;
  z-index: 9993;
  pointer-events: none;
  overflow: hidden;
}

.snow-flake {
  position: absolute;
  top: -20px;
  color: #F1F5F9;
  opacity: 0.85;
  animation-name: snow-fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  text-shadow: 0 0 6px rgba(191, 219, 254, 0.6);
}

@keyframes snow-fall {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateY(105vh) translateX(30px);
    opacity: 0.4;
  }
}
</style>
