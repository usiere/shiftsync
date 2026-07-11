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
        title="User Agent parser"
        size="large"
      >
        <v-icon size="22">mdi-account-details-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="340" class="pa-3">
      <div class="ua-row" v-for="row in rows" :key="row.label">
        <span class="ua-label">{{ row.label }}</span>
        <code class="ua-value">{{ row.value }}</code>
      </div>
      <v-divider class="my-2" />
      <div class="text-caption text-medium-emphasis mb-1">Raw UA</div>
      <code class="ua-raw">{{ ua }}</code>
      <div class="d-flex mt-2">
        <v-spacer />
        <v-btn size="small" variant="text" @click="copy">
          <v-icon start size="16">mdi-content-copy</v-icon>
          Copy UA
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNotificationStore } from '../stores/notifications'

const open = ref(false)
const ua = navigator.userAgent
const notify = useNotificationStore()

function detectBrowser(u: string): { name: string; version: string } {
  if (/Edg\/(\S+)/.test(u)) return { name: 'Edge', version: RegExp.$1 }
  if (/OPR\/(\S+)/.test(u) || /Opera\/(\S+)/.test(u)) return { name: 'Opera', version: RegExp.$1 }
  if (/Firefox\/(\S+)/.test(u)) return { name: 'Firefox', version: RegExp.$1 }
  if (/Chrome\/(\S+)/.test(u)) return { name: 'Chrome', version: RegExp.$1 }
  if (/Version\/(\S+).*Safari/.test(u)) return { name: 'Safari', version: RegExp.$1 }
  return { name: 'Unknown', version: '?' }
}

function detectOs(u: string): string {
  if (/Windows NT ([\d.]+)/.test(u)) return `Windows NT ${RegExp.$1}`
  if (/Mac OS X ([\d_.]+)/.test(u)) return `macOS ${RegExp.$1.replace(/_/g, '.')}`
  if (/Android ([\d.]+)/.test(u)) return `Android ${RegExp.$1}`
  if (/(iPhone|iPad); CPU OS ([\d_]+)/.test(u)) return `iOS ${RegExp.$2.replace(/_/g, '.')}`
  if (/Linux/.test(u)) return 'Linux'
  return 'Unknown'
}

function detectEngine(u: string): string {
  if (/Gecko\/\S+ Firefox/.test(u)) return 'Gecko'
  if (/AppleWebKit\/(\S+)/.test(u)) return `WebKit ${RegExp.$1}`
  if (/Trident\/(\S+)/.test(u)) return `Trident ${RegExp.$1}`
  return 'Unknown'
}

function detectDevice(u: string): string {
  if (/Mobile|Android|iPhone/.test(u)) return 'Mobile'
  if (/Tablet|iPad/.test(u)) return 'Tablet'
  return 'Desktop'
}

const browser = computed(() => detectBrowser(ua))

const rows = computed(() => [
  { label: 'Browser', value: `${browser.value.name} ${browser.value.version}` },
  { label: 'OS', value: detectOs(ua) },
  { label: 'Engine', value: detectEngine(ua) },
  { label: 'Device', value: detectDevice(ua) },
  { label: 'Language', value: navigator.language },
  { label: 'Platform', value: navigator.platform || 'n/a' },
])

async function copy() {
  try {
    await navigator.clipboard.writeText(ua)
    notify.showToast({
      type: 'success',
      title: 'User agent copied',
      message: '',
      timeout: 2000,
    })
  } catch {
    /* ignore */
  }
}
</script>

<style scoped>
.ua-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 0;
}

.ua-label {
  width: 80px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ua-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 2px 6px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 4px;
}

.ua-raw {
  display: block;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  padding: 6px 8px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 4px;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
