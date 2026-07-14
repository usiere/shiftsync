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
        title="Sort lines"
        size="large"
      >
        <v-icon size="22">mdi-sort-alphabetical-ascending</v-icon>
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
        <v-btn-toggle v-model="order" mandatory density="compact" divided>
          <v-btn value="asc" size="small">A → Z</v-btn>
          <v-btn value="desc" size="small">Z → A</v-btn>
          <v-btn value="len" size="small">By length</v-btn>
          <v-btn value="reverse" size="small">Reverse</v-btn>
        </v-btn-toggle>
        <v-spacer />
        <v-checkbox v-model="caseSensitive" density="compact" hide-details label="Case" />
      </div>
      <div class="sort-out mb-2">
        <pre v-if="output">{{ output }}</pre>
        <div v-else class="text-caption text-medium-emphasis">Enter lines above.</div>
      </div>
      <div class="d-flex">
        <v-spacer />
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
const order = ref<'asc' | 'desc' | 'len' | 'reverse'>('asc')
const caseSensitive = ref(false)
const notify = useNotificationStore()

const output = computed(() => {
  if (!input.value) return ''
  const lines = input.value.split('\n')
  if (order.value === 'reverse') return lines.reverse().join('\n')
  const cmp = (a: string, b: string) => {
    if (order.value === 'len') return a.length - b.length
    const x = caseSensitive.value ? a : a.toLowerCase()
    const y = caseSensitive.value ? b : b.toLowerCase()
    return x.localeCompare(y)
  }
  const sorted = [...lines].sort(cmp)
  return (order.value === 'desc' ? sorted.reverse() : sorted).join('\n')
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Sorted lines copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.sort-out {
  max-height: 200px;
  overflow: auto;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.sort-out pre {
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
