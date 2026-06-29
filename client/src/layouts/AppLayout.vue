<template>
  <v-app>
    <!-- Clean Linear/Vercel-style Sidebar -->
    <div class="sidebar">
      <!-- Logo Section -->
      <div class="logo-area">
        <div class="logo-mark">SS</div>
        <span class="logo-text">ShiftSync</span>
      </div>

      <!-- Navigation Section -->
      <nav class="nav-section">
        <template v-if="pinnedNavItems.length">
          <div class="nav-group-label">Pinned</div>
          <div
            v-for="item in pinnedNavItems"
            :key="`pinned-${item.route}`"
            class="nav-item"
            :class="{ 'nav-item--active': $route.path === item.route }"
            @click="goTo(item.route)"
          >
            <v-icon size="16" class="nav-icon">{{ item.icon }}</v-icon>
            <span class="nav-label">{{ item.title }}</span>
            <button
              class="pin-btn pin-btn--active"
              :title="`Unpin ${item.title}`"
              @click.stop="togglePin(item.route)"
            >
              <v-icon size="14">mdi-pin</v-icon>
            </button>
          </div>
          <div class="nav-group-divider"></div>
        </template>

        <div
          v-for="item in unpinnedNavItems"
          :key="item.route"
          class="nav-item"
          :class="{ 'nav-item--active': $route.path === item.route }"
          @click="goTo(item.route)"
        >
          <v-icon size="16" class="nav-icon">{{ item.icon }}</v-icon>
          <span class="nav-label">{{ item.title }}</span>
          <button
            class="pin-btn"
            :title="`Pin ${item.title}`"
            @click.stop="togglePin(item.route)"
          >
            <v-icon size="14">mdi-pin-outline</v-icon>
          </button>
        </div>
      </nav>

      <!-- Bottom User Card -->
      <div class="user-card">
        <div class="user-avatar">
          {{ getUserInitials(authStore.userName) }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ authStore.userName }}</div>
          <div class="user-role">{{ authStore.userRole }}</div>
        </div>
        <button class="logout-btn" @click="handleLogout" title="Logout">
          <v-icon size="16">mdi-logout</v-icon>
        </button>
      </div>
    </div>

    <!-- Clean Top Bar with Shadow -->
    <v-app-bar
      app
      :color="theme.global.current.value.dark ? 'surface' : 'white'"
      elevation="1"
      height="64"
      class="border-b topbar"
      fixed
    >
      <v-spacer />

      <button
        class="cmdk-trigger me-4"
        @click="openPalette"
        title="Quick search (⌘K)"
      >
        <v-icon size="16" class="me-2">mdi-magnify</v-icon>
        <span class="cmdk-text">Search…</span>
        <span class="cmdk-kbd">⌘K</span>
      </button>

      <v-chip
        v-if="authStore.userName"
        class="me-4"
        color="primary"
        variant="outlined"
        size="small"
      >
        <v-icon start size="small">mdi-account</v-icon>
        {{ authStore.userName }}
      </v-chip>

      <div
        v-if="authStore.userRole"
        class="role-badge me-4"
        :class="`role-${authStore.userRole.toLowerCase()}`"
      >
        {{ authStore.userRole }}
      </div>

      <v-btn
        icon
        @click="openShortcuts"
        variant="text"
        class="me-2"
        title="Keyboard shortcuts (?)"
        size="large"
      >
        <v-icon size="22">mdi-keyboard-outline</v-icon>
      </v-btn>

      <v-btn
        icon
        @click="toggleTheme"
        variant="text"
        class="me-2"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        size="large"
      >
        <v-icon size="22">{{ isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <v-btn
        icon
        @click="handleLogout"
        variant="text"
        class="logout-topbar-btn"
        title="Logout"
        color="error"
        size="large"
      >
        <v-icon size="24">mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>

    <CommandPalette />
    <ShortcutsModal ref="shortcutsRef" />
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import CommandPalette from '../components/CommandPalette.vue'
import ShortcutsModal from '../components/ShortcutsModal.vue'
import { pinnedRoutes, togglePinned } from '../utils/pinnedNav'

const authStore = useAuthStore()
const router = useRouter()
const theme = useTheme()
const shortcutsRef = ref<InstanceType<typeof ShortcutsModal> | null>(null)

function openPalette() {
  const evt = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
  window.dispatchEvent(evt)
}

function openShortcuts() {
  if (shortcutsRef.value) {
    shortcutsRef.value.open = true
  }
}

const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  const next = isDark.value ? 'light' : 'dark'
  theme.global.name.value = next
  localStorage.setItem('theme', next)
}


const navItems = [
  { title: 'Dashboard', route: '/dashboard', icon: 'mdi-view-dashboard', roles: ['admin', 'manager'] },
  { title: 'Shifts', route: '/shifts', icon: 'mdi-calendar-clock', roles: ['admin', 'manager'] },
  { title: 'Schedule', route: '/schedule', icon: 'mdi-calendar', roles: ['admin', 'manager', 'staff'] },
  { title: 'Swap Requests', route: '/swap-requests', icon: 'mdi-swap-horizontal', roles: ['admin', 'manager', 'staff'] },
  { title: 'Notifications', route: '/notifications', icon: 'mdi-bell', roles: ['admin', 'manager', 'staff'] },
  { title: 'Analytics', route: '/analytics', icon: 'mdi-chart-bar', roles: ['admin', 'manager'] },
  { title: 'Reports', route: '/reports', icon: 'mdi-file-export', roles: ['admin', 'manager'] },
  { title: 'Settings', route: '/settings', icon: 'mdi-cog', roles: ['admin', 'manager', 'staff'] },
  { title: 'Profile', route: '/profile', icon: 'mdi-account-circle', roles: ['admin', 'manager', 'staff'] },
  { title: 'Help', route: '/help', icon: 'mdi-help-circle-outline', roles: ['admin', 'manager', 'staff'] },
]

const filteredNavItems = computed(() => {
  if (!authStore.userRole) return []
  const userRole = authStore.userRole.toLowerCase()
  return navItems.filter(item => item.roles.includes(userRole))
})

const pinnedNavItems = computed(() =>
  pinnedRoutes.value
    .map(route => filteredNavItems.value.find(i => i.route === route))
    .filter((i): i is typeof navItems[number] => Boolean(i))
)

const unpinnedNavItems = computed(() =>
  filteredNavItems.value.filter(i => !pinnedRoutes.value.includes(i.route))
)

function togglePin(route: string) {
  togglePinned(route)
}

function goTo(route: string) {
  if (router.currentRoute.value.path !== route) {
    router.push(route)
  }
}

function _getRoleColor(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin': return 'error'
    case 'manager': return 'warning'
    case 'staff': return 'info'
    default: return 'primary'
  }
}

