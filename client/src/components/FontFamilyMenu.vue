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
        <v-icon size="22" :color="fontFamily !== 'sans' ? 'primary' : undefined">
          {{ icon }}
        </v-icon>
      </v-btn>
    </template>

    <v-list density="compact" min-width="200">
      <v-list-subheader>App font family</v-list-subheader>
      <v-list-item
        v-for="opt in options"
        :key="opt.value"
        :active="fontFamily === opt.value"
        @click="setFontFamily(opt.value)"
      >
        <template v-slot:prepend>
          <v-icon size="18">
            {{ fontFamily === opt.value ? 'mdi-check' : opt.icon }}
          </v-icon>
        </template>
        <v-list-item-title :style="{ fontFamily: opt.preview }">
          {{ opt.label }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fontFamily, setFontFamily, type FontFamilyChoice } from '../utils/fontFamily'

interface Option {
  label: string
  value: FontFamilyChoice
  icon: string
  preview: string
}

const options: Option[] = [
  { label: 'Sans (default)', value: 'sans', icon: 'mdi-format-font', preview: "'DM Sans', sans-serif" },
  { label: 'Serif', value: 'serif', icon: 'mdi-format-font', preview: "Georgia, serif" },
  { label: 'Monospace', value: 'mono', icon: 'mdi-code-tags', preview: "'DM Mono', monospace" },
]

const icon = computed(() => {
  switch (fontFamily.value) {
    case 'serif': return 'mdi-format-font'
    case 'mono': return 'mdi-code-tags'
    default: return 'mdi-format-text'
  }
})

const tooltip = computed(() => `Font family: ${fontFamily.value}`)
</script>
