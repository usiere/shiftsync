<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">My Profile</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text class="text-center py-8">
            <div class="profile-avatar mx-auto mb-4">
              {{ initials }}
            </div>
            <div class="text-h6">{{ authStore.userName || 'Unknown User' }}</div>
            <div class="text-body-2 text-medium-emphasis mb-2">
              {{ authStore.user?.email || '—' }}
            </div>
            <v-chip
              :color="roleColor"
              size="small"
              variant="tonal"
            >
              {{ authStore.userRole || 'STAFF' }}
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-account-details</v-icon>
            Account details
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-list density="comfortable">
              <v-list-item>
                <template #prepend>
                  <v-icon size="20" class="me-3">mdi-identifier</v-icon>
                </template>
                <v-list-item-title>User ID</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.userId ?? '—' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon size="20" class="me-3">mdi-account</v-icon>
                </template>
                <v-list-item-title>Full name</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.userName || '—' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon size="20" class="me-3">mdi-email</v-icon>
                </template>
                <v-list-item-title>Email</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.user?.email || '—' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon size="20" class="me-3">mdi-shield-account</v-icon>
                </template>
                <v-list-item-title>Role</v-list-item-title>
                <v-list-item-subtitle>{{ authStore.userRole || '—' }}</v-list-item-subtitle>
              </v-list-item>

              <v-list-item v-if="sessionExpires">
                <template #prepend>
                  <v-icon size="20" class="me-3">mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>Session expires</v-list-item-title>
                <v-list-item-subtitle>{{ sessionExpires }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card class="mt-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-cog-outline</v-icon>
            Quick actions
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-btn
              variant="tonal"
              color="primary"
              class="me-2 mb-2"
              prepend-icon="mdi-bell-cog"
              to="/settings"
            >
              Notification settings
            </v-btn>
            <v-btn
              variant="tonal"
              color="error"
              class="mb-2"
              prepend-icon="mdi-logout"
              @click="logout"
            >
              Sign out
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const initials = computed(() => {
  const name = authStore.userName
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const roleColor = computed(() => {
  switch ((authStore.userRole || '').toUpperCase()) {
    case 'ADMIN': return 'error'
    case 'MANAGER': return 'warning'
    case 'STAFF': return 'info'
    default: return 'primary'
  }
})

const sessionExpires = computed(() => {
  const exp = authStore.user?.exp
  if (!exp) return null
  const d = new Date(exp * 1000)
  return d.toLocaleString()
})

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.profile-avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: #0F172A;
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}
</style>
