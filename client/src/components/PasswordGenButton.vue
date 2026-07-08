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
        title="Generate a secure password"
        size="large"
      >
        <v-icon size="22">mdi-key-variant</v-icon>
      </v-btn>
    </template>

    <v-card min-width="300" class="pa-3">
      <div class="d-flex align-center gap-8 mb-3">
        <div class="pw-display flex-grow-1" :title="value">
          {{ value }}
        </div>
        <v-btn size="small" variant="text" title="Regenerate" @click="generate">
          <v-icon size="18">mdi-refresh</v-icon>
        </v-btn>
        <v-btn size="small" variant="text" title="Copy" @click="copy">
          <v-icon size="18">mdi-content-copy</v-icon>
        </v-btn>
      </div>

      <div class="d-flex align-center gap-8 mb-2">
        <span class="text-caption text-medium-emphasis">Length: {{ length }}</span>
        <v-slider
          v-model="length"
          :min="8"
          :max="48"
          :step="1"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
      </div>

      <div class="pw-flags">
        <v-checkbox v-model="useLower" density="compact" hide-details label="a-z" />
        <v-checkbox v-model="useUpper" density="compact" hide-details label="A-Z" />
        <v-checkbox v-model="useDigits" density="compact" hide-details label="0-9" />
        <v-checkbox v-model="useSymbols" density="compact" hide-details label="!@#" />
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const length = ref(16)
const useLower = ref(true)
const useUpper = ref(true)
const useDigits = ref(true)
const useSymbols = ref(true)
const value = ref('')
const notify = useNotificationStore()

const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>/?'

function generate() {
  let alphabet = ''
  if (useLower.value) alphabet += LOWER
  if (useUpper.value) alphabet += UPPER
  if (useDigits.value) alphabet += DIGITS
  if (useSymbols.value) alphabet += SYMBOLS
  if (!alphabet) {
    value.value = ''
    return
  }
  const bytes = new Uint32Array(length.value)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length.value; i++) {
    out += alphabet[bytes[i] % alphabet.length]
  }
  value.value = out
}

watch(
  [length, useLower, useUpper, useDigits, useSymbols, open],
  ([, , , , , openNow]) => {
    if (openNow) generate()
  },
  { immediate: true },
)

async function copy() {
  if (!value.value) return
  try {
    await navigator.clipboard.writeText(value.value)
    notify.showToast({
      type: 'success',
      title: 'Password copied',
      message: 'The clipboard now holds your new password.',
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.pw-display {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
  word-break: break-all;
}

.pw-flags {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}

.gap-8 {
  gap: 8px;
}
</style>
