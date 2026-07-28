<template>
  <div class="fps-chip" :class="tier" :title="tooltip">
    <v-icon size="14" class="fps-chip__icon">mdi-speedometer</v-icon>
    <span class="fps-chip__label">{{ fps }} FPS</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const fps = ref<number>(0)
let raf: number | null = null
let lastTs = 0
let frames = 0

function loop(ts: number) {
  frames++
  if (!lastTs) lastTs = ts
  const elapsed = ts - lastTs
  if (elapsed >= 500) {
    fps.value = Math.round((frames * 1000) / elapsed)
    frames = 0
    lastTs = ts
  }
  raf = requestAnimationFrame(loop)
}

const tier = computed(() => {
  if (fps.value === 0) return 'fps-idle'
  if (fps.value >= 55) return 'fps-good'
  if (fps.value >= 30) return 'fps-ok'
  return 'fps-bad'
})

const tooltip = computed(
  () => `Live FPS via requestAnimationFrame — measured over 500 ms windows`,
)

onMounted(() => {
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  raf = null
})
</script>

<style scoped>
.fps-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
}

.fps-chip__icon {
  color: #94A3B8 !important;
}

.fps-good { background: #DCFCE7; border-color: #86EFAC; color: #166534; }
.fps-good .fps-chip__icon { color: #16A34A !important; }

.fps-ok { background: #FEF3C7; border-color: #FCD34D; color: #92400E; }
.fps-ok .fps-chip__icon { color: #D97706 !important; }

.fps-bad { background: #FEE2E2; border-color: #FCA5A5; color: #991B1B; }
.fps-bad .fps-chip__icon { color: #DC2626 !important; }

@media (max-width: 1200px) {
  .fps-chip {
    display: none;
  }
}
</style>
