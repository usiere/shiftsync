<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-6">
          <h1 class="page-title">Shifts</h1>
          <v-btn
            color="primary"
            variant="flat"
            class="create-btn"
            @click="showCreateModal = true"
          >
            <v-icon class="me-2" size="16">mdi-plus</v-icon>
            Create Shift
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filter Bar - inline horizontal -->
    <div class="filter-bar mb-6">
      <div class="filter-inputs">
        <v-select
          v-model="filters.location"
          :items="locations"
          label="Location"
          clearable
          variant="outlined"
          class="filter-input"
          @update:model-value="applyFilters"
        />

        <v-text-field
          v-model="filters.startDate"
          label="Start Date"
          type="date"
          variant="outlined"
          class="filter-input"
          @update:model-value="applyFilters"
        />

        <v-text-field
          v-model="filters.endDate"
          label="End Date"
          type="date"
          variant="outlined"
          class="filter-input"
          @update:model-value="applyFilters"
        />

        <v-select
          v-model="filters.status"
          :items="statusOptions"
          label="Status"
          clearable
          variant="outlined"
          class="filter-input"
          @update:model-value="applyFilters"
        />
      </div>

      <div class="filter-actions">
        <v-btn
          variant="outlined"
          size="small"
          @click="clearFilters"
          class="filter-action-btn me-2"
        >
          Clear
        </v-btn>

        <v-btn
          variant="outlined"
          size="small"
          @click="refreshData"
          :loading="loading"
          class="filter-action-btn"
        >
          <v-icon size="14" class="me-1">mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </div>
    </div>

    <!-- Data Table -->
    <v-card class="shifts-table-card">
      <div class="table-header">
        <div class="shifts-count">{{ filteredShifts.length }} shifts</div>
      </div>

      <div class="table-scroll-container">
        <v-data-table
          :headers="headers"
          :items="filteredShifts"
          :loading="loading"
          loading-text="Loading shifts..."
          no-data-text="No shifts found"
          :items-per-page="25"
          :items-per-page-options="[10, 25, 50, 100]"
          class="shifts-table"
          hover
        >
        <!-- Location column -->
        <template v-slot:item.location="{ item }">
          <div class="location-chip">
            <v-icon size="14" class="me-1">mdi-map-marker</v-icon>
            {{ item.location.name }}
          </div>
        </template>

        <!-- Date column - clickable -->
        <template v-slot:item.date="{ item }">
          <div
            class="date-cell"
            @click="openAssignmentModal(item)"
          >
            {{ formatDate(item.date) }}
          </div>
        </template>

        <!-- Time column -->
        <template v-slot:item.time="{ item }">
          <div class="time-cell">
            {{ formatShiftTime(item) }}
          </div>
        </template>

        <!-- Skill column -->
        <template v-slot:item.requiredSkill="{ item }">
          <div class="skill-pill">
            <v-icon size="12" class="me-1">mdi-cog</v-icon>
            {{ item.requiredSkill?.name || item.skill?.name }}
          </div>
        </template>

        <!-- Headcount column -->
        <template v-slot:item.headcount="{ item }">
          <div class="headcount-display">
            <div class="headcount-numbers mb-1">
              {{ getHeadcountDisplay(item) }}
            </div>
            <div v-if="shouldShowProgressBar(item)" class="headcount-progress mb-1">
              <div
                class="headcount-fill"
                :style="{
                  width: `${getHeadcountPercentage(item)}%`,
                  backgroundColor: getHeadcountBarColor(item)
                }"
              ></div>
            </div>
            <div class="headcount-status" :style="{ color: getHeadcountTextColor(item) }">
              {{ getHeadcountLabel(item) }}
            </div>
          </div>
        </template>

        <!-- Date Added column -->
        <template v-slot:item.createdAt="{ item }">
          <div class="date-added-cell">
            {{ formatDateAdded(item.createdAt) }}
          </div>
        </template>

        <!-- Status column -->
        <template v-slot:item.status="{ item }">
          <div
            class="status-dot"
            :class="`status-${item.status.toLowerCase()}`"
          >
            {{ item.status }}
          </div>
        </template>

        <!-- Actions column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2 align-center">
            <v-btn
              v-if="item.status === 'DRAFT'"
              size="small"
              color="primary"
              variant="flat"
              @click="publishShift(item)"
              :loading="publishingShifts.has(item.id)"
              class="publish-btn"
            >
              <v-icon size="14" class="me-1">mdi-publish</v-icon>
              Publish
            </v-btn>

            <v-btn
              icon
              variant="outlined"
              class="action-btn"
              @click="openAssignmentModal(item)"
              title="Assign Staff"
            >
              <v-icon size="16">mdi-account-plus</v-icon>
            </v-btn>
          </div>
        </template>
        </v-data-table>
      </div>
    </v-card>

    <!-- Modals -->
    <AssignmentModal
      v-model:show="showAssignmentModal"
      :shift="selectedShift"
      @staff-assigned="handleStaffAssigned"
    />

    <CreateShiftModal
      v-model:show="showCreateModal"
      @shift-created="handleShiftCreated"
    />

    <!-- Error/Success Messages -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { format } from 'date-fns'
