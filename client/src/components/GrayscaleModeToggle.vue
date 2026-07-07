<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="grayscaleMode ? 'Disable grayscale mode' : 'Enable grayscale mode'"
    size="large"
    @click="toggleGrayscaleMode"
  >
    <v-icon size="22" :color="grayscaleMode ? 'primary' : undefined">
      mdi-image-filter-black-white
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { grayscaleMode, toggleGrayscaleMode } from '../utils/grayscaleMode'
</script>
