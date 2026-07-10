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
        title="Case converter"
        size="large"
      >
        <v-icon size="22">mdi-format-letter-case</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <v-textarea
        v-model="input"
        label="Text"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        placeholder="e.g. hello world example"
        class="mb-2"
      />
      <div class="cases">
        <div v-for="c in cases" :key="c.key" class="case-row">
          <div class="case-label">{{ c.label }}</div>
          <code class="case-value">{{ c.transform(input) || '—' }}</code>
          <v-btn size="x-small" variant="text" :disabled="!input" @click="copy(c.transform(input))">
            <v-icon size="14">mdi-content-copy</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const input = ref('')
const notify = useNotificationStore()

function words(s: string): string[] {
  return s
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-.]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

const cases = [
  { key: 'lower', label: 'lower case', transform: (s: string) => s.toLowerCase() },
  { key: 'upper', label: 'UPPER CASE', transform: (s: string) => s.toUpperCase() },
  {
    key: 'title',
    label: 'Title Case',
    transform: (s: string) =>
      words(s).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' '),
  },
  {
    key: 'camel',
    label: 'camelCase',
    transform: (s: string) => {
      const w = words(s).map((x) => x.toLowerCase())
      if (!w.length) return ''
      return w[0] + w.slice(1).map((x) => x[0].toUpperCase() + x.slice(1)).join('')
    },
  },
  {
    key: 'pascal',
    label: 'PascalCase',
    transform: (s: string) =>
      words(s).map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase()).join(''),
  },
  { key: 'snake', label: 'snake_case', transform: (s: string) => words(s).map((x) => x.toLowerCase()).join('_') },
  { key: 'kebab', label: 'kebab-case', transform: (s: string) => words(s).map((x) => x.toLowerCase()).join('-') },
  { key: 'const', label: 'CONSTANT_CASE', transform: (s: string) => words(s).map((x) => x.toUpperCase()).join('_') },
]

async function copy(text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    notify.showToast({
      type: 'success',
      title: 'Copied',
      message: text,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.cases {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 260px;
  overflow-y: auto;
}

.case-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.case-label {
  width: 110px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #94A3B8;
}

.case-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  word-break: break-all;
}
</style>
