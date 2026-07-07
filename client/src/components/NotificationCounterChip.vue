<template>
  <router-link
    to="/notifications"
    class="notif-chip"
    :class="{ 'notif-chip--has': unreadCount > 0 }"
    :title="tooltip"
  >
    <v-icon size="14" class="notif-chip__icon">
      {{ unreadCount > 0 ? 'mdi-bell-ring' : 'mdi-bell-outline' }}
    </v-icon>
    <span class="notif-chip__label">{{ label }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '../stores/notifications'

const store = useNotificationStore()
const { unreadCount } = storeToRefs(store)

const label = computed(() => {
  const n = unreadCount.value
  if (n <= 0) return 'No new'
  if (n > 99) return '99+'
  return `${n} new`
})

const tooltip = computed(() => `${unreadCount.value} unread notification(s)`)
</script>

<style scoped>
.notif-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  background: transparent;
  text-decoration: none;
  transition: background 120ms ease, border-color 120ms ease;
}

.notif-chip:hover {
  background: rgba(148, 163, 184, 0.08);
}

.notif-chip__icon {
  color: #94A3B8 !important;
}

.notif-chip--has {
  background: #FEF3C7;
  border-color: #FDE68A;
  color: #92400E;
}

.notif-chip--has .notif-chip__icon {
  color: #B45309 !important;
}

@media (max-width: 1100px) {
  .notif-chip {
    display: none;
  }
}
</style>
