<template>
  <div>
    <v-row>
      <v-col cols="12">
        <p class="date-line">{{ currentDate }}</p>
        <h1 class="page-title">Dashboard</h1>
      </v-col>
    </v-row>

    <!-- Loading state for stats -->
    <v-row v-if="statsLoading">
      <v-col cols="12" md="6" lg="3" v-for="i in 4" :key="i">
        <v-card>
          <v-card-text>
            <v-skeleton-loader type="card" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row v-else class="mb-6">
      <v-col cols="12" md="6" lg="3">
        <div class="stat-card">
          <div class="stat-label">TOTAL STAFF</div>
          <div class="stat-number">{{ stats.totalStaff }}</div>
          <v-icon class="stat-icon" size="20" color="#CBD5E1">mdi-account-group</v-icon>
          <div class="stat-trend stat-trend--up">+2.3% from last month</div>
        </div>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <div class="stat-card">
          <div class="stat-label">SHIFTS THIS WEEK</div>
          <div class="stat-number">{{ stats.shiftsThisWeek }}</div>
          <v-icon class="stat-icon" size="20" color="#CBD5E1">mdi-calendar-week</v-icon>
          <div class="stat-trend stat-trend--up">+12% from last week</div>
        </div>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <div class="stat-card">
          <div class="stat-label">PENDING SWAPS</div>
          <div class="stat-number">{{ stats.pendingSwaps }}</div>
          <v-icon class="stat-icon" size="20" color="#CBD5E1">mdi-swap-horizontal</v-icon>
          <div class="stat-trend stat-trend--down">-5% from last week</div>
        </div>
      </v-col>

      <v-col cols="12" md="6" lg="3">
        <div class="stat-card">
          <div class="stat-label">OVERTIME ALERTS</div>
          <div class="stat-number">{{ stats.overtimeAlerts }}</div>
          <v-icon class="stat-icon" size="20" color="#CBD5E1">mdi-alert</v-icon>
          <div class="attention-tag">Needs attention</div>
        </div>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row>
      <v-col cols="12">
        <div class="activity-section">
          <h2 class="activity-title">Recent Activity</h2>

          <div v-if="activityLoading" class="activity-loading">
            <v-skeleton-loader type="list-item-two-line" v-for="i in 5" :key="i" class="ma-4" />
          </div>

          <div v-else-if="recentActivity.length > 0" class="activity-list">
            <div
              v-for="(activity, index) in recentActivity"
              :key="activity.id"
              class="activity-item"
              :class="{ 'activity-item--border': index < recentActivity.length - 1 }"
            >
              <div class="activity-icon">
                <v-icon size="20" :color="getSoftActivityColor(activity.action)">
                  {{ getActivityIcon(activity.action) }}
                </v-icon>
              </div>

              <div class="activity-content">
                <div class="activity-action">{{ activity.action }}</div>
                <div class="activity-description">{{ activity.details }}</div>
              </div>

              <div class="activity-meta">
                <div class="activity-time">{{ formatTime(activity.timestamp) }}</div>
                <div class="activity-user">User {{ activity.userId }}</div>
              </div>
            </div>
          </div>

          <div v-else class="activity-empty">
            <v-icon size="32" color="#94A3B8" class="mb-4">mdi-history</v-icon>
            <div class="empty-title">No recent activity</div>
            <div class="empty-description">Activity will appear here when actions are performed</div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Error handling -->
    <v-snackbar v-model="errorSnackbar" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="errorSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

const authStore = useAuthStore()

interface DashboardStats {
  totalStaff: number
  shiftsThisWeek: number
  pendingSwaps: number
  overtimeAlerts: number
}

interface AuditLog {
  id: number
  action: string
  details: string
  userId: number
  timestamp: string
}

const statsLoading = ref(true)
const activityLoading = ref(true)
const errorSnackbar = ref(false)
const errorMessage = ref('')

const stats = ref<DashboardStats>({
  totalStaff: 0,
  shiftsThisWeek: 0,
  pendingSwaps: 0,
  overtimeAlerts: 0
})

const recentActivity = ref<AuditLog[]>([])

const currentDate = computed(() => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }
  return new Date().toLocaleDateString('en-US', options)
})

