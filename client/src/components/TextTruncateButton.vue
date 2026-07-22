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
        title="Text truncator"
        size="large"
      >
        <v-icon size="22">mdi-format-text-wrapping-clip</v-icon>
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
      <div class="d-flex gap-8 mb-2">
        <v-text-field
          v-model.number="limit"
          type="number"
          label="Max chars"
          density="compact"
          variant="outlined"
          hide-details
          min="1"
        />
        <v-text-field
          v-model="ellipsis"
          label="Suffix"
          density="compact"
          variant="outlined"
          hide-details
        />
        <v-checkbox v-model="wholeWord" density="compact" hide-details label="Whole word" />
      </div>
      <div class="tr-out mb-2">
        <div class="tr-out__value">{{ output || '—' }}</div>
      </div>
      <div class="d-flex align-center">
        <span class="text-caption text-medium-emphasis flex-grow-1">
          {{ output.length }} / {{ input.length }} chars
        </span>
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
const limit = ref(60)
const ellipsis = ref('…')
const wholeWord = ref(true)
const notify = useNotificationStore()

const output = computed(() => {
  const max = Math.max(1, limit.value || 1)
  const text = input.value
  if (text.length <= max) return text
  let cut = text.slice(0, max)
  if (wholeWord.value) {
    const lastSpace = cut.lastIndexOf(' ')
    if (lastSpace > 0) cut = cut.slice(0, lastSpace)
  }
  return cut.replace(/[\s.,;:!?]+$/, '') + ellipsis.value
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Truncated text copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.tr-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.tr-out__value {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  word-break: break-word;
}

.gap-8 {
  gap: 8px;
}
</style>
