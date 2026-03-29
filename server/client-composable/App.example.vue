<template>
  <div id="app">
    <!-- Your main app content -->
    <header class="app-header">
      <h1>ShiftSync</h1>

      <!-- Connection status indicator in header -->
      <div class="connection-indicator">
        <div
          :class="[
            'connection-dot',
            { 'connection-dot--connected': connected, 'connection-dot--disconnected': !connected }
          ]"
        />
        <span class="connection-text">
          {{ connected ? 'Connected' : 'Disconnected' }}
        </span>

        <!-- Notification Bell Component -->
        <NotificationBell />
      </div>
    </header>

    <!-- Main content area -->
    <main class="app-main">
      <!-- Schedule component that reacts to real-time updates -->
      <ScheduleView
        v-if="scheduleNeedsRefresh"
        @schedule-loaded="markScheduleAsRefreshed"
      />
      <ScheduleView v-else />

      <!-- Other components -->
      <SwapRequestsView v-if="currentView === 'swap-requests'" />
      <AvailableShiftsView v-if="currentView === 'available-shifts'" />
      <NotificationPreferences v-if="currentView === 'notification-preferences'" />
    </main>

    <!-- Toast notifications -->
    <NotificationToast />

    <!-- Notification dropdown (optional) -->
    <div v-if="showNotifications" class="notification-dropdown">
      <div class="notification-dropdown__header">
        <h3>Recent Notifications</h3>
        <button @click="clearAllNotifications">Clear All</button>
      </div>

      <div class="notification-dropdown__list">
        <div
          v-for="notification in notifications.slice(0, 10)"
          :key="notification.id"
          class="notification-item"
        >
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
          <small>{{ formatTime(notification.timestamp) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGlobalSocket } from './useSocket'
import NotificationToast from './NotificationToast.vue'
import NotificationBell from './NotificationBell.vue'
import NotificationPreferences from './NotificationPreferences.vue'

// Mock user data - in a real app, this would come from your auth store
const currentUser = ref({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  role: 'STAFF' as const
})

// Mock auth token - in a real app, this would come from your auth store
const authToken = ref('your-jwt-token-here')

// Local state
const showNotifications = ref(false)
const currentView = ref('schedule')

// Initialize socket connection
onMounted(() => {
  if (currentUser.value && authToken.value) {
    // Initialize the global socket instance
    useGlobalSocket(currentUser.value, authToken.value)
  }
})

// Get socket composable instance
const socketComposable = useGlobalSocket()

if (!socketComposable) {
  throw new Error('Socket not initialized')
}

const {
  connected,
  notifications,
  scheduleNeedsRefresh,
  hasUnreadNotifications,
  unreadNotifications,
  clearAllNotifications,
  markScheduleAsRefreshed,
  addNotification
} = socketComposable

// Helper functions
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date)
}

// Test function to manually trigger notifications
const triggerTestNotification = () => {
  addNotification({
    type: 'info',
    title: 'Test Notification',
    message: 'This is a test notification to verify the system is working.',
    actions: [
      {
        label: 'Dismiss',
        handler: () => console.log('Test notification dismissed')
      }
    ]
  })
}

// Navigation (in a real app, you'd use Vue Router)
const navigateToView = (view: string) => {
  currentView.value = view
  showNotifications.value = false
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1f2937;
  color: white;
}

.connection-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connection-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.connection-dot--connected {
  background-color: #10b981;
}

.connection-dot--disconnected {
  background-color: #ef4444;
}

.connection-text {
  font-size: 14px;
  color: #d1d5db;
}

.notification-bell {
  position: relative;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.notification-bell:hover {
  background: rgba(255, 255, 255, 0.1);
}

.notification-bell--has-unread {
  animation: bell-shake 0.5s ease-in-out;
}

.notification-count {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 8px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-main {
  min-height: calc(100vh - 80px);
  padding: 2rem;
}

.notification-dropdown {
  position: fixed;
  top: 70px;
  right: 20px;
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 9998;
  max-height: 400px;
  overflow-y: auto;
}

.notification-dropdown__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.notification-dropdown__header h3 {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
}

.notification-dropdown__header button {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 12px;
}

.notification-dropdown__list {
  padding: 8px 0;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item strong {
  font-size: 14px;
  color: #1f2937;
  display: block;
  margin-bottom: 4px;
}

.notification-item p {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.notification-item small {
  font-size: 11px;
  color: #9ca3af;
}

@keyframes bell-shake {
  0%, 50%, 100% { transform: rotate(0); }
  10%, 30% { transform: rotate(-10deg); }
  20%, 40% { transform: rotate(10deg); }
}
</style>