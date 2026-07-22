<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="compactScroll ? 'Use default scrollbars' : 'Use compact scrollbars'"
    size="large"
    @click="toggleCompactScroll"
  >
    <v-icon size="22" :color="compactScroll ? 'primary' : undefined">
      mdi-arrow-collapse-vertical
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { compactScroll, toggleCompactScroll } from '../utils/compactScroll'
</script>
