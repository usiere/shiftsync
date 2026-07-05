<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="underlineLinks ? 'Disable always-underline links' : 'Always underline links'"
    size="large"
    @click="toggleUnderlineLinks"
  >
    <v-icon size="22" :color="underlineLinks ? 'primary' : undefined">
      mdi-format-underline
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { toggleUnderlineLinks, underlineLinks } from '../utils/underlineLinks'
</script>
