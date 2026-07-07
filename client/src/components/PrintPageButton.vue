<template>
  <v-btn
    icon
    variant="text"
    class="me-2"
    title="Print current page (⌘P)"
    size="large"
    @click="print"
  >
    <v-icon size="22">mdi-printer</v-icon>
  </v-btn>
</template>

<script setup lang="ts">
function print() {
  window.print()
}
</script>
