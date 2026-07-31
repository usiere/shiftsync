<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Character code lookup"
        size="large"
      >
        <v-icon size="22">mdi-alphabetical-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Character Codes</div>
      <v-text-field
        v-model="text"
        label="Text"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div v-if="!text" class="text-caption text-medium-emphasis text-center">Enter text to see codes</div>
      <div v-else class="av-list">
        <div v-for="(ch, i) in chars" :key="i" class="av-row">
          <span class="av-char">{{ ch.display }}</span>
          <span class="av-code">dec {{ ch.code }}</span>
          <span class="av-code">hex 0x{{ ch.hex }}</span>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const text = ref<string>('Hi!')

const chars = computed(() => {
  return Array.from(text.value).slice(0, 200).map(ch => {
    const code = ch.codePointAt(0) || 0
    return {
      display: ch === ' ' ? '␣' : ch,
      code,
      hex: code.toString(16).toUpperCase().padStart(2, '0'),
    }
  })
})
</script>

<style scoped>
.av-list {
  max-height: 160px;
  overflow-y: auto;
  padding: 6px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.av-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 4px;
  background: white;
}

.av-char {
  min-width: 22px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #0F172A;
}

.av-code {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #475569;
  background: #F1F5F9;
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
