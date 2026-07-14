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
        title="Word frequency counter"
        size="large"
      >
        <v-icon size="22">mdi-format-list-numbered-rtl</v-icon>
      </v-btn>
    </template>

    <v-card min-width="360" class="pa-3">
      <v-textarea
        v-model="input"
        label="Text to analyze"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />
      <div class="d-flex align-center gap-8 mb-2">
        <v-checkbox v-model="caseSensitive" density="compact" hide-details label="Case-sensitive" />
        <v-checkbox v-model="ignoreCommon" density="compact" hide-details label="Ignore stopwords" />
      </div>
      <div class="wf-list">
        <div v-if="!top.length" class="text-caption text-medium-emphasis pa-2">
          Paste text to see the top words.
        </div>
        <div v-for="entry in top" :key="entry.word" class="wf-row">
          <span class="wf-rank">{{ entry.rank }}</span>
          <code class="wf-word">{{ entry.word }}</code>
          <div class="wf-bar-track">
            <div class="wf-bar" :style="{ width: entry.pct + '%' }" />
          </div>
          <span class="wf-count">{{ entry.count }}</span>
        </div>
      </div>
      <div v-if="totalWords" class="text-caption text-medium-emphasis mt-2">
        {{ totalWords }} words · {{ uniqueWords }} unique
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const input = ref('')
const caseSensitive = ref(false)
const ignoreCommon = ref(true)

const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','of','to','in','on','at','for','with',
  'is','are','was','were','be','been','being','has','have','had','do','does','did',
  'this','that','these','those','it','its','as','by','from','up','so','not','no',
  'we','you','they','he','she','i','me','us','them','our','your','their',
])

interface Entry {
  rank: number
  word: string
  count: number
  pct: number
}

const words = computed(() => {
  const text = input.value
  if (!text) return [] as string[]
  const raw = text.match(/[\p{L}\p{N}'-]+/gu) ?? []
  const mapped = caseSensitive.value ? raw : raw.map((w) => w.toLowerCase())
  return ignoreCommon.value ? mapped.filter((w) => !STOPWORDS.has(w.toLowerCase())) : mapped
})

const counts = computed(() => {
  const map = new Map<string, number>()
  for (const w of words.value) {
    map.set(w, (map.get(w) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
})

const top = computed<Entry[]>(() => {
  const max = counts.value[0]?.[1] ?? 0
  return counts.value.slice(0, 12).map(([word, count], i) => ({
    rank: i + 1,
    word,
    count,
    pct: max ? (count / max) * 100 : 0,
  }))
})

const totalWords = computed(() => words.value.length)
const uniqueWords = computed(() => counts.value.length)
</script>

<style scoped>
.wf-list {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wf-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.wf-rank {
  width: 20px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #94A3B8;
}

.wf-word {
  width: 100px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wf-bar-track {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(148, 163, 184, 0.15);
  overflow: hidden;
}

.wf-bar {
  height: 100%;
  background: linear-gradient(90deg, #2563EB, #7C3AED);
}

.wf-count {
  width: 32px;
  text-align: right;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.gap-8 {
  gap: 8px;
}
</style>
