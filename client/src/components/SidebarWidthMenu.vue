<template>
  <v-menu offset="8" :close-on-content-click="false">
    <template #activator="{ props }">
      <v-btn
        icon
        variant="text"
        class="me-2"
        title="Sidebar width"
        size="large"
        v-bind="props"
      >
        <v-icon size="22">mdi-arrow-split-vertical</v-icon>
      </v-btn>
    </template>
    <v-card min-width="260" class="pa-3">
      <div class="d-flex align-center justify-space-between mb-1">
        <span class="text-caption text-medium-emphasis">Sidebar width</span>
        <span class="text-caption font-weight-medium">{{ sidebarWidth }}px</span>
      </div>
      <v-slider
        v-model="value"
        :min="SIDEBAR_WIDTH_MIN"
        :max="SIDEBAR_WIDTH_MAX"
        :step="4"
        hide-details
        density="compact"
        thumb-label
      />
      <div class="d-flex justify-end mt-2">
        <v-btn size="small" variant="text" @click="onReset">Reset</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  resetSidebarWidth,
  setSidebarWidth,
  sidebarWidth,
} from '../utils/sidebarWidth'

const value = computed({
  get: () => sidebarWidth.value,
  set: (v: number) => setSidebarWidth(v),
})

function onReset() {
  resetSidebarWidth()
}
</script>
