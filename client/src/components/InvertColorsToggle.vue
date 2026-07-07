<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="invertColors ? 'Disable inverted colors' : 'Enable inverted colors'"
    size="large"
    @click="toggleInvertColors"
  >
    <v-icon size="22" :color="invertColors ? 'primary' : undefined">
      {{ invertColors ? 'mdi-invert-colors' : 'mdi-invert-colors-off' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { invertColors, toggleInvertColors } from '../utils/invertColors'
</script>
