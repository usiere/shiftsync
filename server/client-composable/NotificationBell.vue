<template>
  <div class="notification-bell-wrapper">
    <!-- Notification Bell Button -->
    <button
      class="notification-bell"
      @click="toggleDropdown"
      :class="{ 'has-unread': unreadCount > 0 }"
      :disabled="loading"
    >
      <svg
        class="bell-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Unread count badge -->
      <span v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Notification Dropdown -->
    <div
      v-if="showDropdown"
      class="notification-dropdown"
      @click.stop
    >
      <div class="notification-header">
        <h3 class="notification-title">Notifications</h3>
        <div class="notification-actions">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            :disabled="markingAllAsRead"
            class="mark-all-read-btn"
          >
            {{ markingAllAsRead ? 'Marking...' : 'Mark all as read' }}
          </button>
          <button @click="closeDropdown" class="close-btn" aria-label="Close notifications">
            ×
          </button>
        </div>
      </div>

      <div class="notification-list">
        <!-- Loading state -->
        <div v-if="loading" class="notification-loading">
          <div class="loading-spinner"></div>
          <span>Loading notifications...</span>
        </div>

        <!-- Empty state -->
        <div v-else-if="notifications.length === 0" class="notification-empty">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p>No notifications yet</p>
        </div>

        <!-- Notification items -->
        <div v-else class="notification-items">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'notification-item--unread': !notification.isRead }"
            @click="markAsRead(notification)"
          >
            <div class="notification-content">
              <div class="notification-item-header">
                <h4 class="notification-item-title">{{ notification.title }}</h4>
                <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div v-if="!notification.isRead" class="unread-indicator"></div>
            </div>
          </div>

          <!-- Load more button -->
          <button
            v-if="hasMore"
            @click="loadMore"
            :disabled="loadingMore"
            class="load-more-btn"
          >
            {{ loadingMore ? 'Loading...' : 'Load more' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Backdrop to close dropdown when clicking outside -->
    <div
      v-if="showDropdown"
      class="notification-backdrop"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSocket } from './useSocket'

interface Notification {
  id: number
  userId: number
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  readAt?: string
  createdAt: string
}

// Reactive state
const showDropdown = ref(false)
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const markingAllAsRead = ref(false)
const hasMore = ref(true)
const offset = ref(0)
const limit = 20

// Socket composable
const { socket, connected } = useSocket()

// API base URL
const API_BASE = process.env.VUE_APP_API_URL || 'http://localhost:3000'

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

// API headers
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
})

