<template>
  <v-menu offset-y>
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="tooltip"
        size="large"
      >
        <v-icon size="22" :color="autoRefreshMinutes > 0 ? 'primary' : undefined">
          {{ autoRefreshMinutes > 0 ? 'mdi-refresh-auto' : 'mdi-refresh' }}
        </v-icon>
      </v-btn>
    </template>

    <v-list density="compact" min-width="200">
      <v-list-subheader>Auto-refresh page</v-list-subheader>
      <v-list-item
        v-for="opt in options"
        :key="opt.value"
        :active="autoRefreshMinutes === opt.value"
        @click="setAutoRefresh(opt.value)"
      >
        <template v-slot:prepend>
          <v-icon size="18">
            {{ autoRefreshMinutes === opt.value ? 'mdi-check' : 'mdi-timer-outline' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ opt.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { autoRefreshMinutes, setAutoRefresh } from '../utils/autoRefresh'

const options = [
  { label: 'Off', value: 0 },
  { label: 'Every 1 minute', value: 1 },
  { label: 'Every 5 minutes', value: 5 },
  { label: 'Every 15 minutes', value: 15 },
  { label: 'Every 30 minutes', value: 30 },
  { label: 'Every 60 minutes', value: 60 },
]

const tooltip = computed(() =>
  autoRefreshMinutes.value > 0
    ? `Auto-refresh every ${autoRefreshMinutes.value} min`
    : 'Auto-refresh is off',
)
</script>
