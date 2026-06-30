<template>
  <nav v-if="crumbs.length" class="breadcrumbs" aria-label="Breadcrumb">
    <router-link to="/" class="breadcrumb-item breadcrumb-item--root" title="Home">
      <v-icon size="14">mdi-home-outline</v-icon>
    </router-link>
    <template v-for="(crumb, idx) in crumbs" :key="crumb.path">
      <v-icon size="12" class="breadcrumb-sep">mdi-chevron-right</v-icon>
      <span v-if="idx === crumbs.length - 1" class="breadcrumb-item breadcrumb-item--current">
        {{ crumb.label }}
      </span>
      <router-link v-else :to="crumb.path" class="breadcrumb-item">
        {{ crumb.label }}
      </router-link>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  shifts: 'Shifts',
  schedule: 'Schedule',
  'swap-requests': 'Swap Requests',
  'time-off': 'Time Off',
  notifications: 'Notifications',
  employees: 'Employees',
  analytics: 'Analytics',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
  help: 'Help',
}

function humanize(segment: string): string {
  return segment
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

const crumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)
  const out: Array<{ label: string; path: string }> = []
  let acc = ''
  for (const seg of segments) {
    acc += '/' + seg
    out.push({ label: LABELS[seg] ?? humanize(seg), path: acc })
  }
  return out
})
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #94A3B8;
  min-width: 0;
  overflow: hidden;
}

.breadcrumb-item {
  text-decoration: none;
  color: #64748B;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 120ms ease, color 120ms ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.breadcrumb-item:hover:not(.breadcrumb-item--current) {
  background: rgba(148, 163, 184, 0.12);
  color: #1D4ED8;
}

.breadcrumb-item--root .v-icon {
  color: #94A3B8 !important;
}

.breadcrumb-item--current {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
  cursor: default;
}

.breadcrumb-sep {
  color: #CBD5E1 !important;
}

@media (max-width: 720px) {
  .breadcrumbs {
    display: none;
  }
}
</style>
