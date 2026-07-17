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
        title="CSS animation gallery"
        size="large"
      >
        <v-icon size="22">mdi-animation-play-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="anim-grid">
        <button
          v-for="a in animations"
          :key="a.key"
          class="anim-card"
          :class="{ 'anim-card--active': selected === a.key }"
          @click="selected = a.key"
        >
          <div class="anim-box" :style="{ animation: a.css }" />
          <div class="anim-name">{{ a.name }}</div>
        </button>
      </div>

      <div class="d-flex align-center gap-8 mt-3">
        <code class="anim-code flex-grow-1">animation: {{ selectedAnim.css }};</code>
        <v-btn size="small" variant="text" @click="copy">
          <v-icon size="16">mdi-content-copy</v-icon>
        </v-btn>
      </div>
      <div class="text-caption text-medium-emphasis mt-1">
        Requires the matching <code>@keyframes {{ selectedAnim.frames }}</code> definition.
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

interface Anim {
  key: string
  name: string
  css: string
  frames: string
}

const open = ref(false)
const selected = ref('spin')
const notify = useNotificationStore()

const animations: Anim[] = [
  { key: 'spin', name: 'Spin', css: 'anim-spin 1.5s linear infinite', frames: 'anim-spin' },
  { key: 'pulse', name: 'Pulse', css: 'anim-pulse 1.4s ease-in-out infinite', frames: 'anim-pulse' },
  { key: 'bounce', name: 'Bounce', css: 'anim-bounce 1.2s ease-in-out infinite', frames: 'anim-bounce' },
  { key: 'shake', name: 'Shake', css: 'anim-shake 0.7s ease-in-out infinite', frames: 'anim-shake' },
  { key: 'fade', name: 'Fade', css: 'anim-fade 1.6s ease-in-out infinite alternate', frames: 'anim-fade' },
  { key: 'slide', name: 'Slide', css: 'anim-slide 1.6s ease-in-out infinite alternate', frames: 'anim-slide' },
]

const selectedAnim = computed(
  () => animations.find((a) => a.key === selected.value) ?? animations[0],
)

async function copy() {
  try {
    await navigator.clipboard.writeText(`animation: ${selectedAnim.value.css};`)
    notify.showToast({
      type: 'success',
      title: 'Animation copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.anim-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.anim-card {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: transparent;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: border-color 120ms ease, background 120ms ease;
}

.anim-card:hover {
  background: rgba(148, 163, 184, 0.08);
}

.anim-card--active {
  border-color: #2563EB;
  background: rgba(37, 99, 235, 0.08);
}

.anim-box {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  background: linear-gradient(135deg, #F97316, #DB2777);
}

.anim-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #64748B;
}

.anim-code {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 4px 8px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  word-break: break-all;
}

code {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  background: rgba(148, 163, 184, 0.15);
  padding: 1px 4px;
  border-radius: 3px;
}

@keyframes anim-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes anim-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}

@keyframes anim-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes anim-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

@keyframes anim-fade {
  from { opacity: 0.2; }
  to { opacity: 1; }
}

@keyframes anim-slide {
  from { transform: translateX(-8px); }
  to { transform: translateX(8px); }
}

.gap-8 {
  gap: 8px;
}
</style>