async function fetchDashboardStats() {
  try {
    statsLoading.value = true
    const response = await api.get('/api/dashboard/stats')
    stats.value = response.data
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    showError('Failed to load dashboard statistics')
  } finally {
    statsLoading.value = false
  }
}

async function fetchRecentActivity() {
  try {
    activityLoading.value = true
    const response = await api.get('/api/audit-logs?limit=5')
    recentActivity.value = response.data
  } catch (error) {
    console.error('Failed to fetch recent activity:', error)
    showError('Failed to load recent activity')
  } finally {
    activityLoading.value = false
  }
}

function getActivityIcon(action: string): string {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('login')) return 'mdi-login'
  if (actionLower.includes('logout')) return 'mdi-logout'
  if (actionLower.includes('create')) return 'mdi-plus'
  if (actionLower.includes('update') || actionLower.includes('edit')) return 'mdi-pencil'
  if (actionLower.includes('delete')) return 'mdi-delete'
  if (actionLower.includes('publish')) return 'mdi-publish'
  if (actionLower.includes('swap')) return 'mdi-swap-horizontal'
  return 'mdi-information'
}

function getActivityColor(action: string): string {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('delete')) return 'error'
  if (actionLower.includes('create') || actionLower.includes('publish')) return 'success'
  if (actionLower.includes('update') || actionLower.includes('edit')) return 'warning'
  return 'primary'
}

function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString()
}

function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric'
  })
}

function getSoftActivityColor(action: string): string {
  const actionLower = action.toLowerCase()
  if (actionLower.includes('delete')) return '#EF4444'
  if (actionLower.includes('create') || actionLower.includes('publish')) return '#10B981'
  if (actionLower.includes('update') || actionLower.includes('edit')) return '#F59E0B'
  return '#2563EB'
}

function showError(message: string) {
  errorMessage.value = message
  errorSnackbar.value = true
}

onMounted(async () => {
  await Promise.all([
    fetchDashboardStats(),
    fetchRecentActivity()
  ])
})
</script>

<style scoped>
/* Page Header */
.date-line {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  color: #94A3B8;
  margin: 0 0 8px 0;
}

.page-title {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 30px;
  color: #0F172A;
  margin: 0 0 32px 0;
}

/* Stat Cards */
.stat-card {
  background: white;
  border: 1px solid #E8ECEF;
  border-radius: 14px;
  padding: 20px 24px;
  position: relative;
  transition: all 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94A3B8;
  margin-bottom: 12px;
}

.stat-number {
  font-family: 'DM Sans', sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1;
  margin-bottom: 16px;
}

.stat-icon {
  position: absolute;
  top: 20px;
  right: 24px;
}

.stat-trend {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 400;
}

.stat-trend--up {
  color: #10B981;
}

.stat-trend--down {
  color: #EF4444;
}

.attention-tag {
  background: #FEF2F2;
  color: #DC2626;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

/* Recent Activity */
.activity-section {
  margin-top: 32px;
}

.activity-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 24px;
}

.activity-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  min-height: 64px;
  padding: 16px 20px;
  transition: background-color 0.2s ease-in-out;
}

.activity-item:hover {
  background: #F8F9FB;
}

.activity-item--border {
  border-bottom: 1px solid #F1F5F9;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-action {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
  line-height: 1.4;
  margin-bottom: 2px;
}

.activity-description {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #94A3B8;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-meta {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16px;
}

.activity-time {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #CBD5E1;
  margin-bottom: 2px;
}

.activity-user {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #94A3B8;
}

/* Empty State */
.activity-empty {
  background: white;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
}

.empty-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 8px;
}

.empty-description {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #94A3B8;
  max-width: 280px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Loading State */
.activity-loading {
  background: white;
  border-radius: 12px;
  padding: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page-title {
    font-size: 24px;
  }

  .stat-number {
    font-size: 32px;
  }

  .stat-card {
    padding: 16px 20px;
  }

  .activity-item {
    min-height: 56px;
    padding: 12px 16px;
  }

  .activity-icon {
    width: 28px;
    height: 28px;
    margin-right: 12px;
  }
}
</style>