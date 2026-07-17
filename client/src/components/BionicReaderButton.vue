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
        title="Bionic reader"
        size="large"
      >
        <v-icon size="22">mdi-book-open-page-variant-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="360" class="pa-3">
      <v-textarea
        v-model="input"
        label="Text"
        density="compact"
        variant="outlined"
        rows="4"
        hide-details
        class="mb-2"
      />
      <div class="d-flex align-center gap-8 mb-2">
        <span class="text-caption text-medium-emphasis" style="width: 100px">
          Bold fraction
        </span>
        <v-slider
          v-model="ratio"
          :min="0.3"
          :max="0.7"
          :step="0.05"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <span class="text-caption" style="width: 40px; text-align: right">
          {{ Math.round(ratio * 100) }}%
        </span>
      </div>
      <div class="bionic-out" v-html="rendered" />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const input = ref(
  'Bionic reading emphasizes the first letters of each word to help the eye anchor and glide through text more quickly.',
)
const ratio = ref(0.5)

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const rendered = computed(() => {
  const words = input.value.split(/(\s+)/)
  return words
    .map((w) => {
      if (/^\s+$/.test(w) || w === '') return escapeHtml(w)
      const boldLen = Math.max(1, Math.ceil(w.length * ratio.value))
      const head = escapeHtml(w.slice(0, boldLen))
      const tail = escapeHtml(w.slice(boldLen))
      return `<strong>${head}</strong>${tail}`
    })
    .join('')
})
</script>

<style scoped>
.bionic-out {
  padding: 10px 12px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
}

.bionic-out :deep(strong) {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.gap-8 {
  gap: 8px;
}
</style>
