<template>
  <Teleport to="body">
    <div
      v-if="gridOverlayEnabled"
      class="grid-overlay"
      :style="{
        backgroundSize: `${gridOverlaySize}px ${gridOverlaySize}px`,
      }"
      aria-hidden="true"
    />
  </Teleport>

  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="gridOverlayEnabled ? `Grid overlay (${gridOverlaySize}px)` : 'Grid overlay'"
        size="large"
      >
        <v-icon size="22" :color="gridOverlayEnabled ? 'primary' : undefined">
          mdi-grid
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="240" class="pa-3">
      <v-checkbox
        :model-value="gridOverlayEnabled"
        @update:model-value="toggleGridOverlay"
        density="compact"
        hide-details
        label="Show grid overlay"
        class="mb-2"
      />
      <div class="text-caption text-medium-emphasis mb-1">
        Cell size: {{ gridOverlaySize }}px
      </div>
      <v-slider
        v-model="gridOverlaySize"
        :min="4"
        :max="64"
        :step="1"
        hide-details
        density="compact"
      />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import {
  gridOverlayEnabled,
  gridOverlaySize,
  toggleGridOverlay,
} from '../utils/gridOverlay'
</script>

<style scoped>
.grid-overlay {
  position: fixed;
  inset: 0;
  z-index: 9996;
  pointer-events: none;
  background-image:
    linear-gradient(to right, rgba(37, 99, 235, 0.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(37, 99, 235, 0.12) 1px, transparent 1px);
}
</style>
