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
        title="JSON → CSV"
        size="large"
      >
        <v-icon size="22">mdi-file-arrow-left-right-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="380" class="pa-3">
      <v-textarea
        v-model="input"
        label="JSON array"
        density="compact"
        variant="outlined"
        rows="4"
        hide-details
        placeholder='[{"a": 1, "b": 2}, {"a": 3, "b": 4}]'
        class="mb-2"
      />

      <div class="jc-out mb-2">
        <div v-if="error" class="text-error text-body-2">{{ error }}</div>
        <pre v-else-if="csv">{{ csv }}</pre>
        <div v-else class="text-caption text-medium-emphasis">Paste JSON above.</div>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!csv || !!error" @click="copy">
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
const notify = useNotificationStore()

function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

const error = ref('')

const csv = computed(() => {
  error.value = ''
  if (!input.value.trim()) return ''
  try {
    const parsed = JSON.parse(input.value)
    if (!Array.isArray(parsed)) throw new Error('Expected a JSON array at the top level')
    if (!parsed.length) return ''
    const cols = new Set<string>()
    for (const row of parsed) {
      if (row && typeof row === 'object' && !Array.isArray(row)) {
        for (const k of Object.keys(row)) cols.add(k)
      }
    }
    if (!cols.size) throw new Error('Array must contain objects')
    const header = Array.from(cols)
    const lines = [header.join(',')]
    for (const row of parsed) {
      lines.push(header.map((k) => escapeCell((row as Record<string, unknown>)[k])).join(','))
    }
    return lines.join('\n')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Parse failed'
    return ''
  }
})

async function copy() {
  try {
    await navigator.clipboard.writeText(csv.value)
    notify.showToast({
      type: 'success',
      title: 'CSV copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.jc-out {
  max-height: 220px;
  overflow: auto;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.jc-out pre {
  margin: 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  white-space: pre;
}
</style>
