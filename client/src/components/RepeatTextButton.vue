<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Repeat text"
        size="large"
      >
        <v-icon size="22">mdi-repeat</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Repeat text</div>
      <v-text-field
        v-model="text"
        label="Text"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
      />
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model.number="times"
          type="number"
          label="Times"
          density="compact"
          variant="outlined"
          hide-details
          min="1"
          max="500"
        />
        <v-text-field
          v-model="separator"
          label="Separator"
          density="compact"
          variant="outlined"
          hide-details
        />
      </div>
      <v-checkbox v-model="newlines" label="Newline between" density="compact" hide-details class="mb-2" />
      <div class="rt-out">
        <div class="text-caption text-medium-emphasis mb-1">
          {{ output.length }} chars
        </div>
        <div class="rt-preview">{{ preview }}</div>
      </div>
      <v-btn size="small" variant="outlined" :disabled="!output" @click="copy" class="mt-2">
        <v-icon start size="16">mdi-content-copy</v-icon>
        {{ copied ? 'Copied' : 'Copy' }}
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const text = ref('')
const times = ref<number>(5)
const separator = ref<string>('')
const newlines = ref<boolean>(false)
const copied = ref<boolean>(false)

const output = computed(() => {
  const n = Math.max(0, Math.min(500, Math.floor(Number(times.value) || 0)))
  if (!text.value || n === 0) return ''
  const sep = newlines.value ? '\n' : separator.value
  return Array.from({ length: n }, () => text.value).join(sep)
})

const preview = computed(() =>
  output.value.length > 200 ? output.value.slice(0, 200) + '…' : output.value,
)

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 1500)
  } catch { /* ignore */ }
}
</script>

<style scoped>
.gap-8 { gap: 8px; }

.rt-out {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
}

.rt-preview {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #1E40AF;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  overflow-y: auto;
}
</style>
