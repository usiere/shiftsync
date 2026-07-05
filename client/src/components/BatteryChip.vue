<template>
  <div v-if="supported" class="battery-chip" :class="stateClass" :title="tooltip">
    <v-icon size="14" class="battery-chip__icon">{{ icon }}</v-icon>
    <span class="battery-chip__label">{{ percent }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface BatteryLike {
  level: number
  charging: boolean
  chargingTime: number
  dischargingTime: number
  addEventListener(type: string, listener: () => void): void
  removeEventListener(type: string, listener: () => void): void
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryLike>
}

const supported = ref(false)
const level = ref(1)
const charging = ref(false)
let battery: BatteryLike | null = null

const percent = computed(() => Math.round(level.value * 100))

const icon = computed(() => {
  if (charging.value) return 'mdi-battery-charging'
  const p = percent.value
  if (p >= 95) return 'mdi-battery'
  if (p >= 80) return 'mdi-battery-80'
  if (p >= 60) return 'mdi-battery-60'
  if (p >= 40) return 'mdi-battery-40'
  if (p >= 20) return 'mdi-battery-20'
  return 'mdi-battery-alert'
})

const stateClass = computed(() => {
  if (charging.value) return 'battery-chip--charging'
  if (percent.value <= 20) return 'battery-chip--low'
  return ''
})

const tooltip = computed(() => {
  if (charging.value) return `Battery ${percent.value}% (charging)`
  return `Battery ${percent.value}%`
})

function update() {
  if (!battery) return
  level.value = battery.level
  charging.value = battery.charging
}

onMounted(async () => {
  const nav = navigator as NavigatorWithBattery
  if (typeof nav.getBattery !== 'function') return
  try {
    battery = await nav.getBattery()
    supported.value = true
    update()
    battery.addEventListener('levelchange', update)
    battery.addEventListener('chargingchange', update)
  } catch {
    /* ignore */
  }
})

onBeforeUnmount(() => {
  if (!battery) return
  battery.removeEventListener('levelchange', update)
  battery.removeEventListener('chargingchange', update)
  battery = null
})
</script>

<style scoped>
.battery-chip {
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

.battery-chip__icon {
  color: #94A3B8 !important;
}

.battery-chip--charging {
  border-color: #86EFAC;
  background: #F0FDF4;
  color: #166534;
}

.battery-chip--charging .battery-chip__icon {
  color: #16A34A !important;
}

.battery-chip--low {
  border-color: #FCA5A5;
  background: #FEF2F2;
  color: #991B1B;
}

.battery-chip--low .battery-chip__icon {
  color: #DC2626 !important;
}

@media (max-width: 1100px) {
  .battery-chip {
    display: none;
  }
}
</style>
