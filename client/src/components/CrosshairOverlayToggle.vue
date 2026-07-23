<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="crosshairEnabled ? 'Hide center crosshair' : 'Show center crosshair'"
    size="large"
    @click="toggleCrosshair"
  >
    <v-icon size="22" :color="crosshairEnabled ? 'primary' : undefined">
      mdi-crosshairs
    </v-icon>
  </v-btn>

  <Teleport to="body">
    <template v-if="crosshairEnabled">
      <div class="crosshair crosshair--v" aria-hidden="true" />
      <div class="crosshair crosshair--h" aria-hidden="true" />
      <div class="crosshair-dot" aria-hidden="true" />
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { crosshairEnabled, toggleCrosshair } from '../utils/crosshairOverlay'
</script>

<style scoped>
.crosshair {
  position: fixed;
  z-index: 9993;
  pointer-events: none;
  background: rgba(220, 38, 38, 0.55);
}

.crosshair--v {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  transform: translateX(-50%);
}

.crosshair--h {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  transform: translateY(-50%);
}

.crosshair-dot {
  position: fixed;
  z-index: 9993;
  pointer-events: none;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #DC2626;
  background: rgba(220, 38, 38, 0.15);
  transform: translate(-50%, -50%);
}
</style>
