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
        title="JSON formatter"
        size="large"
      >
        <v-icon size="22">mdi-code-json</v-icon>
      </v-btn>
    </template>

    <v-card min-width="360" class="pa-3">
      <v-textarea
        v-model="input"
        label="Paste JSON"
        density="compact"
        variant="outlined"
        rows="4"
        hide-details
        class="mb-2"
      />
      <div class="d-flex gap-8 mb-2">
        <v-btn size="small" variant="tonal" @click="format(2)">Pretty (2)</v-btn>
        <v-btn size="small" variant="tonal" @click="format(4)">Pretty (4)</v-btn>
        <v-btn size="small" variant="tonal" @click="minify">Minify</v-btn>
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!output" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy
        </v-btn>
      </div>
      <div class="json-out">
        <div v-if="error" class="text-error text-body-2">{{ error }}</div>
        <pre v-else-if="output" class="json-out__pre">{{ output }}</pre>
        <div v-else class="text-medium-emphasis text-caption">Choose a format above.</div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const input = ref('')
const output = ref('')
const error = ref('')
const notify = useNotificationStore()

function format(indent: number) {
  error.value = ''
  if (!input.value.trim()) {
    output.value = ''
    return
  }
  try {
    output.value = JSON.stringify(JSON.parse(input.value), null, indent)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid JSON'
    output.value = ''
  }
}

function minify() {
  error.value = ''
  if (!input.value.trim()) {
    output.value = ''
    return
  }
  try {
    output.value = JSON.stringify(JSON.parse(input.value))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid JSON'
    output.value = ''
  }
}

async function copy() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
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
.json-out {
  max-height: 220px;
  overflow: auto;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.json-out__pre {
  margin: 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  line-height: 1.4;
  white-space: pre;
}

.gap-8 {
  gap: 8px;
}
</style>
