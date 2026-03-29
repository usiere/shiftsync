<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Analytics</h1>
        <p class="text-subtitle-1">Workforce insights and performance metrics</p>
      </v-col>
      <v-col cols="auto">
        <v-btn-group variant="outlined" mandatory>
          <v-btn
            :class="{ 'text-primary': timeRange === 'week' }"
            @click="timeRange = 'week'"
          >
            Week
          </v-btn>
          <v-btn
            :class="{ 'text-primary': timeRange === 'month' }"
            @click="timeRange = 'month'"
          >
            Month
          </v-btn>
          <v-btn
            :class="{ 'text-primary': timeRange === 'quarter' }"
            @click="timeRange = 'quarter'"
          >
            Quarter
          </v-btn>
        </v-btn-group>
      </v-col>
    </v-row>

    <!-- Key Metrics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center">
          <v-card-text>
            <v-icon size="40" color="primary" class="mb-2">mdi-clock</v-icon>
            <div class="text-h4 font-weight-bold">1,248</div>
            <div class="text-subtitle-2">Total Hours Worked</div>
            <v-chip size="small" color="success" class="mt-2">
              <v-icon start>mdi-trending-up</v-icon>
              +12%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center">
          <v-card-text>
            <v-icon size="40" color="warning" class="mb-2">mdi-clock-alert</v-icon>
            <div class="text-h4 font-weight-bold">64</div>
            <div class="text-subtitle-2">Overtime Hours</div>
            <v-chip size="small" color="error" class="mt-2">
              <v-icon start>mdi-trending-up</v-icon>
              +8%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center">
          <v-card-text>
            <v-icon size="40" color="success" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h4 font-weight-bold">96.2%</div>
            <div class="text-subtitle-2">Attendance Rate</div>
            <v-chip size="small" color="success" class="mt-2">
              <v-icon start>mdi-trending-up</v-icon>
              +2%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="text-center">
          <v-card-text>
            <v-icon size="40" color="info" class="mb-2">mdi-swap-horizontal</v-icon>
            <div class="text-h4 font-weight-bold">23</div>
            <div class="text-subtitle-2">Shift Swaps</div>
            <v-chip size="small" color="warning" class="mt-2">
              <v-icon start>mdi-trending-down</v-icon>
              -5%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <!-- Hours Distribution Chart -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title>Hours Distribution</v-card-title>
          <v-card-text>
            <div class="chart-placeholder">
              <v-icon size="64" color="grey-lighten-2">mdi-chart-bar</v-icon>
              <p class="text-center text-grey mt-4">Chart visualization would go here</p>
              <p class="text-caption text-center text-grey">
                Regular Hours: 1,184 | Overtime: 64 | Break Time: 148
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Department Breakdown -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Department Hours</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="dept in departmentData"
                :key="dept.name"
                class="px-0"
              >
                <v-list-item-title class="d-flex justify-space-between">
                  <span>{{ dept.name }}</span>
                  <span class="font-weight-bold">{{ dept.hours }}h</span>
                </v-list-item-title>
                <v-progress-linear
                  :model-value="dept.percentage"
                  :color="dept.color"
                  height="4"
                  class="mt-1"
                ></v-progress-linear>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <!-- Attendance Trends -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Attendance Trends</v-card-title>
          <v-card-text>
            <div class="chart-placeholder">
              <v-icon size="64" color="grey-lighten-2">mdi-chart-line</v-icon>
              <p class="text-center text-grey mt-4">Line chart for attendance trends</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Top Performers -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Top Performers</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="(performer, index) in topPerformers"
                :key="performer.id"
                class="px-0"
              >
                <template v-slot:prepend>
                  <v-avatar :color="getRankColor(index)" size="32">
                    <span class="text-white font-weight-bold">{{ index + 1 }}</span>
                  </v-avatar>
                </template>
                
                <v-list-item-title>{{ performer.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ performer.department }} • {{ performer.hours }}h • {{ performer.score }}% score
                </v-list-item-subtitle>
                
                <template v-slot:append>
                  <v-chip size="small" :color="getRankColor(index)" variant="tonal">
                    {{ performer.badge }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detailed Analytics Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <span>Employee Analytics</span>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search employees..."
              variant="outlined"
              hide-details
              density="compact"
              style="max-width: 300px;"
            ></v-text-field>
          </v-card-title>
          
          <v-data-table
            :headers="employeeHeaders"
            :items="employeeAnalytics"
            :search="search"
            item-value="id"
            class="elevation-0"
          >
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="me-2">
                  <span class="text-white">{{ getInitials(item.name) }}</span>
                </v-avatar>
                {{ item.name }}
              </div>
            </template>
            
            <template v-slot:item.attendanceRate="{ item }">
              <div class="d-flex align-center">
                <v-progress-circular
                  :model-value="item.attendanceRate"
                  size="24"
                  width="3"
                  :color="getAttendanceColor(item.attendanceRate)"
                  class="me-2"
                ></v-progress-circular>
                {{ item.attendanceRate }}%
              </div>
            </template>
            
            <template v-slot:item.performance="{ item }">
              <v-chip
                :color="getPerformanceColor(item.performance)"
                size="small"
                variant="tonal"
              >
                {{ item.performance }}
              </v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const timeRange = ref('month')
const search = ref('')

const departmentData = ref([
  { name: 'Customer Service', hours: 420, percentage: 85, color: 'primary' },
  { name: 'Sales', hours: 380, percentage: 76, color: 'success' },
  { name: 'Operations', hours: 310, percentage: 62, color: 'warning' },
  { name: 'HR', hours: 138, percentage: 28, color: 'info' }
])

const topPerformers = ref([
  {
    id: 1,
    name: 'Sarah Wilson',
    department: 'Customer Service',
    hours: 42,
    score: 98,
    badge: 'Excellence'
  },
  {
    id: 2,
    name: 'Mike Johnson',
    department: 'Sales',
    hours: 41,
    score: 95,
    badge: 'Outstanding'
  },
  {
    id: 3,
    name: 'Jane Smith',
    department: 'Operations',
    hours: 40,
    score: 92,
    badge: 'High Performer'
  }
])

const employeeHeaders = [
  { title: 'Employee', key: 'name', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Hours Worked', key: 'hoursWorked', sortable: true },
  { title: 'Overtime', key: 'overtime', sortable: true },
  { title: 'Attendance', key: 'attendanceRate', sortable: true },
  { title: 'Performance', key: 'performance', sortable: true }
]

const employeeAnalytics = ref([
  {
    id: 1,
    name: 'Sarah Wilson',
    department: 'Customer Service',
    hoursWorked: 168,
    overtime: 8,
    attendanceRate: 98,
    performance: 'Excellent'
  },
  {
    id: 2,
    name: 'Mike Johnson',
    department: 'Sales',
    hoursWorked: 164,
    overtime: 4,
    attendanceRate: 95,
    performance: 'Good'
  },
  {
    id: 3,
    name: 'Jane Smith',
    department: 'Operations',
    hoursWorked: 160,
    overtime: 0,
    attendanceRate: 100,
    performance: 'Excellent'
  },
  {
    id: 4,
    name: 'John Doe',
    department: 'HR',
    hoursWorked: 156,
    overtime: 12,
    attendanceRate: 88,
    performance: 'Average'
  }
])

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getRankColor = (index: number) => {
  switch (index) {
    case 0: return 'gold'
    case 1: return 'grey-darken-1'
    case 2: return 'brown'
    default: return 'primary'
  }
}

const getAttendanceColor = (rate: number) => {
  if (rate >= 95) return 'success'
  if (rate >= 85) return 'warning'
  return 'error'
}

const getPerformanceColor = (performance: string) => {
  switch (performance) {
    case 'Excellent': return 'success'
    case 'Good': return 'primary'
    case 'Average': return 'warning'
    case 'Poor': return 'error'
    default: return 'grey'
  }
}
</script>

<style scoped>
.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background-color: #fafafa;
}
</style>