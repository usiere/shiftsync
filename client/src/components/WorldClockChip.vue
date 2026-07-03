<template>
  <v-menu offset="8">
    <template #activator="{ props }">
      <div class="world-clock" v-bind="props" :title="fullLabel">
        <v-icon size="14" class="world-clock__icon">mdi-earth-arrow-right</v-icon>
        <span v-if="worldClockZone" class="world-clock__label">{{ shortLabel }}</span>
        <span v-if="worldClockZone" class="world-clock__time">{{ timeLabel }}</span>
        <span v-else class="world-clock__placeholder">World clock</span>
      </div>
    </template>
    <v-list density="compact" min-width="200">
      <v-list-item
        v-for="opt in WORLD_ZONE_OPTIONS"
        :key="opt.id || 'off'"
        :active="opt.id === worldClockZone"
        @click="setWorldClockZone(opt.id)"
      >
        <v-list-item-title>{{ opt.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  WORLD_ZONE_OPTIONS,
  setWorldClockZone,
  worldClockZone,
} from '../utils/worldClock'

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

const shortLabel = computed(() => {
  const opt = WORLD_ZONE_OPTIONS.find((o) => o.id === worldClockZone.value)
  return opt?.label || worldClockZone.value
})

const timeLabel = computed(() => {
  if (!worldClockZone.value) return ''
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: worldClockZone.value,
    }).format(now.value)
  } catch {
    return ''
  }
})

const fullLabel = computed(() => {
  if (!worldClockZone.value) return 'Choose a secondary time zone'
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: worldClockZone.value,
    }).format(now.value)
  } catch {
    return shortLabel.value
  }
})

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 30_000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  timer = null
})
</script>

<style scoped>
.world-clock {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
}

.world-clock:hover {
  background: rgba(148, 163, 184, 0.08);
}

.world-clock__icon {
  color: #94A3B8 !important;
}

.world-clock__label {
  color: #94A3B8;
  font-size: 10px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.world-clock__time {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.world-clock__placeholder {
  color: #94A3B8;
  font-size: 11px;
}

@media (max-width: 1200px) {
  .world-clock {
    display: none;
  }
}
</style>
