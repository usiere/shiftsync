<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="crtScanline ? 'Hide CRT scanlines' : 'Show CRT scanlines'"
    size="large"
    @click="toggleCrtScanline"
  >
    <v-icon size="22" :color="crtScanline ? 'primary' : undefined">
      mdi-television-classic
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { crtScanline, toggleCrtScanline } from '../utils/crtScanline'
</script>
