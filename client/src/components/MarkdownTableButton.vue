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
        title="Markdown table generator"
        size="large"
      >
        <v-icon size="22">mdi-table-large-plus</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model.number="rows"
          type="number"
          label="Rows"
          density="compact"
          variant="outlined"
          hide-details
          min="1"
          max="20"
        />
        <v-text-field
          v-model.number="cols"
          type="number"
          label="Cols"
          density="compact"
          variant="outlined"
          hide-details
          min="1"
          max="10"
        />
        <v-select
          v-model="align"
          :items="[
            { title: 'Left', value: 'left' },
            { title: 'Center', value: 'center' },
            { title: 'Right', value: 'right' },
          ]"
          label="Align"
          density="compact"
          variant="outlined"
          hide-details
        />
      </div>
      <div class="md-out mb-2">
        <pre>{{ table }}</pre>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" @click="copy">
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
const rows = ref(3)
const cols = ref(3)
const align = ref<'left' | 'center' | 'right'>('left')
const notify = useNotificationStore()

const table = computed(() => {
  const c = Math.max(1, Math.min(10, cols.value || 1))
  const r = Math.max(1, Math.min(20, rows.value || 1))
  const header = Array.from({ length: c }, (_, i) => `Header ${i + 1}`)
  const alignRow = Array.from({ length: c }, () => {
    if (align.value === 'center') return ':---:'
    if (align.value === 'right') return '---:'
    return ':---'
  })
  const body = Array.from({ length: r }, (_, r) =>
    Array.from({ length: c }, (_, j) => `Cell ${r + 1}-${j + 1}`),
  )
  const line = (cells: string[]) => `| ${cells.join(' | ')} |`
  return [line(header), line(alignRow), ...body.map(line)].join('\n')
})

async function copy() {
  try {
    await navigator.clipboard.writeText(table.value)
    notify.showToast({
      type: 'success',
      title: 'Table copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.md-out {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
  max-height: 200px;
  overflow: auto;
}

.md-out pre {
  margin: 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  white-space: pre;
}

.gap-8 {
  gap: 8px;
}
</style>
