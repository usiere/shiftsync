<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="uppercaseMode ? 'Disable uppercase mode' : 'Force UPPERCASE text'"
    size="large"
    @click="toggleUppercaseMode"
  >
    <v-icon size="22" :color="uppercaseMode ? 'primary' : undefined">
      {{ uppercaseMode ? 'mdi-format-letter-case-upper' : 'mdi-format-letter-case' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { toggleUppercaseMode, uppercaseMode } from '../utils/uppercaseMode'
</script>
