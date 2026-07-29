<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="thirdsEnabled ? 'Hide rule-of-thirds grid' : 'Show rule-of-thirds grid'"
    size="large"
    @click="toggleThirds"
  >
    <v-icon size="22" :color="thirdsEnabled ? 'primary' : undefined">
      mdi-image-frame
    </v-icon>
  </v-btn>

  <Teleport to="body">
    <template v-if="thirdsEnabled">
      <div class="thirds thirds--v thirds--v1" aria-hidden="true" />
      <div class="thirds thirds--v thirds--v2" aria-hidden="true" />
      <div class="thirds thirds--h thirds--h1" aria-hidden="true" />
      <div class="thirds thirds--h thirds--h2" aria-hidden="true" />
    </template>
  </Teleport>
</template>

<script setup lang="ts">
import { thirdsEnabled, toggleThirds } from '../utils/thirdsOverlay'
</script>

<style scoped>
.thirds {
  position: fixed;
  z-index: 9992;
  pointer-events: none;
  background: rgba(250, 204, 21, 0.5);
}

.thirds--v {
  top: 0;
  bottom: 0;
  width: 1px;
}

.thirds--v1 { left: 33.3333%; }
.thirds--v2 { left: 66.6666%; }

.thirds--h {
  left: 0;
  right: 0;
  height: 1px;
}

.thirds--h1 { top: 33.3333%; }
.thirds--h2 { top: 66.6666%; }
</style>
