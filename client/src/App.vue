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
  min-height: 100vh;
}

.v-theme--light .app-container,
.v-theme--light .app-container .v-main {
  background: #F7F8FA !important;
}

.v-theme--dark .app-container,
.v-theme--dark .app-container .v-main {
  background: rgb(var(--v-theme-background)) !important;
}
</style>