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
        title="Generate UUID v4"
        size="large"
      >
        <v-icon size="22">mdi-identifier</v-icon>
      </v-btn>
    </template>

    <v-card min-width="320" class="pa-3">
      <div class="d-flex align-center mb-2">
        <span class="text-subtitle-2">UUID v4</span>
        <v-spacer />
        <v-btn size="x-small" variant="text" @click="regen">
          <v-icon size="16">mdi-refresh</v-icon>
        </v-btn>
      </div>
      <div class="uuid-list">
        <div v-for="(u, i) in values" :key="i" class="uuid-row">
          <code class="uuid-value">{{ u }}</code>
          <v-btn size="x-small" variant="text" @click="copy(u)">
            <v-icon size="16">mdi-content-copy</v-icon>
          </v-btn>
        </div>
      </div>
      <v-btn size="small" variant="text" block class="mt-2" @click="copyAll">
        Copy all
      </v-btn>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const values = ref<string[]>([])
const notify = useNotificationStore()

function generate(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
  return (
    hex.slice(0, 4).join('') +
    '-' + hex.slice(4, 6).join('') +
    '-' + hex.slice(6, 8).join('') +
    '-' + hex.slice(8, 10).join('') +
    '-' + hex.slice(10, 16).join('')
  )
}

function regen() {
  values.value = Array.from({ length: 5 }, generate)
}

watch(open, (v) => {
  if (v) regen()
})

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify.showToast({
      type: 'success',
      title: 'UUID copied',
      message: text,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}

async function copyAll() {
  try {
    await navigator.clipboard.writeText(values.value.join('\n'))
    notify.showToast({
      type: 'success',
      title: 'All UUIDs copied',
      message: `${values.value.length} identifiers`,
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.uuid-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.uuid-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.uuid-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 4px 8px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
  word-break: break-all;
}
</style>
