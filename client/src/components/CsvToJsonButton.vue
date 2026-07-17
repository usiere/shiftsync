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
        title="CSV → JSON"
        size="large"
      >
        <v-icon size="22">mdi-file-swap-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="380" class="pa-3">
      <v-textarea
        v-model="input"
        label="CSV"
        density="compact"
        variant="outlined"
        rows="4"
        hide-details
        class="mb-2"
      />
      <div class="d-flex align-center gap-8 mb-2">
        <v-select
          v-model="delimiter"
          :items="[
            { title: 'Comma ,', value: ',' },
            { title: 'Tab \\t', value: '\t' },
            { title: 'Semicolon ;', value: ';' },
          ]"
          label="Delimiter"
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-checkbox v-model="firstRowHeader" density="compact" hide-details label="First row = header" />
      </div>

      <div class="cj-out mb-2">
        <div v-if="error" class="text-error text-body-2">{{ error }}</div>
        <pre v-else-if="json">{{ json }}</pre>
        <div v-else class="text-caption text-medium-emphasis">Paste CSV above.</div>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!json || !!error" @click="copy">
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
const delimiter = ref(',')
const firstRowHeader = ref(true)
const notify = useNotificationStore()

function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') quoted = false
      else field += ch
      continue
    }
    if (ch === '"') { quoted = true; continue }
    if (ch === delim) { row.push(field); field = ''; continue }
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue }
    if (ch === '\r') continue
    field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''))
}

const error = ref('')

const json = computed(() => {
  error.value = ''
  if (!input.value.trim()) return ''
  try {
    const rows = parseCsv(input.value, delimiter.value)
    if (!rows.length) return '[]'
    if (firstRowHeader.value) {
      const [header, ...body] = rows
      const objects = body.map((r) => {
        const obj: Record<string, string> = {}
        header.forEach((h, i) => { obj[h.trim()] = r[i] ?? '' })
        return obj
      })
      return JSON.stringify(objects, null, 2)
    }
    return JSON.stringify(rows, null, 2)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Parse failed'
    return ''
  }
})

async function copy() {
  try {
    await navigator.clipboard.writeText(json.value)
    notify.showToast({
      type: 'success',
      title: 'JSON copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.cj-out {
  max-height: 220px;
  overflow: auto;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.cj-out pre {
  margin: 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  white-space: pre;
}

.gap-8 {
  gap: 8px;
}
</style>
