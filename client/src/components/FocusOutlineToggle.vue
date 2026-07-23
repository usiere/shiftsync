<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="focusOutline ? 'Hide always-on focus outlines' : 'Show always-on focus outlines'"
    size="large"
    @click="toggleFocusOutline"
  >
    <v-icon size="22" :color="focusOutline ? 'primary' : undefined">
      mdi-selection-marker
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { focusOutline, toggleFocusOutline } from '../utils/focusOutline'
</script>
