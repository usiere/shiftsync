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
        <v-icon size="22" :color="autoThemeMode !== 'off' ? 'primary' : undefined">
          {{ icon }}
        </v-icon>
      </v-btn>
    </template>

    <v-list density="compact" min-width="240">
      <v-list-subheader>Auto dark mode</v-list-subheader>
      <v-list-item
        v-for="opt in options"
        :key="opt.value"
        :active="autoThemeMode === opt.value"
        @click="setAutoTheme(opt.value)"
      >
        <template v-slot:prepend>
          <v-icon size="18">
            {{ autoThemeMode === opt.value ? 'mdi-check' : opt.icon }}
          </v-icon>
        </template>
        <v-list-item-title>{{ opt.label }}</v-list-item-title>
        <v-list-item-subtitle>{{ opt.hint }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import {
  autoThemeMode,
  registerThemeApplier,
  setAutoTheme,
  type AutoThemeMode,
} from '../utils/autoTheme'

interface Option {
  label: string
  hint: string
  value: AutoThemeMode
  icon: string
}

const options: Option[] = [
  { label: 'Off', hint: 'Manual theme only', value: 'off', icon: 'mdi-close-circle-outline' },
  { label: 'Follow system', hint: 'Match OS preference', value: 'system', icon: 'mdi-monitor' },
  { label: 'Dark after 7pm', hint: 'Auto dark 19:00–07:00', value: 'sunset', icon: 'mdi-weather-night' },
]

const theme = useTheme()

const icon = computed(() => {
  switch (autoThemeMode.value) {
    case 'system': return 'mdi-monitor'
    case 'sunset': return 'mdi-weather-sunset'
    default: return 'mdi-theme-light-dark'
  }
})

const tooltip = computed(() => {
  switch (autoThemeMode.value) {
    case 'system': return 'Auto theme: follow system'
    case 'sunset': return 'Auto theme: dark after 7pm'
    default: return 'Auto dark mode is off'
  }
})

onMounted(() => {
  registerThemeApplier((name) => {
    if (theme.global.name.value !== name) {
      theme.global.name.value = name
      try {
        localStorage.setItem('theme', name)
      } catch {
        /* ignore */
      }
    }
  })
})
</script>
