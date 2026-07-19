<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Doodle pad"
        size="large"
      >
        <v-icon size="22">mdi-draw</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <canvas
        ref="canvasRef"
        class="doodle-canvas"
        width="300"
        height="200"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
        @pointerleave="onUp"
      />
      <div class="d-flex align-center gap-8 mt-2">
        <input type="color" v-model="color" class="doodle-color" />
        <v-slider
          v-model="width"
          :min="1"
          :max="20"
          :step="1"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <span class="doodle-width">{{ width }}px</span>
        <v-btn size="x-small" variant="text" @click="clear">Clear</v-btn>
        <v-btn size="x-small" variant="text" @click="save">Save</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const open = ref(false)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const color = ref('#0F172A')
const width = ref(3)
let ctx: CanvasRenderingContext2D | null = null
let drawing = false

watch(open, async (v) => {
  if (!v) return
  await nextTick()
  ctx = canvasRef.value?.getContext('2d') ?? null
  if (ctx && canvasRef.value) {
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
})

function onDown(e: PointerEvent) {
  if (!ctx) return
  drawing = true
  ctx.beginPath()
  ctx.moveTo(e.offsetX, e.offsetY)
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onMove(e: PointerEvent) {
  if (!drawing || !ctx) return
  ctx.strokeStyle = color.value
  ctx.lineWidth = width.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.stroke()
}

function onUp() {
  drawing = false
}

function clear() {
  if (!ctx || !canvasRef.value) return
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
}

function save() {
  const c = canvasRef.value
  if (!c) return
  const a = document.createElement('a')
  a.href = c.toDataURL('image/png')
  a.download = `doodle-${Date.now()}.png`
  a.click()
}
</script>

<style scoped>
.doodle-canvas {
  width: 300px;
  height: 200px;
  border-radius: 6px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: #FFFFFF;
  touch-action: none;
  cursor: crosshair;
}

.doodle-color {
  width: 30px;
  height: 26px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

.doodle-width {
  width: 32px;
  text-align: right;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #64748B;
}

.gap-8 {
  gap: 8px;
}
</style>
