<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Schedule</h1>
          <div class="d-flex align-center gap-2">
            <v-chip color="primary" variant="outlined">
              {{ authStore.userRole === 'STAFF' ? 'My Schedule' : 'All Shifts' }}
            </v-chip>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <div class="stat-card">
          <div class="stat-label">TODAY'S SHIFTS</div>
          <div class="stat-number">{{ todayShifts.length }}</div>
          <v-icon class="stat-icon" size="18" color="#CBD5E1">mdi-calendar-today</v-icon>
          <div class="stat-meta" v-if="todayShifts.length > 0">
            {{ formatTimeRange(todayShifts) }}
          </div>
        </div>
      </v-col>

      <v-col cols="12" md="6">
        <div class="stat-card">
          <div class="stat-label">THIS WEEK HOURS</div>
          <div class="stat-number">{{ isNaN(weeklyHours) ? 0 : weeklyHours }}h</div>
          <v-icon class="stat-icon" size="18" color="#CBD5E1">mdi-clock</v-icon>
          <div class="stat-meta">
            {{ (isNaN(weeklyHours) ? 0 : weeklyHours) > 35 ? ((isNaN(weeklyHours) ? 0 : weeklyHours) > 40 ? 'Over 40h limit' : 'Over 35h') : 'Within limits' }}
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Week Navigation -->
    <div class="week-nav-section mb-6">
      <div class="week-nav-content">
        <div class="week-nav-left">
          <button class="nav-chevron" @click="previousWeek">
            <v-icon size="20" color="#64748B">mdi-chevron-left</v-icon>
          </button>
          <div class="week-info">
            <div class="week-range">{{ formatWeekRange(currentWeekStart) }}</div>
            <div class="week-desc">{{ getWeekDescription(currentWeekStart) }}</div>
          </div>
          <button class="nav-chevron" @click="nextWeek">
            <v-icon size="20" color="#64748B">mdi-chevron-right</v-icon>
          </button>
        </div>

        <div class="week-nav-right">
          <button
            class="ghost-btn"
            @click="goToCurrentWeek"
            :disabled="isCurrentWeek"
          >
            This Week
          </button>
          <button
            class="ghost-btn"
            @click="refreshSchedule"
            :disabled="loading"
          >
            <v-icon size="14" class="me-1">mdi-refresh</v-icon>
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Weekly Calendar Grid -->
    <v-card elevation="2" class="schedule-calendar-card">
      <v-card-text class="pa-0">
        <div class="weekly-calendar">
          <v-row class="ma-0">
            <v-col
              v-for="(day, dayIndex) in weekDays"
              :key="dayIndex"
              cols="12"
              md="1.71"
              class="day-column pa-0"
            >
              <!-- Day Header -->
              <div class="day-header">
                <div class="day-name">{{ day.name.slice(0, 3).toUpperCase() }}</div>
                <div class="day-number">{{ day.date.getDate() }}</div>
              </div>

              <v-divider />

              <!-- Day Shifts -->
              <div class="day-content pa-2" style="min-height: 400px;">
                <div v-if="loading" class="text-center py-8">
                  <v-progress-circular size="24" indeterminate />
                </div>

                <div v-else-if="getDayShifts(day.date).length === 0" class="text-center py-8">
                  <v-icon size="32" color="grey-lighten-1">mdi-calendar-blank</v-icon>
                  <p class="text-caption text-grey mt-2">No shifts</p>
                </div>

                <div v-else class="shift-list">
                  <div
                    v-for="shift in getDayShifts(day.date)"
                    :key="shift.id"
                    class="shift-item"
                    :class="{
                      'shift-clickable': canClickShift(shift),
                      'my-shift': isMyShift(shift)
                    }"
                    @click="handleShiftClick(shift)"
                  >
                    <!-- Time -->
                    <div class="shift-time">{{ formatShiftTime(shift) }}</div>

                    <!-- Location -->
                    <div class="shift-location">
                      <v-icon size="12" color="#CBD5E1" class="me-1">mdi-map-marker</v-icon>
                      {{ shift.location.name }}
                    </div>

                    <!-- Skill -->
                    <div class="shift-skill">
                      <v-icon size="12" color="#94A3B8" class="me-1">mdi-cog</v-icon>
                      {{ shift.requiredSkill?.name || shift.skill?.name }}
                    </div>

                    <!-- Assigned Staff -->
                    <div class="shift-staff">
                      <template v-if="shift.shiftAssignments && shift.shiftAssignments.length > 0">
                        <div class="staff-avatars">
                          <div
                            v-for="(assignment, index) in shift.shiftAssignments"
                            :key="assignment.user.id"
                            class="staff-avatar"
                            :title="`${assignment.user.firstName} ${assignment.user.lastName}`"
                          >
                            {{ assignment.user.firstName.charAt(0) }}{{ assignment.user.lastName.charAt(0) }}
                          </div>
                        </div>
                        <div class="staff-names" v-if="shift.shiftAssignments.length <= 2">
                          {{ getAssignedStaffNames(shift) }}
                        </div>
                        <div class="staff-names" v-else>
                          {{ shift.shiftAssignments.length }} assigned
                        </div>
                      </template>
                      <div v-else class="unassigned-text">
                        Unassigned
                      </div>
                    </div>

                    <!-- Status -->
                    <div class="shift-status" :class="`status-${shift.status.toLowerCase()}`">
                      {{ shift.status }}
                    </div>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- Swap/Drop Modal -->
    <SwapDropModal
      v-model:show="showSwapDropModal"
      :shift="selectedShift"
      :pending-requests-count="pendingRequestsCount"
      @request-submitted="handleRequestSubmitted"
    />

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
import { startOfWeek, addWeeks, addDays, format, isSameDay, isToday as isDateToday, isSameWeek, isWeekend as isDateWeekend } from 'date-fns'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'
import SwapDropModal from '../components/SwapDropModal.vue'
import { extractArray } from '../utils/apiHelpers'

