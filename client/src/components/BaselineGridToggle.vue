<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="baselineGrid ? 'Hide 8px baseline grid' : 'Show 8px baseline grid'"
    size="large"
    @click="toggleBaselineGrid"
  >
    <v-icon size="22" :color="baselineGrid ? 'primary' : undefined">
      mdi-format-line-spacing
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { baselineGrid, toggleBaselineGrid } from '../utils/baselineGrid'
</script>
