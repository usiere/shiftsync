<template>
  <v-app class="app-container">
    <router-view />
    <GlobalToasts />
    <NetworkStatusBanner />
    <SessionExpiryBanner />
  </v-app>
</template>

<script setup lang="ts">
import GlobalToasts from './components/GlobalToasts.vue'
import NetworkStatusBanner from './components/NetworkStatusBanner.vue'
import SessionExpiryBanner from './components/SessionExpiryBanner.vue'
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