<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Reading time estimator"
        size="large"
      >
        <v-icon size="22">mdi-book-clock-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Reading time</div>
      <v-textarea
        v-model="text"
        label="Paste text"
        density="compact"
        variant="outlined"
        hide-details
        rows="4"
        no-resize
        class="mb-2"
      />
      <v-slider
        v-model="wpm"
        :min="100"
        :max="500"
        :step="10"
        :label="`${wpm} wpm`"
        hide-details
        class="mb-2"
      />
      <div class="rt-row">
        <span class="text-caption text-medium-emphasis">Words</span>
        <span class="rt-value">{{ words }}</span>
      </div>
      <div class="rt-row">
        <span class="text-caption text-medium-emphasis">Reading time</span>
        <span class="rt-value">{{ readingLabel }}</span>
      </div>
      <div class="rt-row">
        <span class="text-caption text-medium-emphasis">Speaking time</span>
        <span class="rt-value">{{ speakingLabel }}</span>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const text = ref('')
const wpm = ref<number>(230)

const words = computed(() => {
  const trimmed = text.value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
})

function humanize(minutes: number): string {
  if (minutes < 1) {
    const secs = Math.max(1, Math.round(minutes * 60))
    return `${secs} sec`
  }
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  return s ? `${m} min ${s} sec` : `${m} min`
}

const readingLabel = computed(() => (words.value ? humanize(words.value / wpm.value) : '—'))
const speakingLabel = computed(() => (words.value ? humanize(words.value / 130) : '—'))
</script>

<style scoped>
.rt-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
}

.rt-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
  font-size: 13px;
}
</style>
