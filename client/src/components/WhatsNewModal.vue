<template>
  <v-dialog v-model="open" max-width="540" transition="fade-transition">
    <v-card class="whatsnew-card">
      <div class="whatsnew-header">
        <div class="whatsnew-badge">v{{ CURRENT_VERSION }}</div>
        <h2 class="whatsnew-title">What's new in ShiftSync</h2>
        <p class="whatsnew-sub">A few new things since you last checked in.</p>
      </div>

      <div class="whatsnew-body">
        <div
          v-for="entry in RELEASE_NOTES"
          :key="entry.title"
          class="whatsnew-entry"
        >
          <v-icon size="18" class="whatsnew-icon">{{ entry.icon }}</v-icon>
          <div>
            <div class="whatsnew-entry-title">{{ entry.title }}</div>
            <div class="whatsnew-entry-desc">{{ entry.description }}</div>
          </div>
        </div>
      </div>

      <div class="whatsnew-footer">
        <v-btn variant="text" @click="open = false">Dismiss</v-btn>
        <v-btn color="primary" variant="flat" @click="markSeenAndClose">
          Got it
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const CURRENT_VERSION = '0.5.0'
const STORAGE_KEY = 'shiftsync.whatsNewSeenVersion'

interface ReleaseEntry {
  title: string
  description: string
  icon: string
}

const RELEASE_NOTES: ReleaseEntry[] = [
  {
    title: 'Pinned navigation',
    description: 'Hover any sidebar item and click the pin to keep your most-used pages on top.',
    icon: 'mdi-pin'
  },
  {
    title: 'Scroll-to-top button',
    description: 'A floating button appears on long pages so you can jump back to the top.',
    icon: 'mdi-arrow-up-circle'
  },
  {
    title: 'Recent pages in ⌘K',
    description: 'The command palette now shows your recently visited pages first.',
    icon: 'mdi-history'
  },
  {
    title: 'Offline awareness',
    description: 'A banner appears when your connection drops, so unsaved-changes risk is visible.',
    icon: 'mdi-wifi-off'
  }
]

const open = ref(false)

function markSeenAndClose() {
  try {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION)
  } catch {
    /* ignore */
  }
  open.value = false
}

function openModal() {
  open.value = true
}

defineExpose({ open: openModal })

onMounted(() => {
  let seen: string | null = null
  try {
    seen = localStorage.getItem(STORAGE_KEY)
  } catch {
    seen = null
  }
  if (seen !== CURRENT_VERSION) {
    setTimeout(() => { open.value = true }, 800)
  }
})
</script>

<style scoped>
.whatsnew-card {
  border-radius: 14px;
  overflow: hidden;
}

.whatsnew-header {
  padding: 24px 24px 12px;
}

.whatsnew-badge {
  display: inline-block;
  background: #EFF6FF;
  color: #1D4ED8;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  margin-bottom: 12px;
}

.whatsnew-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px;
  letter-spacing: -0.01em;
}

.whatsnew-sub {
  font-size: 13px;
  color: #94A3B8;
  margin: 0;
}

.whatsnew-body {
  padding: 8px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.whatsnew-entry {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.whatsnew-icon {
  color: #2563EB !important;
  margin-top: 2px;
  flex-shrink: 0;
}

.whatsnew-entry-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.whatsnew-entry-desc {
  font-size: 13px;
  color: #64748B;
  line-height: 1.45;
}

.whatsnew-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
