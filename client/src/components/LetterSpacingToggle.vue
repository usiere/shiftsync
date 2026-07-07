<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="letterSpacingWide ? 'Disable wide letter spacing' : 'Enable wide letter spacing (dyslexia-friendly)'"
    size="large"
    @click="toggleLetterSpacing"
  >
    <v-icon size="22" :color="letterSpacingWide ? 'primary' : undefined">
      mdi-format-letter-matches
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { letterSpacingWide, toggleLetterSpacing } from '../utils/letterSpacing'
</script>
