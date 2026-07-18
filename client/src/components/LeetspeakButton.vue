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
        title="Leetspeak converter"
        size="large"
      >
        <v-icon size="22">mdi-console-line</v-icon>
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
      <div class="d-flex align-center gap-8 mb-2">
        <v-btn-toggle v-model="level" mandatory density="compact" divided>
          <v-btn value="light" size="small">Light</v-btn>
          <v-btn value="medium" size="small">Medium</v-btn>
          <v-btn value="heavy" size="small">Heavy</v-btn>
        </v-btn-toggle>
      </div>
      <div class="leet-out mb-2">
        <div class="leet-out__value">{{ output || '—' }}</div>
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
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const input = ref('')
const level = ref<'light' | 'medium' | 'heavy'>('medium')
const notify = useNotificationStore()

const LIGHT: Record<string, string> = { a: '4', e: '3', i: '1', o: '0' }
const MEDIUM: Record<string, string> = { ...LIGHT, s: '5', t: '7', b: '8', g: '9' }
const HEAVY: Record<string, string> = { ...MEDIUM, l: '|', c: '(', d: '|)', h: '#', k: '|<', z: '2' }

const output = computed(() => {
  const map = level.value === 'light' ? LIGHT : level.value === 'medium' ? MEDIUM : HEAVY
  return input.value
    .split('')
    .map((ch) => {
      const lower = ch.toLowerCase()
      return map[lower] ?? ch
    })
    .join('')
})

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Leet text copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.leet-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.leet-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}

.gap-8 {
  gap: 8px;
}
</style>