import api from '../api/axios'
import AssignmentModal from '../components/AssignmentModal.vue'
import CreateShiftModal from '../components/CreateShiftModal.vue'
import { extractArray } from '../utils/apiHelpers'

interface Location {
  name: string
  timezone: string
}

interface Skill {
  name: string
}

interface Shift {
  id: number
  location: Location
  date: string
  startTime: string
  endTime: string
  timezone?: string
  requiredSkill?: Skill
  skill?: Skill
  assignedCount: number
  neededCount: number
  headcount: number
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
}

const loading = ref(true)
const shifts = ref<Shift[]>([])
const publishingShifts = ref(new Set<number>())

// Modal state
const showAssignmentModal = ref(false)
const showCreateModal = ref(false)
const selectedShift = ref<Shift | null>(null)

const filters = ref({
  location: null,
  startDate: '',
  endDate: '',
  status: null
})

const locations = ref<string[]>([])
const statusOptions = [
  { title: 'Draft', value: 'DRAFT' },
  { title: 'Published', value: 'PUBLISHED' }
]

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const headers = [
  { title: 'Location', key: 'location', sortable: true },
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Time', key: 'time', sortable: false },
  { title: 'Required Skill', key: 'requiredSkill', sortable: true },
  { title: 'Headcount', key: 'headcount', sortable: false, align: 'center' },
  { title: 'Date Added', key: 'createdAt', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

const filteredShifts = computed(() => {
  let filtered = [...shifts.value]

  if (filters.value.location) {
    filtered = filtered.filter(shift => shift.location.name === filters.value.location)
  }

  if (filters.value.startDate) {
    filtered = filtered.filter(shift => shift.date >= filters.value.startDate)
  }

  if (filters.value.endDate) {
    filtered = filtered.filter(shift => shift.date <= filters.value.endDate)
  }

  if (filters.value.status) {
    filtered = filtered.filter(shift => shift.status === filters.value.status)
  }

  return filtered
})

async function fetchShifts() {
  try {
    loading.value = true
    const response = await api.get('/api/shifts')
    shifts.value = extractArray(response)

    // Extract unique locations for filter dropdown
    locations.value = [...new Set(shifts.value.map(shift => shift.location.name))].sort()

  } catch (error) {
    console.error('Failed to fetch shifts:', error)
    showMessage('Failed to load shifts', 'error')
  } finally {
    loading.value = false
  }
}

async function publishShift(shift: Shift) {
  try {
    publishingShifts.value.add(shift.id)

    await api.post(`/api/shifts/${shift.id}/publish`)

    // Update the shift status locally
    const shiftIndex = shifts.value.findIndex(s => s.id === shift.id)
    if (shiftIndex !== -1) {
      shifts.value[shiftIndex].status = 'PUBLISHED'
    }

    showMessage(`Shift at ${shift.location?.name} on ${formatDate(shift.date)} published successfully`, 'success')

  } catch (error) {
    console.error('Failed to publish shift:', error)
    showMessage('Failed to publish shift', 'error')
  } finally {
    publishingShifts.value.delete(shift.id)
  }
}

function openAssignmentModal(shift: Shift) {
  selectedShift.value = shift
  showAssignmentModal.value = true
}

function handleStaffAssigned() {
  // Refresh shifts data to show updated headcount
  fetchShifts()
  showMessage('Staff assigned successfully', 'success')
}

function handleShiftCreated() {
  // Refresh shifts data to show new shift
  fetchShifts()
  showMessage('Shift created successfully', 'success')
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

function formatDateAdded(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(timeString: string): string {
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT': return 'grey'
    case 'PUBLISHED': return 'blue'
    default: return 'primary'
  }
}

function getHeadcountColor(assigned: number, needed: number): string {
  if (assigned === 0) return 'error'
  if (assigned < needed) return 'warning'
  if (assigned === needed) return 'success'
  return 'info' // overstaffed
}

function getHeadcountStatus(assigned: number, needed: number): string {
  if (assigned === 0) return 'No staff'
  if (assigned < needed) return 'Understaffed'
  if (assigned === needed) return 'Full'
  return 'Overstaffed'
}

function getHeadcountPercentage(item: any): number {
  const assigned = item.assignedCount || 0
  const needed = item.headcount || item.neededCount || 1
  return Math.min((assigned / needed) * 100, 100)
}

function getHeadcountBarColor(item: any): string {
  const assigned = item.assignedCount || 0
  const needed = item.headcount || item.neededCount || 0

  if (assigned === needed && needed > 0) return '#10B981'  // Green when full
  return '#2563EB'  // Blue for partial
}

function getHeadcountTextColor(item: any): string {
  const assigned = item.assignedCount || 0
  const needed = item.headcount || item.neededCount || 0

  if (assigned === needed && needed > 0) return '#10B981'  // Green when full
  return '#94A3B8'  // Muted grey otherwise
}

function getHeadcountDisplay(item: any): string {
  const assigned = item.assignedCount || 0
  const needed = item.headcount || item.neededCount || 0

  if (assigned === 0 && needed === 0) return '—'
  if (needed === 0 && assigned > 0) return `${assigned} / ?`
  return `${assigned} / ${needed}`
}

function shouldShowProgressBar(item: any): boolean {
  const needed = item.headcount || item.neededCount || 0
  return needed > 0
}

function getHeadcountLabel(item: any): string {
  const assigned = item.assignedCount || 0
  const needed = item.headcount || item.neededCount || 0

  if (assigned === needed && needed > 0) return 'FULL'
  return ''
}

function getTimezoneAbbr(timezone: string): string {
  // Simple mapping for common timezone abbreviations
  const timezoneMap: Record<string, string> = {
    'America/New_York': 'EDT',
    'America/Los_Angeles': 'PDT',
    'America/Chicago': 'CDT',
    'America/Denver': 'MDT',
    'UTC': 'UTC'
  }
  return timezoneMap[timezone] || timezone.split('/').pop()?.replace('_', ' ') || 'UTC'
}

function formatShiftTime(shift: any): string {
  // Check if we have timezone display data (from API response)
  if (shift.timezone?.localStartTime && shift.timezone?.localEndTime) {
    const timezoneSuffix = shift.timezone.timezoneAbbreviation || ''
    return `${shift.timezone.localStartTime} - ${shift.timezone.localEndTime} ${timezoneSuffix}`.trim()
  }

  // Fallback to parsing times
  if (shift.startTime && shift.endTime) {
    try {
      const start = format(new Date(shift.startTime), 'HH:mm')
      const end = format(new Date(shift.endTime), 'HH:mm')
      const timezone = getTimezoneAbbr(shift.location?.timezone || 'UTC')
      return `${start} - ${end} ${timezone}`
    } catch (error) {
      console.error('Error formatting shift time:', error)
      return 'TBD'
    }
  }

  return 'TBD'
}

function applyFilters() {
  // Filters are automatically applied via computed property
}

function clearFilters() {
  filters.value = {
    location: null,
    startDate: '',
    endDate: '',
    status: null
  }
}

async function refreshData() {
  await fetchShifts()
  showMessage('Data refreshed', 'success')
}

function showMessage(message: string, color: string = 'success') {
  snackbar.value = { show: true, message, color }
}

onMounted(() => {
  fetchShifts()
})
</script>

<style scoped>
/* Page title */
.page-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

/* Create button */
.create-btn {
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  font-size: 14px;
  border-radius: 8px;
  text-transform: none;
  color: white !important;
}

.publish-btn {
  font-family: 'DM Sans', sans-serif;
  font-weight: 500;
  color: white !important;
}

/* Filter bar - horizontal inline layout */
.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #F0F0F0;
}

.filter-inputs {
  display: flex;
  gap: 16px;
  flex: 1;
}

.filter-input {
  min-width: 180px;
}

.filter-input :deep(.v-field) {
  height: 40px;
  border: 1.5px solid #E8ECEF;
  border-radius: 9px;
  background: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #0F172A;
  padding: 0 14px;
}

.filter-input :deep(.v-field--focused) {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.06);
  outline: none;
}

.filter-input :deep(.v-field-label) {
  font-size: 14px;
  font-weight: 400;
  color: #64748B;
}

.filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-action-btn {
  height: 32px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  text-transform: none;
  border: 1.5px solid #E8ECEF;
  color: #64748B;
  background: white;
}

.filter-action-btn:hover {
  border-color: #2563EB;
  color: #2563EB;
  background: #EFF6FF;
}

/* Table card */
.shifts-table-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  border: 1px solid #F0F0F0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 280px);
}

