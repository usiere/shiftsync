<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    :title="doNotDisturb ? 'Do not disturb is ON (toasts hidden)' : 'Turn on do not disturb'"
    size="large"
    @click="onClick"
  >
    <v-icon
      size="22"
      :color="doNotDisturb ? 'warning' : undefined"
    >
      {{ doNotDisturb ? 'mdi-bell-off' : 'mdi-bell-outline' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { doNotDisturb, toggleDoNotDisturb } from '../utils/dnd'

function onClick() {
  toggleDoNotDisturb()
}
</script>
