<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Notifications</h1>
          <div class="d-flex align-center gap-2">
            <v-btn
              v-if="unreadCount > 0"
              color="primary"
              variant="outlined"
              @click="markAllAsRead"
              :loading="markingAllRead"
            >
              <v-icon class="me-1">mdi-check-all</v-icon>
              Mark All Read ({{ unreadCount }})
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              @click="refreshNotifications"
              :loading="loading"
            >
              <v-icon class="me-1">mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Filter Chips -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex flex-wrap gap-2">
          <v-chip
            v-for="filter in filterOptions"
            :key="filter.value"
            :variant="activeFilter === filter.value ? 'flat' : 'outlined'"
            :color="activeFilter === filter.value ? 'primary' : 'default'"
            clickable
            @click="setFilter(filter.value)"
          >
            <v-icon class="me-1">{{ filter.icon }}</v-icon>
            {{ filter.label }}
            <v-badge
              v-if="filter.count > 0"
              :content="filter.count"
              color="error"
              inline
              class="ms-1"
            />
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <!-- Notifications List -->
    <v-card>
      <v-card-text v-if="loading">
        <v-list>
          <v-list-item v-for="i in 8" :key="i">
            <template v-slot:prepend>
              <v-skeleton-loader type="avatar" />
            </template>
            <v-list-item-title>
              <v-skeleton-loader type="text" width="60%" />
            </v-list-item-title>
            <v-list-item-subtitle>
              <v-skeleton-loader type="text" width="80%" />
            </v-list-item-subtitle>
            <template v-slot:append>
              <v-skeleton-loader type="chip" />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>

      <div v-else-if="filteredNotifications.length === 0" class="text-center py-12">
        <v-icon size="64" color="grey-lighten-1">mdi-bell-outline</v-icon>
        <h3 class="text-h6 mt-4 text-grey">No notifications found</h3>
        <p class="text-body-2 text-grey">
          {{ activeFilter === 'unread' ? 'You have no unread notifications.' : getEmptyStateMessage() }}
        </p>
      </div>

      <v-list v-else lines="three">
        <template
          v-for="(notification, index) in filteredNotifications"
          :key="notification.id"
        >
          <v-list-item
            :class="{
              'bg-blue-lighten-5': !notification.read,
              'notification-clickable': !notification.read
            }"
            @click="markAsRead(notification)"
          >
            <template v-slot:prepend>
              <v-avatar
                :color="getNotificationColor(notification.type)"
                size="40"
              >
                <v-icon color="white">
                  {{ getNotificationIcon(notification.type) }}
                </v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="text-wrap">
              <div class="d-flex align-center">
                <span class="font-weight-medium">{{ notification.title }}</span>
                <v-chip
                  v-if="!notification.read"
                  size="x-small"
                  color="primary"
                  variant="flat"
                  class="ms-2"
                >
                  NEW
                </v-chip>
              </div>
            </v-list-item-title>

            <v-list-item-subtitle class="text-wrap">
              <div class="mt-1">
                {{ notification.message }}
              </div>
              <div class="text-caption text-grey mt-2">
                <v-icon size="14" class="me-1">mdi-clock</v-icon>
                {{ formatDateTime(notification.createdAt) }}
              </div>
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="d-flex flex-column align-end gap-1">
                <v-chip
                  size="x-small"
                  :color="getTypeColor(notification.type)"
                  variant="tonal"
                >
                  {{ formatType(notification.type) }}
                </v-chip>

                <v-btn
                  v-if="!notification.read"
                  icon
                  size="small"
                  variant="text"
                  @click.stop="markAsRead(notification)"
                  :loading="markingAsRead.has(notification.id)"
                >
                  <v-icon size="18">mdi-check</v-icon>
                </v-btn>
              </div>
            </template>
          </v-list-item>

          <v-divider v-if="index < filteredNotifications.length - 1" />
        </template>
      </v-list>

      <!-- Load More Button -->
      <v-card-actions v-if="hasMore && filteredNotifications.length > 0">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="loadMore"
          :loading="loadingMore"
        >
          Load More
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Success/Error Messages -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

interface Notification {
  id: number
  title: string
  message: string
  type: 'SHIFT' | 'SWAP' | 'SYSTEM' | 'APPROVAL' | 'REMINDER'
  read: boolean
  createdAt: string
}

const loading = ref(true)
const loadingMore = ref(false)
const markingAsRead = ref(new Set<number>())
const markingAllRead = ref(false)
const notifications = ref<Notification[]>([])
const activeFilter = ref('all')
const currentPage = ref(1)
const hasMore = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

const shiftCount = computed(() => {
  return notifications.value.filter(n => n.type === 'SHIFT').length
})

const swapCount = computed(() => {
  return notifications.value.filter(n => ['SWAP', 'APPROVAL'].includes(n.type)).length
})

