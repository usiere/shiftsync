<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        :title="privacyBlurEnabled ? `Privacy blur (${privacyBlurAmount}px)` : 'Privacy blur'"
        size="large"
      >
        <v-icon size="22" :color="privacyBlurEnabled ? 'primary' : undefined">
          {{ privacyBlurEnabled ? 'mdi-blur' : 'mdi-blur-off' }}
        </v-icon>
      </v-btn>
    </template>

    <v-card min-width="240" class="pa-3">
      <v-checkbox
        :model-value="privacyBlurEnabled"
        @update:model-value="togglePrivacyBlur"
        density="compact"
        hide-details
        label="Blur page content"
        class="mb-2"
      />
      <div class="text-caption text-medium-emphasis mb-1">
        Blur: {{ privacyBlurAmount }}px
      </div>
      <v-slider
        v-model="privacyBlurAmount"
        :min="2"
        :max="20"
        :step="1"
        hide-details
        density="compact"
      />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import {
  privacyBlurAmount,
  privacyBlurEnabled,
  togglePrivacyBlur,
} from '../utils/privacyBlur'
</script>
