<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :temporary="isMobile"
      :permanent="!isMobile"
      app
    >
      <v-list-item class="px-2">
        <template v-slot:prepend>
          <v-avatar color="primary">
            <v-icon color="white">mdi-calendar-clock</v-icon>
          </v-avatar>
        </template>
        <v-list-item-title class="text-h6">
          ShiftSync
        </v-list-item-title>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon
        v-if="isMobile"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>

      <v-toolbar-title>{{ currentPageTitle }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Notification Bell -->
      <v-btn
        icon
        :to="{ name: 'Notifications' }"
        class="me-2"
      >
        <v-badge
          :content="unreadCount"
          :model-value="unreadCount > 0"
          color="error"
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>

      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            class="me-2"
          >
            <v-avatar size="32" color="primary">
              <span class="text-white">{{ authStore.userInitials }}</span>
            </v-avatar>
          </v-btn>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title>{{ authStore.userFullName }}</v-list-item-title>
            <v-list-item-subtitle>{{ authStore.user?.role }}</v-list-item-subtitle>
          </v-list-item>

          <v-divider></v-divider>

          <v-list-item @click="handleLogout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const { mobile } = useDisplay()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const drawer = ref(!mobile.value)
const unreadCount = ref(0)

const isMobile = computed(() => mobile.value)

// Navigation items based on user role
const navigationItems = computed(() => {
  const user = authStore.user
  if (!user) return []

  const items = []

  // Admin sees all routes
  if (user.role === 'ADMIN') {
    items.push(
      { title: 'Dashboard', to: '/dashboard', icon: 'mdi-view-dashboard' },
      { title: 'Shifts', to: '/shifts', icon: 'mdi-calendar-multiple' },
      { title: 'Schedule', to: '/schedule', icon: 'mdi-calendar' },
      { title: 'Swap Requests', to: '/swap-requests', icon: 'mdi-swap-horizontal' },
      { title: 'Notifications', to: '/notifications', icon: 'mdi-bell' },
      { title: 'Analytics', to: '/analytics', icon: 'mdi-chart-line' }
    )
  }
  // Manager sees shifts/schedule/swap-requests/analytics/notifications
  else if (user.role === 'MANAGER') {
    items.push(
      { title: 'Shifts', to: '/shifts', icon: 'mdi-calendar-multiple' },
      { title: 'Schedule', to: '/schedule', icon: 'mdi-calendar' },
      { title: 'Swap Requests', to: '/swap-requests', icon: 'mdi-swap-horizontal' },
      { title: 'Analytics', to: '/analytics', icon: 'mdi-chart-line' },
      { title: 'Notifications', to: '/notifications', icon: 'mdi-bell' }
    )
  }
  // Staff sees schedule/swap-requests/notifications
  else if (user.role === 'STAFF') {
    items.push(
      { title: 'Schedule', to: '/schedule', icon: 'mdi-calendar' },
      { title: 'Swap Requests', to: '/swap-requests', icon: 'mdi-swap-horizontal' },
      { title: 'Notifications', to: '/notifications', icon: 'mdi-bell' }
    )
  }

  return items
})

const currentPageTitle = computed(() => {
  const item = navigationItems.value.find(item => item.to === route.path)
  return item?.title || route.meta.title || 'ShiftSync'
})

const fetchUnreadCount = async () => {
  try {
    const response = await api.get('/api/notifications/unread-count')
    unreadCount.value = response.data.count || 0
  } catch (error) {
    console.error('Failed to fetch unread notifications count:', error)
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  // Fetch unread notifications count on mount
  fetchUnreadCount()

  // Refetch every 30 seconds
  setInterval(fetchUnreadCount, 30000)
})
</script>

<style scoped>
.v-navigation-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}
</style>