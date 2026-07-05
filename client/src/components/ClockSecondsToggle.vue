<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="clockShowSeconds ? 'Hide seconds on the clock' : 'Show seconds on the clock'"
    size="large"
    @click="toggleClockSeconds"
  >
    <v-icon size="22" :color="clockShowSeconds ? 'primary' : undefined">
      {{ clockShowSeconds ? 'mdi-timer-outline' : 'mdi-timer-off-outline' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { clockShowSeconds, toggleClockSeconds } from '../utils/clockFormat'
</script>
