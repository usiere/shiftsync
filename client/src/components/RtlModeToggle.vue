<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="rtlMode ? 'Switch to LTR' : 'Switch to RTL'"
    size="large"
    @click="toggleRtlMode"
  >
    <v-icon size="22" :color="rtlMode ? 'primary' : undefined">
      {{ rtlMode ? 'mdi-format-textdirection-r-to-l' : 'mdi-format-textdirection-l-to-r' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { rtlMode, toggleRtlMode } from '../utils/rtlMode'
</script>
