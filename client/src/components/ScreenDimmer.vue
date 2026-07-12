<template>
  <Teleport to="body">
    <div
      v-if="screenDim > 0"
      class="screen-dim"
      :style="{ background: `rgba(0, 0, 0, ${screenDim})` }"
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
        :title="screenDim > 0 ? `Screen dim ${Math.round(screenDim * 100)}%` : 'Screen dimmer'"
        size="large"
      >
        <v-icon size="22" :color="screenDim > 0 ? 'primary' : undefined">
          {{ screenDim > 0 ? 'mdi-brightness-4' : 'mdi-brightness-7' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="260" class="pa-3">
      <div class="text-caption text-medium-emphasis mb-1">Screen dimmer</div>
      <div class="d-flex align-center gap-8">
        <v-icon size="16">mdi-brightness-7</v-icon>
        <v-slider
          :model-value="screenDim"
          @update:model-value="setScreenDim"
          :min="0"
          :max="0.7"
          :step="0.05"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <v-icon size="16">mdi-brightness-4</v-icon>
      </div>
      <div class="d-flex justify-space-between mt-1">
        <span class="text-caption text-medium-emphasis">{{ Math.round(screenDim * 100) }}% dim</span>
        <v-btn size="x-small" variant="text" @click="setScreenDim(0)">Reset</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { screenDim, setScreenDim } from '../utils/screenDim'
</script>

<style scoped>
.screen-dim {
  position: fixed;
  inset: 0;
  z-index: 9997;
  pointer-events: none;
  transition: background 200ms ease;
}

.gap-8 {
  gap: 8px;
}
</style>