/* Table scroll container */
.table-scroll-container {
  flex: 1;
  overflow: auto;
  max-height: 100%;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 20px;
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid #F1F5F9;
}

.shifts-count {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  background: #F1F5F9;
  color: #64748B;
  border-radius: 20px;
  padding: 3px 12px;
}

/* Table styling improvements */
.shifts-table {
  height: 100%;
}

.shifts-table :deep(.v-data-table__wrapper) {
  height: 100%;
  overflow: auto;
}

.shifts-table :deep(.v-data-table__thead .v-data-table__th) {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #94A3B8;
  background-color: #F8F9FB;
  border-bottom: 1px solid #E8ECEF;
  padding: 10px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.shifts-table :deep(.v-data-table__tbody .v-data-table__td) {
  padding: 14px 16px;
  border-bottom: 1px solid #F1F5F9;
  font-size: 13px;
  color: #0F172A;
}

/* Remove zebra striping */
.shifts-table :deep(.v-data-table__tbody tr:nth-child(even) td) {
  background-color: white;
}

/* Row hover effect */
.shifts-table :deep(.v-data-table__tbody tr:hover td) {
  background-color: #FAFBFF;
  transition: background-color 0.2s ease-in-out;
}

/* Location chip */
.location-chip {
  color: #2563EB;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.location-chip .v-icon {
  color: #CBD5E1 !important;
}

/* Date cell - DM Mono, clickable */
.date-cell {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #64748B;
  cursor: pointer;
  font-weight: 500;
}

.date-cell:hover {
  color: #2563EB;
  text-decoration: underline;
}

/* Time cell - DM Mono */
.time-cell {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #0F172A;
  font-weight: 500;
}

/* Date Added cell - DM Mono */
.date-added-cell {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #64748B;
  font-weight: 500;
}

/* Skill pill */
.skill-pill {
  background: #F1F5F9;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  border-radius: 6px;
  padding: 3px 10px;
  display: inline-flex;
  align-items: center;
}

.skill-pill .v-icon {
  color: #94A3B8 !important;
}

/* Headcount display */
.headcount-display {
  min-width: 80px;
  text-align: center;
}

.headcount-numbers {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #64748B;
}

.headcount-progress {
  height: 3px;
  background-color: #F1F5F9;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  width: 80px;
  margin: 4px auto 2px auto;
}

.headcount-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.headcount-status {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  margin-top: 2px;
}

/* Status dots */
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.status-published::before {
  background-color: #10B981;
}

.status-published {
  color: #10B981;
}

.status-draft::before {
  background-color: #94A3B8;
}

.status-draft {
  color: #94A3B8;
}

/* Action buttons */
.publish-btn {
  font-size: 12px;
  font-weight: 500;
  height: 28px;
  border-radius: 6px;
  text-transform: none;
  padding: 0 12px;
}

.action-btn {
  width: 30px;
  height: 30px;
  min-width: 30px;
  border: 1.5px solid #E8ECEF;
  border-radius: 7px;
  background: white;
  color: #94A3B8;
}

.action-btn:hover {
  border-color: #2563EB;
  color: #2563EB;
  background: #EFF6FF;
}

/* Container improvements */
.v-container {
  padding: 24px;
}

/* Responsive improvements */
@media (max-width: 1200px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .filter-inputs {
    flex-wrap: wrap;
  }

  .filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .filter-inputs {
    flex-direction: column;
    gap: 12px;
  }

  .filter-input {
    min-width: auto;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .page-title {
    font-size: 24px;
  }
}
</style>