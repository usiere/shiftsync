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
        title="HTML entity encoder"
        size="large"
      >
        <v-icon size="22">mdi-code-tags-check</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <v-btn-toggle v-model="mode" mandatory density="compact" class="mb-2" divided>
        <v-btn value="encode" size="small">Encode</v-btn>
        <v-btn value="decode" size="small">Decode</v-btn>
      </v-btn-toggle>

      <v-textarea
        v-model="input"
        :label="mode === 'encode' ? 'Text' : 'HTML entities'"
        density="compact"
        variant="outlined"
        rows="3"
        hide-details
        class="mb-2"
      />

      <div class="html-out mb-2">
        <div v-if="output" class="html-out__value">{{ output }}</div>
        <div v-else class="text-caption text-medium-emphasis">Enter text above.</div>
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
const mode = ref<'encode' | 'decode'>('encode')
const input = ref('')
const notify = useNotificationStore()

const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  nbsp: ' ', copy: '©', reg: '®', trade: '™',
  hellip: '…', mdash: '—', ndash: '–', laquo: '«', raquo: '»',
}

function encode(text: string): string {
  return text.replace(/[&<>"' -￿]/g, (ch) => {
    if (ch === '&') return '&amp;'
    if (ch === '<') return '&lt;'
    if (ch === '>') return '&gt;'
    if (ch === '"') return '&quot;'
    if (ch === "'") return '&#39;'
    const code = ch.charCodeAt(0)
    if (code < 0x100 && code !== 0x00A0) return ch
    return `&#${code};`
  })
}

function decode(text: string): string {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED[name] ?? m)
}

const output = computed(() => {
  if (!input.value) return ''
  return mode.value === 'encode' ? encode(input.value) : decode(input.value)
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
.html-out {
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.12);
}

.html-out__value {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
