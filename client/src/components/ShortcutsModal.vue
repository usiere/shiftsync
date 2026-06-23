<template>
  <v-dialog v-model="open" max-width="640">
    <v-card>
      <v-card-title class="d-flex align-center pa-4">
        <v-icon class="me-2">mdi-keyboard</v-icon>
        Keyboard shortcuts
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="open = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-0">
        <div v-for="group in GROUPS" :key="group.title" class="shortcut-group">
          <div class="shortcut-group-title">{{ group.title }}</div>
          <div
            v-for="row in group.items"
            :key="row.label"
            class="shortcut-row"
          >
            <span class="shortcut-label">{{ row.label }}</span>
            <span class="shortcut-keys">
              <span
                v-for="(k, i) in row.keys"
                :key="i"
                class="shortcut-key"
              >{{ k }}</span>
            </span>
          </div>
        </div>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-4 py-3">
        <span class="text-caption text-medium-emphasis">
          Press <span class="shortcut-key shortcut-key--inline">?</span> any time to open this dialog.
        </span>
        <v-spacer />
        <v-btn variant="text" @click="open = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

interface ShortcutRow { label: string; keys: string[] }
interface ShortcutGroup { title: string; items: ShortcutRow[] }

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)
const mod = isMac ? '⌘' : 'Ctrl'

const GROUPS: ShortcutGroup[] = [
  {
    title: 'General',
    items: [
      { label: 'Open command palette', keys: [mod, 'K'] },
      { label: 'Show this shortcut list', keys: ['?'] },
      { label: 'Close dialog / palette', keys: ['Esc'] }
    ]
  },
  {
    title: 'Navigation',
    items: [
      { label: 'Go to Dashboard', keys: ['g', 'd'] },
      { label: 'Go to Schedule', keys: ['g', 's'] },
      { label: 'Go to Shifts', keys: ['g', 'h'] },
      { label: 'Go to Notifications', keys: ['g', 'n'] },
      { label: 'Go to Profile', keys: ['g', 'p'] }
    ]
  },
  {
    title: 'In the command palette',
    items: [
      { label: 'Move selection', keys: ['↑', '↓'] },
      { label: 'Open selected', keys: ['↵'] }
    ]
  }
]

const open = ref(false)
let lastGKey = 0

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

const ROUTE_KEYS: Record<string, string> = {
  d: '/dashboard',
  s: '/schedule',
  h: '/shifts',
  n: '/notifications',
  p: '/profile'
}

const router = useRouter()

function handleKey(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (isTypingTarget(e.target)) return

  if (e.key === '?') {
    e.preventDefault()
    open.value = true
    return
  }

  if (e.key === 'g') {
    lastGKey = Date.now()
    return
  }

  if (lastGKey && Date.now() - lastGKey < 1200) {
    const route = ROUTE_KEYS[e.key.toLowerCase()]
    if (route) {
      e.preventDefault()
      lastGKey = 0
      if (router.currentRoute.value.path !== route) {
        router.push(route)
      }
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey))

defineExpose({ open })
</script>

<style scoped>
.shortcut-group {
  padding: 16px 20px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.shortcut-group:last-child {
  border-bottom: none;
}

.shortcut-group-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.shortcut-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: rgb(var(--v-theme-on-surface));
}

.shortcut-keys {
  display: flex;
  gap: 6px;
}

.shortcut-key {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  color: rgb(var(--v-theme-on-surface));
}

.shortcut-key--inline {
  margin: 0 2px;
}
</style>
