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
        title="Base64 encode/decode"
        size="large"
      >
        <v-icon size="22">mdi-code-braces-box</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-btn-toggle v-model="mode" mandatory density="compact" class="mb-2" divided>
        <v-btn value="encode" size="small">Encode</v-btn>
        <v-btn value="decode" size="small">Decode</v-btn>
      </v-btn-toggle>

      <v-textarea
        v-model="input"
        :label="mode === 'encode' ? 'Text to encode' : 'Base64 to decode'"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />

      <div class="b64-out mb-2">
        <div v-if="error" class="text-error text-body-2">{{ error }}</div>
        <div v-else class="b64-out__value">{{ output || '—' }}</div>
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
const notify = useNotificationStore()

const error = ref('')

const output = computed(() => {
  error.value = ''
  const v = input.value
  if (!v) return ''
  try {
    if (mode.value === 'encode') {
      const bytes = new TextEncoder().encode(v)
      let bin = ''
      for (const b of bytes) bin += String.fromCharCode(b)
      return btoa(bin)
    }
    const bin = atob(v.trim())
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new TextDecoder().decode(bytes)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid input'
    return ''
  }
})

async function copy() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: `${mode.value === 'encode' ? 'Encoded' : 'Decoded'} value copied`,
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.b64-out {
  min-height: 60px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.b64-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
