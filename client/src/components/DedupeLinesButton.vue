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
        title="Deduplicate lines"
        size="large"
      >
        <v-icon size="22">mdi-set-none</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-textarea
        v-model="input"
        label="Lines"
        density="compact"
        variant="outlined"
        rows="4"
        hide-details
        class="mb-2"
      />
      <div class="d-flex align-center gap-8 mb-2">
        <v-checkbox v-model="caseSensitive" density="compact" hide-details label="Case-sensitive" />
        <v-checkbox v-model="trim" density="compact" hide-details label="Trim whitespace" />
        <v-checkbox v-model="dropBlank" density="compact" hide-details label="Drop empty" />
      </div>
      <div class="dedupe-out mb-2">
        <pre v-if="output">{{ output }}</pre>
        <div v-else class="text-caption text-medium-emphasis">Enter lines above.</div>
      </div>
      <div class="d-flex align-center">
        <span class="text-caption text-medium-emphasis flex-grow-1">
          {{ removed }} duplicate line{{ removed === 1 ? '' : 's' }} removed
        </span>
        <v-btn size="small" variant="text" :disabled="!output" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const input = ref('')
const caseSensitive = ref(false)
const trim = ref(true)
const dropBlank = ref(false)
const notify = useNotificationStore()

interface Result {
  lines: string[]
  removed: number
}

const result = computed<Result>(() => {
  if (!input.value) return { lines: [], removed: 0 }
  const src = input.value.split('\n')
  const seen = new Set<string>()
  const out: string[] = []
  let removed = 0
  for (const raw of src) {
    const line = trim.value ? raw.trim() : raw
    if (dropBlank.value && !line) { removed++; continue }
    const key = caseSensitive.value ? line : line.toLowerCase()
    if (seen.has(key)) { removed++; continue }
    seen.add(key)
    out.push(line)
  }
  return { lines: out, removed }
})

const output = computed(() => result.value.lines.join('\n'))
const removed = computed(() => result.value.removed)

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Deduped lines copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.dedupe-out {
  max-height: 200px;
  overflow: auto;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.dedupe-out pre {
  margin: 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-word;
}

.gap-8 {
  gap: 8px;
}
</style>
