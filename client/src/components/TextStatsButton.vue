<template>
  <v-menu
    v-model="open"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Text statistics"
        size="large"
      >
        <v-icon size="22">mdi-format-list-numbered</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <v-textarea
        v-model="input"
        placeholder="Paste text to count"
        density="compact"
        variant="outlined"
        rows="4"
        hide-details
        class="mb-3"
      />

      <div class="ts-grid">
        <div class="ts-cell">
          <div class="ts-value">{{ stats.chars }}</div>
          <div class="ts-label">Characters</div>
        </div>
        <div class="ts-cell">
          <div class="ts-value">{{ stats.charsNoSpaces }}</div>
          <div class="ts-label">No spaces</div>
        </div>
        <div class="ts-cell">
          <div class="ts-value">{{ stats.words }}</div>
          <div class="ts-label">Words</div>
        </div>
        <div class="ts-cell">
          <div class="ts-value">{{ stats.lines }}</div>
          <div class="ts-label">Lines</div>
        </div>
        <div class="ts-cell">
          <div class="ts-value">{{ stats.sentences }}</div>
          <div class="ts-label">Sentences</div>
        </div>
        <div class="ts-cell">
          <div class="ts-value">{{ stats.readMin }}m</div>
          <div class="ts-label">Reading time</div>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const input = ref('')

const stats = computed(() => {
  const text = input.value
  const chars = text.length
  const charsNoSpaces = text.replace(/\s/g, '').length
  const words = text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length
  const lines = text.length === 0 ? 0 : text.split(/\n/).length
  const sentences = text.trim().length === 0
    ? 0
    : (text.match(/[.!?]+(?=\s|$)/g)?.length ?? 0) || (words > 0 ? 1 : 0)
  const readMin = Math.max(0, Math.ceil(words / 200))
  return { chars, charsNoSpaces, words, lines, sentences, readMin }
})
</script>

<style scoped>
.ts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.ts-cell {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  text-align: center;
}

.ts-value {
  font-family: 'DM Mono', monospace;
  font-variant-numeric: tabular-nums;
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.ts-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94A3B8;
  margin-top: 2px;
}
</style>