// Load notifications from API
const loadNotifications = async (reset = false) => {
  if (reset) {
    offset.value = 0
    notifications.value = []
    hasMore.value = true
  }

  loading.value = reset
  loadingMore.value = !reset

  try {
    const response = await fetch(
      `${API_BASE}/api/notifications?limit=${limit}&offset=${offset.value}`,
      {
        headers: getAuthHeaders()
      }
    )

    if (!response.ok) {
      throw new Error('Failed to load notifications')
    }

    const data = await response.json()

    if (reset) {
      notifications.value = data.notifications
    } else {
      notifications.value.push(...data.notifications)
    }

    unreadCount.value = data.unreadCount
    hasMore.value = data.pagination.hasMore
    offset.value += data.notifications.length

  } catch (error) {
    console.error('Error loading notifications:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// Load more notifications
const loadMore = () => {
  if (!loadingMore.value && hasMore.value) {
    loadNotifications(false)
  }
}

// Mark notification as read
const markAsRead = async (notification: Notification) => {
  if (notification.isRead) return

  try {
    const response = await fetch(
      `${API_BASE}/api/notifications/${notification.id}/read`,
      {
        method: 'PATCH',
        headers: getAuthHeaders()
      }
    )

    if (!response.ok) {
      throw new Error('Failed to mark notification as read')
    }

    const data = await response.json()

    // Update local state
    notification.isRead = true
    notification.readAt = new Date().toISOString()
    unreadCount.value = data.unreadCount

  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

// Mark all notifications as read
const markAllAsRead = async () => {
  if (markingAllAsRead.value || unreadCount.value === 0) return

  markingAllAsRead.value = true

  try {
    const response = await fetch(
      `${API_BASE}/api/notifications/read-all`,
      {
        method: 'PATCH',
        headers: getAuthHeaders()
      }
    )

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read')
    }

    // Update local state
    notifications.value.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true
        notification.readAt = new Date().toISOString()
      }
    })

    unreadCount.value = 0

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  } finally {
    markingAllAsRead.value = false
  }
}

// Toggle dropdown
const toggleDropdown = () => {
  if (showDropdown.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

// Open dropdown
const openDropdown = () => {
  showDropdown.value = true
  if (notifications.value.length === 0) {
    loadNotifications(true)
  }
}

// Close dropdown
const closeDropdown = () => {
  showDropdown.value = false
}

// Format time
const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

// Socket event handlers
const handleNewNotification = (data: any) => {
  // Add new notification to the top of the list
  notifications.value.unshift(data.notification)
  unreadCount.value = data.unreadCount

  // Limit the list size to prevent memory issues
  if (notifications.value.length > 100) {
    notifications.value = notifications.value.slice(0, 100)
  }
}

const handleNotificationRead = (data: any) => {
  unreadCount.value = data.unreadCount

  // Update the specific notification if it's in the current list
  const notification = notifications.value.find(n => n.id === data.notificationId)
  if (notification && !notification.isRead) {
    notification.isRead = true
    notification.readAt = new Date().toISOString()
  }
}

const handleAllNotificationsRead = (data: any) => {
  unreadCount.value = 0

  // Mark all notifications in the list as read
  notifications.value.forEach(notification => {
    if (!notification.isRead) {
      notification.isRead = true
      notification.readAt = new Date().toISOString()
    }
  })
}

// Set up socket listeners
watch(connected, (isConnected) => {
  if (isConnected && socket.value) {
    socket.value.on('newNotification', handleNewNotification)
    socket.value.on('notificationRead', handleNotificationRead)
    socket.value.on('allNotificationsRead', handleAllNotificationsRead)
  }
})

// Load initial unread count
onMounted(async () => {
  try {
    const response = await fetch(`${API_BASE}/api/notifications/unread-count`, {
      headers: getAuthHeaders()
    })

    if (response.ok) {
      const data = await response.json()
      unreadCount.value = data.unreadCount
    }
  } catch (error) {
    console.error('Error loading unread count:', error)
  }
})

// Cleanup
onUnmounted(() => {
  if (socket.value) {
    socket.value.off('newNotification', handleNewNotification)
    socket.value.off('notificationRead', handleNotificationRead)
    socket.value.off('allNotificationsRead', handleAllNotificationsRead)
  }
})
</script>

<style scoped>
.notification-bell-wrapper {
  position: relative;
  display: inline-block;
}

.notification-bell {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  color: #6b7280;
}

.notification-bell:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.notification-bell.has-unread {
  color: #2563eb;
}

.notification-bell:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.bell-icon {
  width: 20px;
  height: 20px;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  max-width: 90vw;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 8px;
}

.notification-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.notification-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mark-all-read-btn {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mark-all-read-btn:hover {
  background-color: #f3f4f6;
}

.mark-all-read-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f3f4f6;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-loading {
  padding: 32px 16px;
  text-align: center;
  color: #6b7280;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification-empty {
  padding: 32px 16px;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 8px;
  opacity: 0.5;
}

.notification-items {
  padding: 0;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item--unread {
  background-color: #eff6ff;
}

.notification-item--unread:hover {
  background-color: #dbeafe;
}

.notification-content {
  position: relative;
}

.notification-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-item-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
  margin-right: 8px;
}

.notification-time {
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.notification-message {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.4;
  margin: 0;
}

.unread-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: #2563eb;
  border-radius: 50%;
}

.load-more-btn {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.load-more-btn:hover {
  background-color: #f3f4f6;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .notification-dropdown {
    width: 320px;
    right: -16px;
  }

  .notification-item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .notification-time {
    align-self: flex-end;
  }
}
</style>