const filterOptions = computed(() => [
  {
    value: 'all',
    label: 'All',
    icon: 'mdi-bell',
    count: notifications.value.length
  },
  {
    value: 'unread',
    label: 'Unread',
    icon: 'mdi-bell-badge',
    count: unreadCount.value
  },
  {
    value: 'shifts',
    label: 'Shifts',
    icon: 'mdi-calendar-clock',
    count: shiftCount.value
  },
  {
    value: 'swaps',
    label: 'Swaps',
    icon: 'mdi-swap-horizontal',
    count: swapCount.value
  }
])

const filteredNotifications = computed(() => {
  let filtered = notifications.value

  switch (activeFilter.value) {
    case 'unread':
      filtered = filtered.filter(n => !n.read)
      break
    case 'shifts':
      filtered = filtered.filter(n => n.type === 'SHIFT')
      break
    case 'swaps':
      filtered = filtered.filter(n => ['SWAP', 'APPROVAL'].includes(n.type))
      break
  }

  // Sort by creation date (newest first)
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

async function fetchNotifications(page = 1, append = false) {
  try {
    if (!append) loading.value = true
    else loadingMore.value = true

    const response = await api.get('/api/notifications', {
      params: {
        page,
        limit: 20
      }
    })

    const newNotifications = response.data.notifications || response.data

    if (append) {
      notifications.value = [...notifications.value, ...newNotifications]
    } else {
      notifications.value = newNotifications
    }

    hasMore.value = response.data.hasMore || false
    currentPage.value = page

  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    showMessage('Failed to load notifications', 'error')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function markAsRead(notification: Notification) {
  if (notification.read) return

  try {
    markingAsRead.value.add(notification.id)

    await api.patch(`/api/notifications/${notification.id}/read`)

    // Update local state
    const notificationIndex = notifications.value.findIndex(n => n.id === notification.id)
    if (notificationIndex !== -1) {
      notifications.value[notificationIndex].read = true
    }

  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    showMessage('Failed to mark notification as read', 'error')
  } finally {
    markingAsRead.value.delete(notification.id)
  }
}

async function markAllAsRead() {
  if (unreadCount.value === 0) return

  try {
    markingAllRead.value = true

    await api.patch('/api/notifications/mark-all-read')

    // Update local state
    notifications.value = notifications.value.map(n => ({ ...n, read: true }))

    showMessage(`Marked ${unreadCount.value} notifications as read`, 'success')

  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    showMessage('Failed to mark all notifications as read', 'error')
  } finally {
    markingAllRead.value = false
  }
}

function setFilter(filter: string) {
  activeFilter.value = filter
}

async function loadMore() {
  await fetchNotifications(currentPage.value + 1, true)
}

async function refreshNotifications() {
  await fetchNotifications(1, false)
  showMessage('Notifications refreshed', 'success')
}

function getNotificationIcon(type: string): string {
  switch (type) {
    case 'SHIFT': return 'mdi-calendar-clock'
    case 'SWAP': return 'mdi-swap-horizontal'
    case 'APPROVAL': return 'mdi-gavel'
    case 'REMINDER': return 'mdi-clock-alert'
    case 'SYSTEM': return 'mdi-cog'
    default: return 'mdi-bell'
  }
}

function getNotificationColor(type: string): string {
  switch (type) {
    case 'SHIFT': return 'primary'
    case 'SWAP': return 'info'
    case 'APPROVAL': return 'warning'
    case 'REMINDER': return 'orange'
    case 'SYSTEM': return 'secondary'
    default: return 'grey'
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'SHIFT': return 'primary'
    case 'SWAP': return 'info'
    case 'APPROVAL': return 'warning'
    case 'REMINDER': return 'orange'
    case 'SYSTEM': return 'secondary'
    default: return 'grey'
  }
}

function formatType(type: string): string {
  switch (type) {
    case 'SHIFT': return 'Shift'
    case 'SWAP': return 'Swap'
    case 'APPROVAL': return 'Approval'
    case 'REMINDER': return 'Reminder'
    case 'SYSTEM': return 'System'
    default: return type
  }
}

function formatDateTime(dateTimeString: string): string {
  const date = new Date(dateTimeString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString()
  }
}

function getEmptyStateMessage(): string {
  switch (activeFilter.value) {
    case 'shifts':
      return 'No shift-related notifications found.'
    case 'swaps':
      return 'No swap-related notifications found.'
    default:
      return 'No notifications found.'
  }
}

function showMessage(message: string, color: string = 'success') {
  snackbar.value = { show: true, message, color }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.notification-clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-clickable:hover {
  background-color: rgb(var(--v-theme-surface-variant)) !important;
}

.bg-blue-lighten-5 {
  background-color: rgb(var(--v-theme-primary-container)) !important;
}
</style>