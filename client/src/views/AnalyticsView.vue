<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Analytics</h1>
          <v-btn
            color="primary"
            variant="outlined"
            @click="refreshAllData"
            :loading="refreshing"
          >
            <v-icon class="me-1">mdi-refresh</v-icon>
            Refresh Data
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Week Selector -->
    <v-card class="mb-6">
      <v-card-text>
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-btn
              icon
              variant="text"
              @click="previousWeek"
            >
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <div class="mx-4">
              <h3 class="text-h6">{{ formatWeekRange(selectedWeekStart) }}</h3>
              <p class="text-caption text-grey">{{ getWeekDescription(selectedWeekStart) }}</p>
            </div>
            <v-btn
              icon
              variant="text"
              @click="nextWeek"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <v-btn
            variant="outlined"
            @click="goToCurrentWeek"
            :disabled="isCurrentWeek"
          >
            <v-icon class="me-1">mdi-calendar-today</v-icon>
            Current Week
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Hours Chart -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6 d-flex align-center">
            <v-icon class="me-2">mdi-chart-bar</v-icon>
            Weekly Hours by Staff Member
            <v-spacer />
            <v-chip color="success" size="small" class="me-2">
              <v-icon start size="14">mdi-circle</v-icon>
              &lt; 35h
            </v-chip>
            <v-chip color="warning" size="small" class="me-2">
              <v-icon start size="14">mdi-circle</v-icon>
              35-40h
            </v-chip>
            <v-chip color="error" size="small">
              <v-icon start size="14">mdi-circle</v-icon>
              &gt; 40h
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div v-if="hoursLoading" class="text-center py-8">
              <v-progress-circular size="48" indeterminate color="primary" />
              <p class="mt-3 text-grey">Loading hours data...</p>
            </div>

            <div v-else-if="hoursData.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-chart-bar</v-icon>
              <h3 class="text-h6 mt-4 text-grey">No hours data available</h3>
              <p class="text-body-2 text-grey">No staff hours recorded for this week.</p>
            </div>

            <div v-else style="position: relative; height: 400px;">
              <Bar
                :data="chartData"
                :options="chartOptions"
              />
            </div>

            <!-- Hours Summary -->
            <div v-if="hoursData.length > 0" class="mt-4">
              <v-row>
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="success">
                    <v-card-text class="text-center">
                      <div class="text-h6">{{ staffUnder35h }}</div>
                      <div class="text-caption">Staff under 35h</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="warning">
                    <v-card-text class="text-center">
                      <div class="text-h6">{{ staff35to40h }}</div>
                      <div class="text-caption">Staff 35-40h</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="4">
                  <v-card variant="tonal" color="error">
                    <v-card-text class="text-center">
                      <div class="text-h6">{{ staffOver40h }}</div>
                      <div class="text-caption">Staff over 40h</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Fairness Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6 d-flex align-center">
            <v-icon class="me-2">mdi-scale-balance</v-icon>
            Premium Shifts Fairness
            <v-spacer />
            <v-tooltip text="Friday and Saturday evening shifts (after 6 PM)">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" color="grey">mdi-information</v-icon>
              </template>
            </v-tooltip>
          </v-card-title>

          <v-card-text>
            <div v-if="fairnessLoading" class="text-center py-8">
              <v-progress-circular size="48" indeterminate color="primary" />
              <p class="mt-3 text-grey">Loading fairness data...</p>
            </div>

            <div v-else-if="fairnessData.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-scale-balance</v-icon>
              <h3 class="text-h6 mt-4 text-grey">No fairness data available</h3>
              <p class="text-body-2 text-grey">No premium shifts recorded for analysis.</p>
            </div>

            <v-data-table
              v-else
              :headers="fairnessHeaders"
              :items="fairnessData"
              :items-per-page="25"
              :sort-by="[{ key: 'fairnessScore', order: 'desc' }]"
              class="elevation-1"
            >
              <!-- Staff Name -->
              <template v-slot:item.staffName="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" color="primary" class="me-2">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ item.staffName }}</div>
                    <div class="text-caption text-grey">{{ item.skill }}</div>
                  </div>
                </div>
              </template>

              <!-- Friday Shifts -->
              <template v-slot:item.fridayShifts="{ item }">
                <v-chip
                  size="small"
                  :color="item.fridayShifts > 0 ? 'primary' : 'grey'"
                  variant="tonal"
                >
                  {{ item.fridayShifts }}
                </v-chip>
              </template>

              <!-- Saturday Shifts -->
              <template v-slot:item.saturdayShifts="{ item }">
                <v-chip
                  size="small"
                  :color="item.saturdayShifts > 0 ? 'primary' : 'grey'"
                  variant="tonal"
                >
                  {{ item.saturdayShifts }}
                </v-chip>
              </template>

              <!-- Total Premium Shifts -->
              <template v-slot:item.totalPremiumShifts="{ item }">
                <v-chip
                  size="small"
                  :color="getPremiumShiftsColor(item.totalPremiumShifts)"
                  variant="flat"
                >
                  {{ item.totalPremiumShifts }}
                </v-chip>
              </template>

              <!-- Fairness Score -->
              <template v-slot:item.fairnessScore="{ item }">
                <div class="d-flex align-center">
                  <v-progress-linear
                    :model-value="item.fairnessScore"
                    :color="getFairnessColor(item.fairnessScore)"
                    height="8"
                    class="me-3"
                    style="min-width: 80px;"
                  />
                  <span class="font-weight-medium">{{ item.fairnessScore.toFixed(1) }}%</span>
                </div>
              </template>

              <!-- Last Premium Shift -->
              <template v-slot:item.lastPremiumShift="{ item }">
                <span v-if="item.lastPremiumShift" class="text-caption">
                  {{ formatDate(item.lastPremiumShift) }}
                </span>
                <span v-else class="text-caption text-grey">Never</span>
              </template>
            </v-data-table>

            <!-- Fairness Summary -->
            <div v-if="fairnessData.length > 0" class="mt-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">{{ averageFairnessScore.toFixed(1) }}%</div>
                      <div class="text-caption text-grey">Average Fairness Score</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="outlined">
                    <v-card-text>
                      <div class="text-h6">{{ totalPremiumShifts }}</div>
                      <div class="text-caption text-grey">Total Premium Shifts</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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
