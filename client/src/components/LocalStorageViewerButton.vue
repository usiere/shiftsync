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
        title="LocalStorage viewer"
        size="large"
      >
        <v-icon size="22">mdi-database-outline</v-icon>
      </v-btn>
    </template>

    <v-card min-width="380" class="pa-3">
      <div class="d-flex align-center mb-2">
        <span class="text-subtitle-2">{{ entries.length }} keys</span>
        <v-spacer />
        <v-btn size="small" variant="text" @click="reload">
          <v-icon size="16">mdi-refresh</v-icon>
        </v-btn>
      </div>
      <div class="ls-list">
        <div v-if="!entries.length" class="text-caption text-medium-emphasis pa-2">
          No entries.
        </div>
        <div v-for="e in entries" :key="e.key" class="ls-row">
          <div class="ls-key" :title="e.key">{{ e.key }}</div>
          <div class="ls-value" :title="e.value">{{ trim(e.value) }}</div>
          <v-btn size="x-small" variant="text" title="Copy value" @click="copy(e.value)">
            <v-icon size="14">mdi-content-copy</v-icon>
          </v-btn>
          <v-btn size="x-small" variant="text" color="error" title="Remove" @click="remove(e.key)">
            <v-icon size="14">mdi-delete-outline</v-icon>
          </v-btn>
        </div>
      </div>
      <div class="d-flex mt-2">
        <span class="text-caption text-medium-emphasis flex-grow-1">
          {{ totalKb }} kB used
        </span>
        <v-btn size="small" variant="text" color="error" @click="clearAll">
          Clear all
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNotificationStore } from '../stores/notifications'

interface Entry {
  key: string
  value: string
}

const open = ref(false)
const version = ref(0)
const notify = useNotificationStore()

const entries = computed<Entry[]>(() => {
  void version.value
  const out: Entry[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k) continue
    out.push({ key: k, value: localStorage.getItem(k) ?? '' })
  }
  return out.sort((a, b) => a.key.localeCompare(b.key))
})

const totalKb = computed(() => {
  let total = 0
  for (const e of entries.value) {
    total += e.key.length + e.value.length
  }
  return (total * 2 / 1024).toFixed(1)
})

function trim(v: string): string {
  const s = v.replace(/\s+/g, ' ')
  return s.length > 80 ? s.slice(0, 80) + '…' : s
}

function reload() {
  version.value++
}

function remove(key: string) {
  try {
    localStorage.removeItem(key)
    reload()
    notify.showToast({ type: 'info', title: 'Removed', message: key, timeout: 2000 })
  } catch {
    /* ignore */
  }
}

function clearAll() {
  try {
    localStorage.clear()
    reload()
    notify.showToast({ type: 'warning', title: 'Cleared all localStorage', message: '', timeout: 2000 })
  } catch {
    /* ignore */
  }
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    notify.showToast({ type: 'success', title: 'Value copied', message: '', timeout: 2000 })
  } catch {
    /* ignore */
  }
}

watch(open, (v) => { if (v) reload() })
</script>

<style scoped>
.ls-list {
  max-height: 260px;
  overflow-y: auto;
}

.ls-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 4px;
}

.ls-row:hover {
  background: rgba(148, 163, 184, 0.08);
}

.ls-key {
  width: 140px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ls-value {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #64748B;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
