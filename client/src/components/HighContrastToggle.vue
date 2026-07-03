<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="highContrast ? 'Disable high-contrast mode' : 'Enable high-contrast mode'"
    size="large"
    @click="onClick"
  >
    <v-icon size="22" :color="highContrast ? 'primary' : undefined">
      {{ highContrast ? 'mdi-contrast-circle' : 'mdi-contrast' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { highContrast, toggleHighContrast } from '../utils/highContrast'

function onClick() {
  toggleHighContrast()
}
</script>
