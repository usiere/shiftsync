<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Dashboard</h1>
        <p class="text-subtitle-1">System overview and metrics</p>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      dismissible
      @click:close="error = null"
    >
      Failed to load dashboard data: {{ error }}
    </v-alert>

    <v-row>
      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="40" color="primary" class="me-3">
                mdi-account-group
              </v-icon>
              <div>
                <div class="text-h5 font-weight-bold">
                  <v-skeleton-loader v-if="loading" type="text" width="40"></v-skeleton-loader>
                  <span v-else>{{ stats?.totalStaff || 0 }}</span>
                </div>
                <div class="text-subtitle-2">Total Staff</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="40" color="success" class="me-3">
                mdi-calendar-check
              </v-icon>
              <div>
                <div class="text-h5 font-weight-bold">
                  <v-skeleton-loader v-if="loading" type="text" width="40"></v-skeleton-loader>
                  <span v-else>{{ stats?.shiftsThisWeek || 0 }}</span>
                </div>
                <div class="text-subtitle-2">Shifts This Week</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="40" color="warning" class="me-3">
                mdi-swap-horizontal
              </v-icon>
              <div>
                <div class="text-h5 font-weight-bold">
                  <v-skeleton-loader v-if="loading" type="text" width="40"></v-skeleton-loader>
                  <span v-else>{{ stats?.pendingSwaps || 0 }}</span>
                </div>
                <div class="text-subtitle-2">Pending Swaps</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon size="40" color="error" class="me-3">
                mdi-clock-alert
              </v-icon>
              <div>
                <div class="text-h5 font-weight-bold">
                  <v-skeleton-loader v-if="loading" type="text" width="40"></v-skeleton-loader>
                  <span v-else>{{ stats?.overtimeHours || 0 }}</span>
                </div>
                <div class="text-subtitle-2">Overtime Hours</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Recent Activities</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(activity, index) in recentActivities"
                :key="index"
                :prepend-icon="activity.icon"
              >
                <v-list-item-title>{{ activity.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ activity.subtitle }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-list-item-action>
                    <v-chip size="small" :color="activity.color">
                      {{ activity.time }}
                    </v-chip>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>
          <v-card-text>
            <v-btn
              block
              class="mb-2"
              prepend-icon="mdi-calendar-plus"
              @click="$router.push('/shifts')"
            >
              Create Shift
            </v-btn>
            <v-btn
              block
              class="mb-2"
              prepend-icon="mdi-account-plus"
              variant="outlined"
            >
              Add Employee
            </v-btn>
            <v-btn
              block
              prepend-icon="mdi-chart-line"
              variant="outlined"
              @click="$router.push('/analytics')"
            >
              View Reports
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDashboardApi } from '@/composables/useApi'

const { stats, loading, error, fetchStats } = useDashboardApi()

const recentActivities = ref([
  {
    title: 'New shift swap request',
    subtitle: 'John Doe requested to swap with Jane Smith',
    icon: 'mdi-swap-horizontal',
    color: 'primary',
    time: '2m ago'
  },
  {
    title: 'Overtime approval needed',
    subtitle: 'Mike Johnson worked 45 hours this week',
    icon: 'mdi-clock-alert',
    color: 'warning',
    time: '15m ago'
  },
  {
    title: 'Schedule published',
    subtitle: 'Next week\'s schedule has been published',
    icon: 'mdi-calendar-check',
    color: 'success',
    time: '1h ago'
  },
  {
    title: 'New employee onboarded',
    subtitle: 'Sarah Wilson joined the team',
    icon: 'mdi-account-plus',
    color: 'info',
    time: '3h ago'
  }
])

onMounted(() => {
  fetchStats()
})
</script>