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
        title="CSV table viewer"
        size="large"
      >
        <v-icon size="22">mdi-table</v-icon>
      </v-btn>
    </template>

    <v-card min-width="440" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-textarea
          v-model="input"
          label="Paste CSV"
          density="compact"
          variant="outlined"
          rows="4"
          hide-details
          class="flex-grow-1"
        />
        <v-select
          v-model="delimiter"
          :items="[
            { title: 'Comma ,', value: ',' },
            { title: 'Tab \\t', value: '\t' },
            { title: 'Semicolon ;', value: ';' },
            { title: 'Pipe |', value: '|' },
          ]"
          label="Delimiter"
          density="compact"
          variant="outlined"
          hide-details
          class="csv-delim"
        />
      </div>

      <div class="csv-out">
        <div v-if="!rows.length" class="text-caption text-medium-emphasis pa-2">
          Paste CSV above to preview.
        </div>
        <table v-else class="csv-table">
          <thead v-if="header">
            <tr>
              <th v-for="(cell, i) in rows[0]" :key="i">{{ cell }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in dataRows" :key="i">
              <td v-for="(cell, j) in row" :key="j">{{ cell }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex align-center mt-2">
        <v-checkbox v-model="header" density="compact" hide-details label="First row is header" />
        <v-spacer />
        <span v-if="rows.length" class="text-caption text-medium-emphasis">
          {{ dataRows.length }} row{{ dataRows.length === 1 ? '' : 's' }}
          × {{ rows[0]?.length ?? 0 }} col{{ (rows[0]?.length ?? 0) === 1 ? '' : 's' }}
        </span>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const input = ref('')
const delimiter = ref(',')
const header = ref(true)

function parseCsv(text: string, delim: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') { quoted = true; continue }
    if (ch === delim) {
      row.push(field); field = ''; continue
    }
    if (ch === '\n') {
      row.push(field); rows.push(row); row = []; field = ''; continue
    }
    if (ch === '\r') continue
    field += ch
  }
  if (field !== '' || row.length) {
    row.push(field); rows.push(row)
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ''))
}

const rows = computed(() => (input.value ? parseCsv(input.value, delimiter.value) : []))
const dataRows = computed(() => (header.value ? rows.value.slice(1) : rows.value))
</script>

<style scoped>
.csv-delim {
  flex: 0 0 130px;
  max-width: 130px;
}

.csv-out {
  max-height: 240px;
  overflow: auto;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.csv-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
}

.csv-table th,
.csv-table td {
  padding: 4px 8px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  text-align: left;
  vertical-align: top;
  white-space: nowrap;
}

.csv-table th {
  background: rgba(148, 163, 184, 0.15);
  font-weight: 600;
}

.gap-8 {
  gap: 8px;
}
</style>
