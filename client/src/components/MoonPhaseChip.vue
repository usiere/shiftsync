<template>
  <div class="moon-chip" :title="tooltip">
    <span class="moon-chip__glyph">{{ phase.glyph }}</span>
    <span class="moon-chip__label">{{ phase.label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

interface Phase {
  glyph: string
  label: string
  index: number
}

function computePhase(date: Date): Phase {
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14) / 86_400_000
  const days = date.getTime() / 86_400_000 - knownNewMoon
  const lunations = days / 29.530588853
  const raw = lunations - Math.floor(lunations)
  const idx = Math.floor(raw * 8) % 8
  const phases: Phase[] = [
    { glyph: '🌑', label: 'New moon', index: 0 },
    { glyph: '🌒', label: 'Waxing crescent', index: 1 },
    { glyph: '🌓', label: 'First quarter', index: 2 },
    { glyph: '🌔', label: 'Waxing gibbous', index: 3 },
    { glyph: '🌕', label: 'Full moon', index: 4 },
    { glyph: '🌖', label: 'Waning gibbous', index: 5 },
    { glyph: '🌗', label: 'Last quarter', index: 6 },
    { glyph: '🌘', label: 'Waning crescent', index: 7 },
  ]
  return phases[idx]
}

const phase = computed(() => computePhase(now.value))

const tooltip = computed(() => `Moon: ${phase.value.label}`)

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 60 * 60_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.moon-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.moon-chip__glyph {
  font-size: 14px;
  line-height: 1;
}

.moon-chip__label {
  color: #94A3B8;
}

@media (max-width: 1280px) {
  .moon-chip {
    display: none;
  }
}
</style>
