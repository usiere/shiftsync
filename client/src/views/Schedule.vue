<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Schedule</h1>
        <p class="text-subtitle-1">View your upcoming shifts and schedule</p>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      dismissible
    >
      Failed to load schedule: {{ error }}
    </v-alert>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-calendar-today</v-icon>
            Today's Shifts
          </v-card-title>
          <v-card-text>
            <v-list v-if="todayShifts.length > 0">
              <v-list-item
                v-for="shift in todayShifts"
                :key="shift.id"
                :prepend-icon="getShiftIcon(shift.status)"
                class="mb-2"
              >
                <v-list-item-title>
                  {{ shift.startTime }} - {{ shift.endTime }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ shift.department }} • {{ shift.status }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip
                    :color="getStatusColor(shift.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ shift.status }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-4">
              <v-icon size="48" color="grey">mdi-calendar-blank</v-icon>
              <p class="text-subtitle-1 mt-2">No shifts today</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-clock</v-icon>
            This Week Summary
          </v-card-title>
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-3">
              <span>Total Hours:</span>
              <span class="font-weight-bold text-h6">32h</span>
            </div>
            <div class="d-flex justify-space-between align-center mb-3">
              <span>Shifts:</span>
              <span class="font-weight-bold">4</span>
            </div>
            <div class="d-flex justify-space-between align-center mb-3">
              <span>Overtime:</span>
              <span class="font-weight-bold text-warning">0h</span>
            </div>
            <v-divider class="my-3"></v-divider>
            <v-btn
              block
              variant="outlined"
              prepend-icon="mdi-swap-horizontal"
              @click="requestSwap"
            >
              Request Shift Swap
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Weekly Schedule</span>
        <v-spacer></v-spacer>
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          variant="outlined"
          density="compact"
        >
          <v-btn value="week">Week</v-btn>
          <v-btn value="month">Month</v-btn>
        </v-btn-toggle>
      </v-card-title>

      <v-card-text>
        <div class="schedule-grid">
          <div class="d-flex mb-4">
            <v-btn
              icon="mdi-chevron-left"
              variant="text"
              @click="previousWeek"
            ></v-btn>
            <div class="flex-grow-1 text-center align-self-center">
              <h3>{{ currentWeekDisplay }}</h3>
            </div>
            <v-btn
              icon="mdi-chevron-right"
              variant="text"
              @click="nextWeek"
            ></v-btn>
          </div>

          <v-row>
            <v-col
              v-for="day in weekDays"
              :key="day.date"
              cols="12"
              md="1.71"
            >
              <v-card
                :class="{ 'border-primary': isToday(day.date) }"
                variant="outlined"
                class="day-card"
              >
                <v-card-title class="text-center py-2">
                  <div class="text-caption">{{ day.name }}</div>
                  <div class="text-h6">{{ day.day }}</div>
                </v-card-title>
                <v-card-text class="pa-2">
                  <div
                    v-for="shift in day.shifts"
                    :key="shift.id"
                    class="shift-block mb-1 pa-2 rounded"
                    :class="`bg-${getStatusColor(shift.status)}-lighten-4`"
                  >
                    <div class="text-caption font-weight-bold">
                      {{ shift.startTime }}-{{ shift.endTime }}
                    </div>
                    <div class="text-caption">{{ shift.department }}</div>
                  </div>
                  <div v-if="day.shifts.length === 0" class="text-center text-caption text-grey">
                    No shifts
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format, isToday, startOfWeek, addDays } from 'date-fns'
import { useShiftsApi } from '@/composables/useApi'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const viewMode = ref('week')
const currentWeek = ref(new Date())

const { shifts: rawShifts, loading, error, fetchShifts } = useShiftsApi()

// Get user's shifts for today
const todayShifts = computed(() => {
  if (!rawShifts.value) return []

  const today = format(new Date(), 'yyyy-MM-dd')
  return rawShifts.value
    .filter((shift: any) => {
      const shiftDate = format(new Date(shift.date), 'yyyy-MM-dd')
      return shiftDate === today && shift.assignments?.some((assignment: any) =>
        assignment.userId === authStore.user?.id
      )
    })
    .map((shift: any) => ({
      id: shift.id,
      startTime: format(new Date(shift.startTime), 'HH:mm'),
      endTime: format(new Date(shift.endTime), 'HH:mm'),
      department: shift.location?.name || 'Unknown Location',
      status: 'Confirmed',
      skill: shift.skill?.name || 'No Skill Required'
    }))
})

const getShiftIcon = (status: string) => {
  switch (status) {
    case 'Confirmed': return 'mdi-check-circle'
    case 'In Progress': return 'mdi-clock'
    case 'Completed': return 'mdi-check-all'
    default: return 'mdi-calendar'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Scheduled': return 'primary'
    case 'Confirmed': return 'success'
    case 'In Progress': return 'warning'
    case 'Completed': return 'info'
    case 'Cancelled': return 'error'
    default: return 'grey'
  }
}

const currentWeekDisplay = computed(() => {
  const start = new Date(currentWeek.value)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
})

const weekDays = computed(() => {
  const start = new Date(currentWeek.value)
  start.setDate(start.getDate() - start.getDay())
  
  const days = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    
    days.push({
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      date: date.toISOString().split('T')[0],
      shifts: getShiftsForDate(date.toISOString().split('T')[0])
    })
  }
  
  return days
})

const getShiftsForDate = (date: string) => {
  if (!rawShifts.value) return []

  return rawShifts.value
    .filter((shift: any) => {
      const shiftDate = format(new Date(shift.date), 'yyyy-MM-dd')
      return shiftDate === date && shift.assignments?.some((assignment: any) =>
        assignment.userId === authStore.user?.id
      )
    })
    .map((shift: any) => ({
      id: shift.id,
      startTime: format(new Date(shift.startTime), 'HH:mm'),
      endTime: format(new Date(shift.endTime), 'HH:mm'),
      department: shift.location?.name || 'Unknown Location',
      status: 'Confirmed'
    }))
}

const isToday = (date: string) => {
  const today = new Date().toISOString().split('T')[0]
  return date === today
}

const previousWeek = () => {
  currentWeek.value = new Date(currentWeek.value.getTime() - 7 * 24 * 60 * 60 * 1000)
}

const nextWeek = () => {
  currentWeek.value = new Date(currentWeek.value.getTime() + 7 * 24 * 60 * 60 * 1000)
}

const requestSwap = () => {
  router.push('/swap-requests')
}

onMounted(() => {
  // Fetch shifts for the current user
  fetchShifts({ userId: authStore.user?.id })
})
</script>

<style scoped>
.day-card {
  min-height: 120px;
}

.shift-block {
  border-left: 3px solid currentColor;
}

.schedule-grid {
  min-height: 300px;
}
</style>