const authStore = useAuthStore()

import type { Shift, Location, Skill, AssignedUser, ShiftAssignment } from '../types'

const loading = ref(true)
const shifts = ref<Shift[]>([])
const currentWeekStart = ref(startOfWeek(new Date(), { weekStartsOn: 0 }))
const pendingRequestsCount = ref(0)

// Modal state
const showSwapDropModal = ref(false)
const selectedShift = ref<Shift | null>(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const weekDays = computed(() => {
  const days = []
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  for (let i = 0; i < 7; i++) {
    const date = addDays(currentWeekStart.value, i)
    days.push({
      name: dayNames[i],
      date,
      shortName: dayNames[i].slice(0, 3)
    })
  }

  return days
})

const isCurrentWeek = computed(() => {
  return isSameWeek(currentWeekStart.value, new Date(), { weekStartsOn: 0 })
})

const todayShifts = computed(() => {
  const today = new Date()
  return shifts.value.filter(shift => {
    const shiftDate = new Date(shift.date)
    return isSameDay(shiftDate, today) &&
           (authStore.userRole !== 'STAFF' || isMyShift(shift))
  })
})

const weeklyHours = computed(() => {
  if (authStore.userRole !== 'STAFF') return 0

  return shifts.value.reduce((total, shift) => {
    const shiftDate = new Date(shift.date)
    if (isSameWeek(shiftDate, currentWeekStart.value, { weekStartsOn: 0 }) && isMyShift(shift)) {
      return total + calculateShiftHours(shift)
    }
    return total
  }, 0)
})

async function fetchShifts() {
  try {
    loading.value = true
    let response;

    if (authStore.userRole === 'STAFF') {
      // Staff users can only see shifts assigned to them
      console.log('Fetching shifts for staff user - userId:', authStore.userId, 'user object:', authStore.user)

      if (!authStore.userId) {
        console.error('No user ID available in auth store for staff user')
        throw new Error('Authentication required - no user ID available')
      }

      response = await api.get('/api/shifts', {
        params: {
          assignedTo: authStore.userId,
          startDate: format(currentWeekStart.value, 'yyyy-MM-dd'),
          endDate: format(addDays(currentWeekStart.value, 6), 'yyyy-MM-dd')
        }
      })
    } else {
      // Managers and admins can see all shifts
      response = await api.get('/api/shifts', {
        params: {
          startDate: format(currentWeekStart.value, 'yyyy-MM-dd'),
          endDate: format(addDays(currentWeekStart.value, 6), 'yyyy-MM-dd')
        }
      })
    }

    let fetchedShifts = extractArray(response)

    // Additional frontend filter for staff users to ensure they only see their own shifts
    if (authStore.userRole === 'STAFF' && authStore.userId) {
      fetchedShifts = fetchedShifts.filter(shift => {
        // Check if the current user is assigned to this shift
        return shift.shiftAssignments?.some(assignment => assignment.user.id === authStore.userId)
      })
      console.log('After frontend filtering:', fetchedShifts.length, 'shifts for staff user')
    }

    shifts.value = fetchedShifts
    console.log('Fetched shifts:', shifts.value.length, 'shifts for', authStore.userRole, 'user')

  } catch (error) {
    console.error('Failed to fetch shifts:', error)
    showMessage('Failed to load schedule', 'error')
  } finally {
    loading.value = false
  }
}

async function fetchPendingRequests() {
  if (authStore.userRole !== 'STAFF') return

  try {
    const response = await api.get('/api/swap-requests')
    // Count pending requests for the current user
    const requests = response.data.swapRequests || []
    pendingRequestsCount.value = requests.filter((r: any) =>
      r.status === 'PENDING' && (r.fromUserId === authStore.userId || r.toUserId === authStore.userId)
    ).length
  } catch (error) {
    console.error('Failed to fetch pending requests:', error)
    pendingRequestsCount.value = 0
  }
}

function getDayShifts(date: Date) {
  return shifts.value.filter(shift => {
    const shiftDate = new Date(shift.date)
    const matchesDate = isSameDay(shiftDate, date)

    // For staff, only show their assigned shifts
    if (authStore.userRole === 'STAFF') {
      return matchesDate && isMyShift(shift)
    }

    // For managers/admins, show all shifts
    return matchesDate
  })
}

function isMyShift(shift: Shift): boolean {
  if (authStore.userRole !== 'STAFF') return false

  // Check both old assignedStaffIds and new shiftAssignments for compatibility
  const isAssignedViaIds = shift.assignedStaffIds?.includes(authStore.userId!) || false
  const isAssignedViaAssignments = shift.shiftAssignments?.some(assignment =>
    assignment.user.id === authStore.userId
  ) || false

  return isAssignedViaIds || isAssignedViaAssignments
}

function canClickShift(shift: Shift): boolean {
  // Only staff can click their own shifts for swap/drop
  return authStore.userRole === 'STAFF' && isMyShift(shift)
}

function handleShiftClick(shift: Shift) {
  if (canClickShift(shift)) {
    selectedShift.value = shift
    showSwapDropModal.value = true
  }
}

function calculateShiftHours(shift: Shift): number {
  try {
    // Check if we have timezone data with duration
    if ((shift as any).timezone?.duration && typeof (shift as any).timezone.duration === 'number') {
      return Math.abs((shift as any).timezone.duration)
    }

    // Fallback to parsing times
    let startTime: string
    let endTime: string

    // Handle both ISO strings and time-only strings
    if (shift.startTime.includes('T')) {
      startTime = shift.startTime
      endTime = shift.endTime
    } else {
      startTime = `1970-01-01T${shift.startTime}`
      endTime = `1970-01-01T${shift.endTime}`
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.warn('Invalid date in calculateShiftHours:', { shift, startTime, endTime })
      return 0
    }

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return Math.abs(hours) // Return positive hours
  } catch (error) {
    console.error('Error calculating shift hours:', error, shift)
    return 0
  }
}

function formatShiftTime(shift: Shift): string {
  // Add guards for null/undefined values
  if (!shift.startTime || !shift.endTime) {
    return 'TBD'
  }

  try {
    // Check if we have timezone display data (from API response)
    if ((shift as any).timezone?.localStartTime && (shift as any).timezone?.localEndTime) {
      return `${(shift as any).timezone.localStartTime} - ${(shift as any).timezone.localEndTime}`
    }

    // Fallback: try to parse as time string
    const start = format(new Date(`1970-01-01T${shift.startTime}`), 'HH:mm')
    const end = format(new Date(`1970-01-01T${shift.endTime}`), 'HH:mm')
    return `${start} - ${end}`
  } catch (error) {
    console.error('Error formatting shift time:', error, shift)
    return 'TBD'
  }
}

function formatTime(timeString: string): string {
  return format(new Date(timeString), 'HH:mm')
}

function formatTimeRange(shifts: Shift[]): string {
  if (shifts.length === 0) return ''
  if (shifts.length === 1) return formatShiftTime(shifts[0])

  const times = shifts.map(s => ({ start: s.startTime, end: s.endTime }))
  times.sort((a, b) => a.start.localeCompare(b.start))

  const earliest = formatTime(times[0].start)
  const latest = formatTime(times[times.length - 1].end)

  return `${earliest} - ${latest}`
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6)
  const startStr = format(weekStart, 'MMM d')
  const endStr = format(weekEnd, 'MMM d, yyyy')
  return `${startStr} - ${endStr}`
}