import { startOfWeek, addWeeks, addDays, format, isSameWeek } from 'date-fns'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import api from '../api/axios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface HoursData {
  staffId: number
  staffName: string
  hours: number
  skill: string
}

interface FairnessData {
  staffId: number
  staffName: string
  skill: string
  fridayShifts: number
  saturdayShifts: number
  totalPremiumShifts: number
  fairnessScore: number
  lastPremiumShift?: string
}

const selectedWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 1 }))
const refreshing = ref(false)

// Hours data
const hoursLoading = ref(true)
const hoursData = ref<HoursData[]>([])

// Fairness data
const fairnessLoading = ref(true)
const fairnessData = ref<FairnessData[]>([])

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const fairnessHeaders = [
  { title: 'Staff Member', key: 'staffName', sortable: true },
  { title: 'Friday Shifts', key: 'fridayShifts', sortable: true, align: 'center' },
  { title: 'Saturday Shifts', key: 'saturdayShifts', sortable: true, align: 'center' },
  { title: 'Total Premium', key: 'totalPremiumShifts', sortable: true, align: 'center' },
  { title: 'Fairness Score', key: 'fairnessScore', sortable: true },
  { title: 'Last Premium Shift', key: 'lastPremiumShift', sortable: true }
]

const isCurrentWeek = computed(() => {
  return isSameWeek(selectedWeekStart.value, new Date(), { weekStartsOn: 1 })
})

const staffUnder35h = computed(() => {
  return hoursData.value.filter(staff => staff.hours < 35).length
})

const staff35to40h = computed(() => {
  return hoursData.value.filter(staff => staff.hours >= 35 && staff.hours <= 40).length
})

const staffOver40h = computed(() => {
  return hoursData.value.filter(staff => staff.hours > 40).length
})

const averageFairnessScore = computed(() => {
  if (fairnessData.value.length === 0) return 0
  const total = fairnessData.value.reduce((sum, staff) => sum + staff.fairnessScore, 0)
  return total / fairnessData.value.length
})

