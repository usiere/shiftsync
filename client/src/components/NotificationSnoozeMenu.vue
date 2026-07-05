<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="tooltip"
        size="large"
      >
        <v-icon size="22" :color="snoozeActive ? 'warning' : undefined">
          {{ snoozeActive ? 'mdi-bell-sleep' : 'mdi-bell-sleep-outline' }}
        </v-icon>
      </v-btn>
    </template>

    <v-list density="compact" min-width="220">
      <v-list-subheader>Snooze notifications</v-list-subheader>
      <v-list-item
        v-for="opt in options"
        :key="opt.value"
        :title="opt.label"
        @click="snooze(opt.value)"
      >
        <template v-slot:prepend>
          <v-icon size="18">mdi-timer-sand</v-icon>
        </template>
      </v-list-item>
      <v-divider />
      <v-list-item v-if="snoozeActive" @click="wake">
        <template v-slot:prepend>
          <v-icon size="18" color="warning">mdi-bell-ring</v-icon>
        </template>
        <v-list-item-title>
          Wake now ({{ snoozeMinutesLeft }} min left)
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { clearSnooze, snoozeActive, snoozeFor, snoozeMinutesLeft } from '../utils/snooze'

const options = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
]

const tooltip = computed(() =>
  snoozeActive.value
    ? `Notifications snoozed for ${snoozeMinutesLeft.value} more min`
    : 'Snooze notifications',
)

function snooze(minutes: number) {
  snoozeFor(minutes)
}

function wake() {
  clearSnooze()
}
</script>