function getUserInitials(name: string | null): string {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<style scoped>
/* Sidebar Container - Linear/Vercel Style */
.sidebar {
  width: 220px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  flex-direction: column;
  padding: 0;
  z-index: 1000;
}

/* Logo Area */
.logo-area {
  height: 64px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #2563EB;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  letter-spacing: -0.01em;
}

/* Navigation Section */
.nav-section {
  padding: 16px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Group label above pinned items */
.nav-group-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94A3B8;
  padding: 4px 10px 2px;
}

.nav-group-divider {
  height: 1px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  margin: 8px 4px;
}

/* Nav Items */
.nav-item {
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
  text-decoration: none;
  position: relative;
}

.nav-label {
  flex: 1;
}

.pin-btn {
  width: 22px;
  height: 22px;
  border: none;
  background: transparent;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 120ms ease, background 120ms ease;
  flex-shrink: 0;
}

.pin-btn .v-icon {
  color: #94A3B8 !important;
}

.nav-item:hover .pin-btn,
.pin-btn--active {
  opacity: 1;
}

.pin-btn--active .v-icon {
  color: #2563EB !important;
}

.pin-btn:hover {
  background: rgba(148, 163, 184, 0.15);
}

/* Default State */
.nav-icon {
  color: #94A3B8 !important;
  flex-shrink: 0;
}

.nav-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
}

/* Hover State */
.nav-item:hover:not(.nav-item--active) {
  background: #F9FAFB;
}

.nav-item:hover:not(.nav-item--active) .nav-icon {
  color: #475569 !important;
}

.nav-item:hover:not(.nav-item--active) .nav-label {
  color: #374151;
}

/* Active State */
.nav-item--active {
  background: #EFF6FF;
  font-weight: 600;
}

.nav-item--active .nav-icon {
  color: #2563EB !important;
}

.nav-item--active .nav-label {
  color: #1D4ED8;
  font-weight: 600;
}

/* Bottom User Card */
.user-card {
  padding: 12px 16px;
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0F172A;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  text-transform: uppercase;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

.logout-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 120ms ease;
}

.logout-btn .v-icon {
  color: #CBD5E1 !important;
}

.logout-btn:hover {
  background: #FEF2F2;
}

.logout-btn:hover .v-icon {
  color: #EF4444 !important;
}

/* Adjust main content to accommodate fixed sidebar and topbar */
.v-main {
  margin-left: 220px !important;
  padding-top: 64px !important;
}


/* App bar border and fixed positioning */
.border-b {
  border-bottom: 1px solid #F0F0F0 !important;
}

.topbar {
  position: fixed !important;
  top: 0 !important;
  left: 220px !important;
  width: calc(100% - 220px) !important;
  z-index: 999 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

/* Logout button styling */
.logout-topbar-btn {
  border: 1px solid #e0e0e0 !important;
  background: white !important;
}

.logout-topbar-btn:hover {
  background: #f5f5f5 !important;
  border-color: #d0d0d0 !important;
}

/* Role Badge */
.role-badge {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-radius: 6px;
  padding: 3px 10px;
  display: inline-flex;
  align-items: center;
}

.role-admin {
  background: #EFF6FF;
  color: #2563EB;
}

/* Command palette trigger in topbar */
.cmdk-trigger {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: transparent;
  color: #94A3B8;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;
  min-width: 180px;
}

.cmdk-trigger:hover {
  background: rgba(148, 163, 184, 0.08);
  border-color: rgba(148, 163, 184, 0.5);
}

.cmdk-text {
  flex: 1;
  text-align: left;
}

.cmdk-kbd {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  padding: 2px 6px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  color: #94A3B8;
}
</style>