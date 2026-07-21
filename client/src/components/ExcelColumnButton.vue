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
        title="Excel column converter"
        size="large"
      >
        <v-icon size="22">mdi-microsoft-excel</v-icon>
      </v-btn>
    </template>

    <v-card min-width="280" class="pa-3">
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model="num"
          type="number"
          label="Number"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="fromNum"
        />
        <v-text-field
          v-model="letters"
          label="Letters"
          density="compact"
          variant="outlined"
          hide-details
          @update:model-value="fromLetters"
        />
      </div>
      <div v-if="error" class="text-error text-caption">{{ error }}</div>
      <div v-else class="text-caption text-medium-emphasis">
        1 → A · 26 → Z · 27 → AA · 702 → ZZ · 703 → AAA
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
const num = ref('1')
const letters = ref('A')
const error = ref('')

function toLetters(n: number): string {
  let out = ''
  let value = n
  while (value > 0) {
    value--
    out = String.fromCharCode(65 + (value % 26)) + out
    value = Math.floor(value / 26)
  }
  return out
}

function toNumber(s: string): number {
  let value = 0
  for (const ch of s.toUpperCase()) {
    if (ch < 'A' || ch > 'Z') throw new Error('Letters A–Z only')
    value = value * 26 + (ch.charCodeAt(0) - 64)
  }
  return value
}

function fromNum(raw: string) {
  error.value = ''
  num.value = raw
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n) || n <= 0) {
    error.value = 'Must be a positive integer'
    letters.value = ''
    return
  }
  letters.value = toLetters(n)
}

function fromLetters(raw: string) {
  error.value = ''
  letters.value = raw
  if (!raw) { num.value = ''; return }
  try {
    num.value = String(toNumber(raw))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invalid letters'
    num.value = ''
  }
}
</script>

<style scoped>
.gap-8 {
  gap: 8px;
}
</style>
