<template>
  <v-menu offset-y :close-on-content-click="false">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon
        variant="text"
        class="me-2"
        title="Line ending converter"
        size="large"
      >
        <v-icon size="22">mdi-keyboard-return</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <div class="text-subtitle-2 mb-2 text-center">Line endings</div>
      <v-textarea
        v-model="text"
        label="Text"
        density="compact"
        variant="outlined"
        hide-details
        rows="4"
        no-resize
        class="mb-2"
      />
      <div class="le-row">
        <span class="text-caption text-medium-emphasis">Detected</span>
        <span class="le-value">{{ detected }}</span>
      </div>
      <div class="le-row">
        <span class="text-caption text-medium-emphasis">Line breaks</span>
        <span class="le-value">{{ breaks }}</span>
      </div>
      <div class="d-flex gap-8 mt-2">
        <v-btn size="small" variant="outlined" @click="convert('lf')">→ LF</v-btn>
        <v-btn size="small" variant="outlined" @click="convert('crlf')">→ CRLF</v-btn>
        <v-btn size="small" variant="outlined" @click="convert('cr')">→ CR</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const text = ref('')

const stats = computed(() => {
  const crlf = (text.value.match(/\r\n/g) || []).length
  const withoutCrlf = text.value.replace(/\r\n/g, '')
  const cr = (withoutCrlf.match(/\r/g) || []).length
  const lf = (withoutCrlf.match(/\n/g) || []).length
  return { crlf, cr, lf }
})

const detected = computed(() => {
  const { crlf, cr, lf } = stats.value
  if (crlf === 0 && cr === 0 && lf === 0) return 'None'
  const parts: string[] = []
  if (crlf) parts.push(`${crlf} CRLF`)
  if (lf) parts.push(`${lf} LF`)
  if (cr) parts.push(`${cr} CR`)
  return parts.join(' · ')
})

const breaks = computed(() => stats.value.crlf + stats.value.cr + stats.value.lf)

function convert(target: 'lf' | 'crlf' | 'cr') {
  const normalized = text.value.replace(/\r\n|\r|\n/g, '\n')
  const sep = target === 'lf' ? '\n' : target === 'crlf' ? '\r\n' : '\r'
  text.value = normalized.replace(/\n/g, sep)
}
</script>

<style scoped>
.gap-8 { gap: 8px; }

.le-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.08);
  margin-bottom: 6px;
}

.le-value {
  font-family: 'DM Mono', monospace;
  font-weight: 700;
  color: #1E40AF;
  font-size: 12px;
}
</style>
