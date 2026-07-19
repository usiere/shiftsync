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
        title="Zalgo (glitch) text"
        size="large"
      >
        <v-icon size="22">mdi-lightning-bolt-outline</v-icon>
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
        <span class="text-caption text-medium-emphasis" style="width: 60px">Chaos</span>
        <v-slider
          v-model="intensity"
          :min="1"
          :max="20"
          :step="1"
          hide-details
          density="compact"
          class="flex-grow-1"
        />
        <span class="text-caption" style="width: 28px; text-align: right">{{ intensity }}</span>
      </div>
      <div class="zalgo-out mb-2">
        <div class="zalgo-out__value">{{ output || '—' }}</div>
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
const intensity = ref(6)
const notify = useNotificationStore()

const MARKS: string[] = []
for (let i = 0x0300; i <= 0x036F; i++) MARKS.push(String.fromCharCode(i))

function corrupt(text: string, level: number): string {
  const bytes = new Uint32Array(text.length * level)
  crypto.getRandomValues(bytes)
  let cursor = 0
  let out = ''
  for (const ch of text) {
    out += ch
    if (/\s/.test(ch)) continue
    for (let i = 0; i < level; i++) {
      out += MARKS[bytes[cursor++] % MARKS.length]
    }
  }
  return out
}

const output = computed(() => (input.value ? corrupt(input.value, intensity.value) : ''))

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value)
    notify.showToast({
      type: 'success',
      title: 'Zalgo copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.zalgo-out {
  min-height: 60px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
  overflow: hidden;
}

.zalgo-out__value {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
}

.gap-8 {
  gap: 8px;
}
</style>
