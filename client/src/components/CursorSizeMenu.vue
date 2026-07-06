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
        <v-icon size="22" :color="cursorSize !== 'normal' ? 'primary' : undefined">
          mdi-cursor-default-outline
        </v-icon>
      </v-btn>
    </template>

    <v-list density="compact" min-width="200">
      <v-list-subheader>Cursor size</v-list-subheader>
      <v-list-item
        v-for="opt in options"
        :key="opt.value"
        :active="cursorSize === opt.value"
        @click="setCursorSize(opt.value)"
      >
        <template v-slot:prepend>
          <v-icon size="18">
            {{ cursorSize === opt.value ? 'mdi-check' : 'mdi-cursor-default' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ opt.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cursorSize, setCursorSize, type CursorSize } from '../utils/cursorSize'

interface Option {
  label: string
  value: CursorSize
}

const options: Option[] = [
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
  { label: 'Extra large', value: 'xl' },
]

const tooltip = computed(() => `Cursor size: ${cursorSize.value}`)
</script>
