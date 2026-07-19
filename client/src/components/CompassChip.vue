<template>
  <div v-if="supported" class="compass-chip" :title="tooltip">
    <v-icon
      size="14"
      class="compass-chip__icon"
      :style="{ transform: `rotate(${-heading}deg)` }"
    >
      mdi-navigation
    </v-icon>
    <span class="compass-chip__label">{{ cardinal }} {{ Math.round(heading) }}°</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface DeviceOrientationEventWithCompass extends DeviceOrientationEvent {
  webkitCompassHeading?: number
}

const heading = ref(0)
const supported = ref(false)

function onOrientation(event: DeviceOrientationEvent) {
  const e = event as DeviceOrientationEventWithCompass
  if (typeof e.webkitCompassHeading === 'number') {
    heading.value = e.webkitCompassHeading
    return
  }
  if (event.alpha !== null && event.alpha !== undefined) {
    heading.value = (360 - event.alpha) % 360
  }
}

const cardinal = computed(() => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(heading.value / 45) % 8]
})

const tooltip = computed(() => `Heading: ${Math.round(heading.value)}° (${cardinal.value})`)

onMounted(() => {
  if (typeof window.DeviceOrientationEvent === 'undefined') return
  supported.value = true
  window.addEventListener('deviceorientation', onOrientation, { passive: true })
  window.addEventListener('deviceorientationabsolute', onOrientation as EventListener, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('deviceorientation', onOrientation)
  window.removeEventListener('deviceorientationabsolute', onOrientation as EventListener)
})
</script>

<style scoped>
.compass-chip {
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

.compass-chip__icon {
  color: #DC2626 !important;
  transition: transform 200ms ease;
}

@media (max-width: 1300px) {
  .compass-chip {
    display: none;
  }
}
</style>