function getWeekDescription(weekStart: Date): string {
  if (isSameWeek(weekStart, new Date(), { weekStartsOn: 0 })) {
    return 'Current week'
  } else if (isSameWeek(weekStart, addWeeks(new Date(), 1), { weekStartsOn: 0 })) {
    return 'Next week'
  } else if (isSameWeek(weekStart, addWeeks(new Date(), -1), { weekStartsOn: 0 })) {
    return 'Last week'
  }
  return ''
}

function isToday(date: Date): boolean {
  return isDateToday(date)
}

function isWeekend(date: Date): boolean {
  return isDateWeekend(date)
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT': return 'grey'
    case 'PUBLISHED': return 'blue'
    default: return 'primary'
  }
}

function getSkillColor(skillName?: string): string {
  if (!skillName) return 'primary'

  // Map different skills to different colors
  const skillColorMap: Record<string, string> = {
    'nurse': 'success',
    'doctor': 'error',
    'technician': 'warning',
    'receptionist': 'info',
    'cleaner': 'purple',
    'security': 'orange',
    'manager': 'primary'
  }

  const normalizedSkill = skillName.toLowerCase()
  return skillColorMap[normalizedSkill] || 'primary'
}

function getSkillColorClass(skillName?: string): string {
  if (!skillName) return 'primary'

  // Return a CSS class name for the skill
  const skillClassMap: Record<string, string> = {
    'nurse': 'success',
    'doctor': 'error',
    'technician': 'warning',
    'receptionist': 'info',
    'cleaner': 'purple',
    'security': 'orange',
    'manager': 'primary'
  }

  const normalizedSkill = skillName.toLowerCase()
  return skillClassMap[normalizedSkill] || 'primary'
}

