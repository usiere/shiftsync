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
        title="Text ↔ binary converter"
        size="large"
      >
        <v-icon size="22">mdi-numeric-2-box-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-btn-toggle v-model="mode" mandatory density="compact" class="mb-2" divided>
        <v-btn value="encode" size="small">Text → binary</v-btn>
        <v-btn value="decode" size="small">Binary → text</v-btn>
      </v-btn-toggle>
      <v-textarea
        v-model="input"
        :label="mode === 'encode' ? 'Text' : 'Binary (space-separated)'"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />
      <div class="bin-out mb-2">
        <div v-if="error" class="text-error text-body-2">{{ error }}</div>
        <div v-else class="bin-out__value">{{ output || '—' }}</div>
      </div>
      <div class="d-flex">
        <v-spacer />
        <v-btn size="small" variant="text" :disabled="!output || !!error" @click="copy">
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
const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')
const error = ref('')
const notify = useNotificationStore()

function encode(text: string): string {
  const bytes = new TextEncoder().encode(text)
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ')
}

function decode(text: string): string {
  const parts = text.trim().split(/\s+/).filter(Boolean)
  const bytes = new Uint8Array(parts.length)
  for (let i = 0; i < parts.length; i++) {
    if (!/^[01]{1,8}$/.test(parts[i])) throw new Error(`Invalid byte: ${parts[i]}`)
    bytes[i] = parseInt(parts[i], 2)
  }
  return new TextDecoder().decode(bytes)
}

const output = computed(() => {
  error.value = ''
  if (!input.value.trim()) return ''
  try {
    return mode.value === 'encode' ? encode(input.value) : decode(input.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid input'
    return ''
  }
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Binary copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.bin-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.bin-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
