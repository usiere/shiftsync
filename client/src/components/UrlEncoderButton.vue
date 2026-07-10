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
        title="URL encode / decode"
        size="large"
      >
        <v-icon size="22">mdi-link-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-btn-toggle v-model="mode" mandatory density="compact" class="mb-2" divided>
        <v-btn value="encode" size="small">Encode</v-btn>
        <v-btn value="decode" size="small">Decode</v-btn>
        <v-btn value="component" size="small">Component</v-btn>
      </v-btn-toggle>

      <v-textarea
        v-model="input"
        :label="mode === 'decode' ? 'Percent-encoded input' : 'Text to encode'"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />

      <div class="url-out mb-2">
        <div v-if="error" class="text-error text-body-2">{{ error }}</div>
        <div v-else class="url-out__value">{{ output || '—' }}</div>
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
const mode = ref<'encode' | 'decode' | 'component'>('encode')
const input = ref('')
const error = ref('')
const notify = useNotificationStore()

const output = computed(() => {
  error.value = ''
  const v = input.value
  if (!v) return ''
  try {
    if (mode.value === 'encode') return encodeURI(v)
    if (mode.value === 'component') return encodeURIComponent(v)
    return decodeURIComponent(v)
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
      title: 'URL text copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.url-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.url-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
