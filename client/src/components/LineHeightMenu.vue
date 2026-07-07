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
        <v-icon size="22" :color="lineHeight !== 'normal' ? 'primary' : undefined">
          mdi-format-line-spacing
        </v-icon>
      </v-btn>
    </template>

    <v-list density="compact" min-width="200">
      <v-list-subheader>Line height</v-list-subheader>
      <v-list-item
        v-for="opt in options"
        :key="opt.value"
        :active="lineHeight === opt.value"
        @click="setLineHeight(opt.value)"
      >
        <template v-slot:prepend>
          <v-icon size="18">
            {{ lineHeight === opt.value ? 'mdi-check' : 'mdi-format-line-spacing' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ opt.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { lineHeight, setLineHeight, type LineHeightChoice } from '../utils/lineHeight'

interface Option {
  label: string
  value: LineHeightChoice
}

const options: Option[] = [
  { label: 'Tight (1.25)', value: 'tight' },
  { label: 'Normal (1.5)', value: 'normal' },
  { label: 'Relaxed (1.75)', value: 'relaxed' },
  { label: 'Loose (2.0)', value: 'loose' },
]

const tooltip = computed(() => `Line height: ${lineHeight.value}`)
</script>
