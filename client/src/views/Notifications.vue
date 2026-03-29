<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Notifications</h1>
        <p class="text-subtitle-1">Stay updated with important announcements</p>
      </v-col>
      <v-col cols="auto">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-check-all"
          @click="handleMarkAllAsRead"
        >
          Mark All Read
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col>
        <v-chip-group
          v-model="selectedFilter"
          selected-class="text-primary"
          mandatory
        >
          <v-chip value="all">All</v-chip>
          <v-chip value="unread">Unread</v-chip>
          <v-chip value="announcements">Announcements</v-chip>
          <v-chip value="shifts">Shifts</v-chip>
          <v-chip value="swaps">Swaps</v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      dismissible
    >
      Failed to load notifications: {{ error }}
    </v-alert>

    <v-card>
      <v-card-text class="pa-0">
        <!-- Loading State -->
        <v-skeleton-loader
          v-if="loading"
          type="list-item@5"
        ></v-skeleton-loader>

        <div v-else-if="filteredNotifications.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey">mdi-bell-outline</v-icon>
          <p class="text-h6 mt-4 mb-2">No notifications</p>
          <p class="text-subtitle-1 text-grey">You're all caught up!</p>
        </div>
        
        <v-list v-else>
          <template v-for="(notification, index) in filteredNotifications" :key="notification.id">
            <v-list-item
              :class="{ 'bg-blue-lighten-5': !notification.read }"
              @click="handleMarkAsRead(notification.id)"
            >
              <template v-slot:prepend>
                <v-avatar :color="getNotificationColor(notification.type)" size="40">
                  <v-icon :icon="getNotificationIcon(notification.type)" color="white"></v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="font-weight-medium">
                {{ notification.title }}
                <v-chip
                  v-if="!notification.read"
                  color="primary"
                  size="x-small"
                  class="ms-2"
                >
                  New
                </v-chip>
              </v-list-item-title>
              
              <v-list-item-subtitle class="mt-1">
                {{ notification.message }}
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <div class="text-caption text-grey">
                  {{ formatDate(notification.createdAt) }}
                </div>
              </template>
            </v-list-item>
            
            <v-divider v-if="index < filteredNotifications.length - 1"></v-divider>
          </template>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Load More Button -->
    <div v-if="hasMore" class="text-center mt-4">
      <v-btn
        variant="outlined"
        :loading="loading"
        @click="loadMore"
      >
        Load More
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useNotificationsApi } from '@/composables/useApi'

const selectedFilter = ref('all')
const hasMore = ref(true)

const {
  notifications: rawNotifications,
  loading,
  error,
  fetchNotifications,
  markAsRead,
  markAllAsRead: apiMarkAllAsRead
} = useNotificationsApi()

// Transform API data
const notifications = computed(() => {
  if (!rawNotifications.value) return []

  return rawNotifications.value.map((notification: any) => ({
    id: notification.id,
    type: notification.type.toLowerCase().replace('_', ''),
    title: notification.title,
    message: notification.message,
    read: notification.isRead,
    createdAt: new Date(notification.createdAt)
  }))
})

const notifications_old = ref([
  {
    id: 1,
    type: 'shift',
    title: 'Shift Assignment',
    message: 'You have been assigned a new shift for April 1st, 9:00 AM - 5:00 PM',
    read: false,
    createdAt: new Date('2024-03-29T10:30:00')
  },
  {
    id: 2,
    type: 'swap',
    title: 'Swap Request Approved',
    message: 'Your shift swap request for April 2nd has been approved by management',
    read: false,
    createdAt: new Date('2024-03-29T08:15:00')
  },
  {
    id: 3,
    type: 'announcement',
    title: 'Company Policy Update',
    message: 'New overtime policy will take effect starting April 1st. Please review the updated guidelines.',
    read: true,
    createdAt: new Date('2024-03-28T16:45:00')
  },
  {
    id: 4,
    type: 'shift',
    title: 'Schedule Published',
    message: 'Your schedule for next week has been published. Check your upcoming shifts.',
    read: true,
    createdAt: new Date('2024-03-28T14:20:00')
  },
  {
    id: 5,
    type: 'swap',
    title: 'New Swap Request',
    message: 'John Doe wants to swap shifts with you for April 5th',
    read: false,
    createdAt: new Date('2024-03-27T11:30:00')
  },
  {
    id: 6,
    type: 'announcement',
    title: 'Team Meeting',
    message: 'Monthly team meeting scheduled for April 10th at 2:00 PM in the conference room',
    read: true,
    createdAt: new Date('2024-03-26T09:00:00')
  }
])

const filteredNotifications = computed(() => {
  let filtered = notifications.value
  
  switch (selectedFilter.value) {
    case 'unread':
      filtered = notifications.value.filter(n => !n.read)
      break
    case 'announcements':
      filtered = notifications.value.filter(n => n.type === 'announcement')
      break
    case 'shifts':
      filtered = notifications.value.filter(n => n.type === 'shift')
      break
    case 'swaps':
      filtered = notifications.value.filter(n => n.type === 'swap')
      break
    default:
      filtered = notifications.value
  }
  
  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'shift': return 'mdi-calendar'
    case 'swap': return 'mdi-swap-horizontal'
    case 'announcement': return 'mdi-bullhorn'
    default: return 'mdi-bell'
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'shift': return 'primary'
    case 'swap': return 'warning'
    case 'announcement': return 'info'
    default: return 'grey'
  }
}

const formatDate = (date: Date) => {
  return formatDistanceToNow(date, { addSuffix: true })
}

const handleMarkAsRead = async (id: number) => {
  await markAsRead(id)
  // The computed property will automatically update when the API call completes
}

const handleMarkAllAsRead = async () => {
  await apiMarkAllAsRead()
  // Refresh the notifications list
  await fetchNotifications()
}

const loadMore = () => {
  // TODO: Implement pagination
  hasMore.value = false
}

onMounted(() => {
  fetchNotifications()
})
</script>

<style scoped>
.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>