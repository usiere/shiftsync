<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="enabled ? 'Turn off matrix rain' : 'Toggle matrix rain'"
    size="large"
    @click="toggle"
  >
    <v-icon size="22" :color="enabled ? 'success' : undefined">
      mdi-matrix
    </v-icon>
  </v-btn>

  <Teleport to="body">
    <canvas
      v-if="enabled"
      ref="canvas"
      class="matrix-canvas"
      aria-hidden="true"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'

const enabled = ref(false)
const canvas = ref<HTMLCanvasElement | null>(null)
let raf: number | null = null
let drops: number[] = []
let cols = 0

const GLYPHS = 'アカサタナハマヤラワ01<>{}[];/'.split('')

function resize() {
  const c = canvas.value
  if (!c) return
  c.width = window.innerWidth
  c.height = window.innerHeight
  const size = 14
  cols = Math.floor(c.width / size)
  drops = Array.from({ length: cols }, () => Math.random() * -50)
}

function draw() {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return
  const size = 14
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#22C55E'
  ctx.font = `${size}px monospace`
  for (let i = 0; i < drops.length; i++) {
    const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    ctx.fillText(ch, i * size, drops[i] * size)
    if (drops[i] * size > c.height && Math.random() > 0.975) drops[i] = 0
    drops[i]++
  }
  raf = requestAnimationFrame(draw)
}

async function toggle() {
  if (enabled.value) {
    stop()
  } else {
    enabled.value = true
    await nextTick()
    start()
  }
}

function start() {
  window.addEventListener('resize', resize)
  resize()
  raf = requestAnimationFrame(draw)
}

function stop() {
  if (raf !== null) cancelAnimationFrame(raf)
  raf = null
  window.removeEventListener('resize', resize)
  enabled.value = false
}

onBeforeUnmount(stop)
</script>

<style scoped>
.matrix-canvas {
  position: fixed;
  inset: 0;
  z-index: 9995;
  pointer-events: none;
  opacity: 0.55;
}
</style>
