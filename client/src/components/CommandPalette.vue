<template>
  <v-dialog
    v-model="open"
    max-width="600"
    transition="fade-transition"
    @after-enter="focusInput"
  >
    <v-card class="palette-card">
      <div class="palette-search">
        <v-icon size="20" class="palette-icon">mdi-magnify</v-icon>
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Search pages, actions…"
          class="palette-input"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="run(filtered[activeIndex])"
          @keydown.esc="open = false"
        />
        <v-chip size="x-small" variant="outlined" class="palette-kbd">ESC</v-chip>
      </div>

      <v-divider />

      <div v-if="filtered.length === 0" class="palette-empty">
        No matches for "{{ query }}"
      </div>

      <ul v-else class="palette-list">
        <li
          v-for="(item, i) in filtered"
          :key="item.route"
          class="palette-item"
          :class="{ 'palette-item--active': i === activeIndex }"
          @mouseenter="activeIndex = i"
          @click="run(item)"
        >
          <v-icon size="18" class="me-3 palette-item-icon">{{ item.icon }}</v-icon>
          <div class="palette-item-text">
            <div class="palette-item-title">{{ item.title }}</div>
            <div class="palette-item-sub">{{ item.subtitle }}</div>
          </div>
          <v-icon size="14" class="palette-item-arrow">mdi-arrow-right</v-icon>
        </li>
      </ul>

      <div class="palette-footer">
        <span><v-chip size="x-small" variant="outlined">↑↓</v-chip> Navigate</span>
        <span><v-chip size="x-small" variant="outlined">↵</v-chip> Open</span>
        <span><v-chip size="x-small" variant="outlined">⌘K</v-chip> Toggle</span>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

interface PaletteItem {
  title: string
  subtitle: string
  route: string
  icon: string
  roles: string[]
}

const ALL_ITEMS: PaletteItem[] = [
  { title: 'Dashboard', subtitle: 'Overview & KPIs', route: '/dashboard', icon: 'mdi-view-dashboard', roles: ['admin', 'manager'] },
  { title: 'Shifts', subtitle: 'Create & manage shifts', route: '/shifts', icon: 'mdi-calendar-clock', roles: ['admin', 'manager'] },
  { title: 'Schedule', subtitle: 'Weekly schedule', route: '/schedule', icon: 'mdi-calendar', roles: ['admin', 'manager', 'staff'] },
  { title: 'Swap Requests', subtitle: 'Approve / reject swaps', route: '/swap-requests', icon: 'mdi-swap-horizontal', roles: ['admin', 'manager', 'staff'] },
  { title: 'Time Off', subtitle: 'Time-off requests', route: '/time-off', icon: 'mdi-beach', roles: ['admin', 'manager', 'staff'] },
  { title: 'Notifications', subtitle: 'Your notification feed', route: '/notifications', icon: 'mdi-bell', roles: ['admin', 'manager', 'staff'] },
  { title: 'Employees', subtitle: 'Staff directory', route: '/employees', icon: 'mdi-account-group', roles: ['admin', 'manager'] },
  { title: 'Analytics', subtitle: 'Trends & reports', route: '/analytics', icon: 'mdi-chart-bar', roles: ['admin', 'manager'] },
  { title: 'Reports', subtitle: 'CSV / data export', route: '/reports', icon: 'mdi-file-export', roles: ['admin', 'manager'] },
  { title: 'Settings', subtitle: 'Preferences', route: '/settings', icon: 'mdi-cog', roles: ['admin', 'manager', 'staff'] },
  { title: 'My Profile', subtitle: 'Account details', route: '/profile', icon: 'mdi-account-circle', roles: ['admin', 'manager', 'staff'] }
]

const router = useRouter()
const authStore = useAuthStore()
const open = ref(false)
const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const visibleItems = computed(() => {
  const role = (authStore.userRole || '').toLowerCase()
  if (!role) return []
  return ALL_ITEMS.filter(i => i.roles.includes(role))
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return visibleItems.value
  return visibleItems.value.filter(i =>
    i.title.toLowerCase().includes(q) || i.subtitle.toLowerCase().includes(q)
  )
})

watch(filtered, () => { activeIndex.value = 0 })
watch(open, (v) => {
  if (v) {
    query.value = ''
    activeIndex.value = 0
  }
})

function focusInput() {
  nextTick(() => inputRef.value?.focus())
}

function move(delta: number) {
  const len = filtered.value.length
  if (!len) return
  activeIndex.value = (activeIndex.value + delta + len) % len
}

function run(item: PaletteItem | undefined) {
  if (!item) return
  open.value = false
  if (router.currentRoute.value.path !== item.route) {
    router.push(item.route)
  }
}

function handleKey(e: KeyboardEvent) {
  const isToggle = (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)
  if (isToggle) {
    e.preventDefault()
    open.value = !open.value
  }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey))
</script>

<style scoped>
.palette-card {
  border-radius: 12px;
  overflow: hidden;
}

.palette-search {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  gap: 10px;
}

.palette-icon {
  color: #94A3B8;
}

.palette-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
}

.palette-kbd {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
}

.palette-empty {
  padding: 24px;
  text-align: center;
  color: #94A3B8;
  font-size: 13px;
}

.palette-list {
  list-style: none;
  padding: 6px;
  margin: 0;
  max-height: 360px;
  overflow-y: auto;
}

.palette-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 100ms ease;
}

.palette-item--active {
  background: rgba(37, 99, 235, 0.08);
}

.palette-item-icon {
  color: #64748B;
  flex-shrink: 0;
}

.palette-item--active .palette-item-icon {
  color: #2563EB;
}

.palette-item-text {
  flex: 1;
  min-width: 0;
}

.palette-item-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.palette-item-sub {
  font-size: 12px;
  color: #94A3B8;
}

.palette-item-arrow {
  color: transparent;
}

.palette-item--active .palette-item-arrow {
  color: #2563EB;
}

.palette-footer {
  display: flex;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-size: 11px;
  color: #94A3B8;
  align-items: center;
}
</style>