function previousWeek() {
  currentWeekStart.value = addWeeks(currentWeekStart.value, -1)
  fetchShifts()
}

function nextWeek() {
  currentWeekStart.value = addWeeks(currentWeekStart.value, 1)
  fetchShifts()
}

function goToCurrentWeek() {
  currentWeekStart.value = startOfWeek(new Date(), { weekStartsOn: 0 })
  fetchShifts()
}

async function refreshSchedule() {
  await Promise.all([
    fetchShifts(),
    fetchPendingRequests()
  ])
  showMessage('Schedule refreshed', 'success')
}

function handleRequestSubmitted() {
  fetchPendingRequests()
  showMessage('Request submitted successfully', 'success')
}

function getAssignedStaffNames(shift: Shift): string {
  if (!shift.shiftAssignments || shift.shiftAssignments.length === 0) {
    return ''
  }
  return shift.shiftAssignments
    .map(assignment => `${assignment.user.firstName} ${assignment.user.lastName}`)
    .join(', ')
}

function getAssignedStaffInitials(shift: Shift): string[] {
  if (!shift.shiftAssignments || shift.shiftAssignments.length === 0) {
    return []
  }
  return shift.shiftAssignments.map(assignment =>
    `${assignment.user.firstName.charAt(0)}${assignment.user.lastName.charAt(0)}`.toUpperCase()
  )
}

