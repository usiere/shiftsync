<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="sepiaMode ? 'Disable sepia (warm) mode' : 'Enable sepia (warm) mode'"
    size="large"
    @click="toggleSepiaMode"
  >
    <v-icon size="22" :color="sepiaMode ? 'warning' : undefined">
      {{ sepiaMode ? 'mdi-image-filter-vintage' : 'mdi-image-filter-none' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { sepiaMode, toggleSepiaMode } from '../utils/sepiaMode'
</script>
