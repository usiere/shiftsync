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
        title="Text reverser"
        size="large"
      >
        <v-icon size="22">mdi-format-textdirection-r-to-l</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <v-textarea
        v-model="input"
        label="Text"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />
      <v-btn-toggle v-model="mode" mandatory density="compact" class="mb-2" divided>
        <v-btn value="chars" size="small">Characters</v-btn>
        <v-btn value="words" size="small">Words</v-btn>
        <v-btn value="lines" size="small">Lines</v-btn>
      </v-btn-toggle>

      <div class="rev-out mb-2">
        <div class="rev-out__value">{{ output || '—' }}</div>
      </div>

      <div class="d-flex align-center">
        <span v-if="input" class="text-caption text-medium-emphasis">
          {{ palindromeLabel }}
        </span>
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
const mode = ref<'chars' | 'words' | 'lines'>('chars')
const notify = useNotificationStore()

const output = computed(() => {
  if (!input.value) return ''
  if (mode.value === 'chars') return Array.from(input.value).reverse().join('')
  if (mode.value === 'words') return input.value.split(/\s+/).reverse().join(' ')
  return input.value.split('\n').reverse().join('\n')
})

const palindromeLabel = computed(() => {
  const normalized = input.value.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!normalized) return ''
  const reversed = Array.from(normalized).reverse().join('')
  return normalized === reversed ? 'Palindrome ✓' : 'Not a palindrome'
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Reversed text copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.rev-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.rev-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