function showMessage(message: string, color: string = 'success') {
  snackbar.value = { show: true, message, color }
}

onMounted(async () => {
  await Promise.all([
    fetchShifts(),
    fetchPendingRequests()
  ])
})
</script>

<style scoped>
/* Page Title */
h1 {
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 28px;
  color: #0F172A;
}

/* Summary Cards */
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
  font-size: 36px;
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

.stat-meta {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #94A3B8;
}

/* Week Navigation */
.week-nav-section {
  margin-bottom: 32px;
}

.week-nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
}

.week-nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-chevron {
  width: 32px;
  height: 32px;
  border: 1.5px solid #E8ECEF;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.nav-chevron:hover {
  border-color: #2563EB;
  background: #EFF6FF;
}

.week-info {
  text-align: center;
  margin: 0 8px;
}

.week-range {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 2px;
}

.week-desc {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #94A3B8;
}

.week-nav-right {
  display: flex;
  gap: 8px;
}

.ghost-btn {
  background: none;
  border: 1.5px solid #E8ECEF;
  color: #64748B;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.ghost-btn:hover:not(:disabled) {
  border-color: #2563EB;
  color: #2563EB;
  background: #EFF6FF;
}

.ghost-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Schedule Calendar */
.schedule-calendar-card {
  background: white;
  border: 1px solid #E8ECEF;
  border-radius: 14px;
  overflow: hidden;
}

.weekly-calendar {
  width: 100%;
}

.day-column {
  border-right: 1px solid #F1F5F9;
}

.day-column:last-child {
  border-right: none;
}

/* Day Headers */
.day-header {
  padding: 16px;
  text-align: center;
  background: #F8F9FB;
  border-bottom: 1px solid #F1F5F9;
}

.day-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94A3B8;
  margin-bottom: 4px;
}

.day-number {
  font-family: 'DM Sans', sans-serif;
  font-size: 22px;
  font-weight: 700;
  color: #0F172A;
}

/* Day Content */
.day-content {
  background: white;
  min-height: 400px;
  padding: 8px;
}

/* Shift List */
.shift-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Shift Items */
.shift-item {
  background: white;
  border: 1px solid #E8ECEF;
  border-radius: 12px;
  padding: 16px 20px;
  position: relative;
  transition: all 0.2s ease-in-out;
  border-left: 3px solid #2563EB;
}

.shift-item.shift-clickable {
  cursor: pointer;
}

.shift-item.shift-clickable:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: #FAFCFF;
}

.shift-item.my-shift {
  border-left-color: #2563EB;
  background: #FAFCFF;
}

/* Shift Content */
.shift-time {
  font-family: 'DM Mono', monospace;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
  margin-bottom: 8px;
}

.shift-location {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #64748B;
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.shift-skill {
  background: #F1F5F9;
  color: #475569;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  margin-bottom: 8px;
}

.shift-status {
  position: absolute;
  top: 16px;
  right: 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-published {
  color: #10B981;
}

.status-draft {
  color: #94A3B8;
}

/* Status Dots */
.shift-status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}

.status-published::before {
  background-color: #10B981;
}

.status-draft::before {
  background-color: #94A3B8;
}

/* Empty State */
.day-content .text-center {
  padding: 32px 16px;
}

/* Mobile Responsiveness */
@media (max-width: 960px) {
  .week-nav-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .week-nav-right {
    justify-content: center;
  }

  .day-column {
    border-right: none;
    border-bottom: 1px solid #F1F5F9;
  }

  .day-column:last-child {
    border-bottom: none;
  }

  .day-content {
    min-height: 300px;
    padding: 12px;
  }

  .stat-number {
    font-size: 28px;
  }

  .stat-card {
    padding: 16px 20px;
  }
}

@media (max-width: 768px) {
  .week-nav-left {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .shift-item {
    padding: 12px 16px;
  }

  .shift-time {
    font-size: 13px;
  }
}

/* Assigned Staff Styles */
.shift-staff {
  margin-bottom: 8px;
}

.staff-avatars {
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
}

.staff-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563EB;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}

.staff-names {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #475569;
  line-height: 1.3;
}

.unassigned-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #94A3B8;
  font-style: italic;
}
</style>