<template>
  <v-menu
    v-if="supported"
    offset-y
    :close-on-content-click="false"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Vibrate device"
        size="large"
      >
        <v-icon size="22">mdi-vibrate</v-icon>
      </v-btn>
    </template>

    <v-card min-width="240" class="pa-3">
      <div class="text-subtitle-2 mb-2">Vibration patterns</div>
      <div class="vib-list">
        <v-btn
          v-for="p in patterns"
          :key="p.label"
          size="small"
          variant="tonal"
          class="mb-1"
          block
          @click="play(p.pattern)"
        >
          <v-icon start size="16">mdi-vibrate</v-icon>
          {{ p.label }}
        </v-btn>
      </div>
      <v-btn size="small" variant="text" block class="mt-2" @click="stop">
        Stop
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
interface NavigatorWithVibrate extends Navigator {
  vibrate(pattern: number | number[]): boolean
}

const nav = navigator as NavigatorWithVibrate
const supported = typeof nav.vibrate === 'function'

const patterns = [
  { label: 'Short pulse', pattern: [80] },
  { label: 'Double pulse', pattern: [80, 60, 80] },
  { label: 'Long buzz', pattern: [400] },
  { label: 'S·O·S', pattern: [100, 60, 100, 60, 100, 220, 300, 60, 300, 60, 300, 220, 100, 60, 100, 60, 100] },
  { label: 'Heartbeat', pattern: [50, 40, 120, 300, 50, 40, 120] },
]

function play(pattern: number[]) {
  if (!supported) return
  nav.vibrate(pattern)
}

function stop() {
  if (!supported) return
  nav.vibrate(0)
}
</script>

<style scoped>
.vib-list {
  display: flex;
  flex-direction: column;
}
</style>