const totalPremiumShifts = computed(() => {
  return fairnessData.value.reduce((sum, staff) => sum + staff.totalPremiumShifts, 0)
})

const chartData = computed(() => {
  return {
    labels: hoursData.value.map(staff => staff.staffName),
    datasets: [
      {
        label: 'Weekly Hours',
        data: hoursData.value.map(staff => staff.hours),
        backgroundColor: hoursData.value.map(staff => {
          if (staff.hours > 40) return '#f44336' // red
          if (staff.hours >= 35) return '#ff9800' // amber
          return '#4caf50' // green
        }),
        borderColor: hoursData.value.map(staff => {
          if (staff.hours > 40) return '#d32f2f'
          if (staff.hours >= 35) return '#f57c00'
          return '#388e3c'
        }),
        borderWidth: 1
      }
    ]
  }
})

const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const staff = hoursData.value[context.dataIndex]
            return [
              `Hours: ${staff.hours}h`,
              `Skill: ${staff.skill}`,
              staff.hours > 40 ? 'Status: Over 40h limit' :
              staff.hours >= 35 ? 'Status: Over 35h' : 'Status: Within limits'
            ]
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        },
        grid: {
          color: (context: any) => {
            if (context.tick.value === 35) return '#ff9800'
            if (context.tick.value === 40) return '#f44336'
            return '#e0e0e0'
          },
          lineWidth: (context: any) => {
            if (context.tick.value === 35 || context.tick.value === 40) return 2
            return 1
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Staff Members'
        }
      }
    }
  }
})

async function fetchHoursData() {
  try {
    hoursLoading.value = true
    const response = await api.get('/api/analytics/hours', {
      params: {
        weekStart: format(selectedWeekStart.value, 'yyyy-MM-dd')
      }
    })
    hoursData.value = response.data
  } catch (error) {
    console.error('Failed to fetch hours data:', error)
    showMessage('Failed to load hours data', 'error')
  } finally {
    hoursLoading.value = false
  }
}

async function fetchFairnessData() {
  try {
    fairnessLoading.value = true
    const response = await api.get('/api/analytics/fairness')
    fairnessData.value = response.data
  } catch (error) {
    console.error('Failed to fetch fairness data:', error)
    showMessage('Failed to load fairness data', 'error')
  } finally {
    fairnessLoading.value = false
  }
}

function getPremiumShiftsColor(count: number): string {
  if (count === 0) return 'grey'
  if (count <= 2) return 'success'
  if (count <= 4) return 'warning'
  return 'error'
}

function getFairnessColor(score: number): string {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'error'
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  const startStr = format(weekStart, 'MMM d')
  const endStr = format(weekEnd, 'MMM d, yyyy')
  return `${startStr} - ${endStr}`
}

function getWeekDescription(weekStart: Date): string {
  if (isSameWeek(weekStart, new Date(), { weekStartsOn: 1 })) {
    return 'Current week'
  } else if (isSameWeek(weekStart, addWeeks(new Date(), 1), { weekStartsOn: 1 })) {
    return 'Next week'
  } else if (isSameWeek(weekStart, addWeeks(new Date(), -1), { weekStartsOn: 1 })) {
    return 'Last week'
  }
  return ''
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

function previousWeek() {
  selectedWeekStart.value = addWeeks(selectedWeekStart.value, -1)
  fetchHoursData()
}

function nextWeek() {
  selectedWeekStart.value = addWeeks(selectedWeekStart.value, 1)
  fetchHoursData()
}

function goToCurrentWeek() {
  selectedWeekStart.value = startOfWeek(new Date(), { weekStartsOn: 1 })
  fetchHoursData()
}

async function refreshAllData() {
  try {
    refreshing.value = true
    await Promise.all([
      fetchHoursData(),
      fetchFairnessData()
    ])
    showMessage('All data refreshed', 'success')
  } finally {
    refreshing.value = false
  }
}

function showMessage(message: string, color: string = 'success') {
  snackbar.value = { show: true, message, color }
}

onMounted(async () => {
  await Promise.all([
    fetchHoursData(),
    fetchFairnessData()
  ])
})
</script>