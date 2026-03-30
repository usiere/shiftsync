<template>
  <v-app class="app-container">
    <router-view />
    <GlobalToasts />
  </v-app>
</template>

<script setup lang="ts">
import GlobalToasts from './components/GlobalToasts.vue'
</script>

<style>
.app-container {
  background: #F7F8FA;
  min-height: 100vh;
}

.app-container .v-main {
  background: #F7F8FA !important;
}
</style>