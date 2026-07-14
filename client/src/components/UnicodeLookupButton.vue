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
        title="Unicode code point lookup"
        size="large"
      >
        <v-icon size="22">mdi-alphabet-latin</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <v-text-field
        v-model="input"
        label="Characters"
        density="compact"
        variant="outlined"
        hide-details
        class="mb-2"
        placeholder="Enter one or more characters"
      />

      <div class="uni-list">
        <div v-if="!chars.length" class="text-caption text-medium-emphasis pa-2">
          Enter characters above.
        </div>
        <div v-for="c in chars" :key="c.index" class="uni-row">
          <div class="uni-glyph">{{ c.char }}</div>
          <div class="uni-body">
            <div class="uni-code">U+{{ c.hex }} · dec {{ c.dec }}</div>
            <div class="uni-html">HTML: &amp;#{{ c.dec }};</div>
          </div>
          <v-btn size="x-small" variant="text" @click="copy(c.char)">
            <v-icon size="14">mdi-content-copy</v-icon>
          </v-btn>
        </div>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

interface CharInfo {
  index: number
  char: string
  hex: string
  dec: number
}

const open = ref(false)
const input = ref('')
const notify = useNotificationStore()

const chars = computed<CharInfo[]>(() => {
  const out: CharInfo[] = []
  let idx = 0
  for (const ch of input.value) {
    const cp = ch.codePointAt(0)
    if (cp === undefined) continue
    out.push({
      index: idx++,
      char: ch,
      hex: cp.toString(16).toUpperCase().padStart(4, '0'),
      dec: cp,
    })
    if (out.length >= 40) break
  }
  return out
})

async function copy(char: string) {
  try {
    await navigator.clipboard.writeText(char)
    notify.showToast({
      type: 'success',
      title: 'Character copied',
      message: char,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.uni-list {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.uni-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px;
  border-radius: 4px;
}

.uni-row:hover {
  background: rgba(148, 163, 184, 0.08);
}

.uni-glyph {
  width: 36px;
  text-align: center;
  font-size: 20px;
  line-height: 1;
}

.uni-body {
  flex: 1;
  min-width: 0;
}

.uni-code {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: rgb(var(--v-theme-on-surface));
}

.uni-html {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #94A3B8;
}
</style>
