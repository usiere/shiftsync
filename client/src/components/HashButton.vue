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
        title="Cryptographic hash"
        size="large"
      >
        <v-icon size="22">mdi-fingerprint</v-icon>
      </v-btn>
    </template>

    <v-card min-width="360" class="pa-3">
      <v-select
        v-model="algo"
        :items="algos"
        label="Algorithm"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <v-textarea
        v-model="input"
        label="Input"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />
      <div class="hash-out mb-2">
        <div v-if="pending" class="text-caption text-medium-emphasis">Computing…</div>
        <div v-else-if="error" class="text-error text-body-2">{{ error }}</div>
        <div v-else-if="output" class="hash-out__value">{{ output }}</div>
        <div v-else class="text-medium-emphasis text-caption">Enter text to hash.</div>
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
import { ref, watch } from 'vue'
import { useNotificationStore } from '../stores/notifications'

type Algo = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

const open = ref(false)
const algo = ref<Algo>('SHA-256')
const input = ref('')
const output = ref('')
const error = ref('')
const pending = ref(false)
const notify = useNotificationStore()

const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] satisfies Algo[]

async function compute() {
  error.value = ''
  output.value = ''
  const text = input.value
  if (!text) return
  pending.value = true
  try {
    const bytes = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest(algo.value, bytes)
    output.value = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Hash failed'
  } finally {
    pending.value = false
  }
}

watch([input, algo, open], () => {
  if (open.value) void compute()
}, { immediate: true })

async function copy() {
  if (!output.value) return
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: `${algo.value} copied`,
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.hash-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.hash-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  word-break: break-all;
}
</style>
