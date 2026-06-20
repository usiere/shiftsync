<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Reports</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="10" lg="9">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-file-export</v-icon>
            Schedule export
          </v-card-title>
          <v-card-subtitle>
            Download published and draft shifts in a date range as a CSV file.
          </v-card-subtitle>

          <v-divider />

          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="startDate"
                  type="date"
                  label="Start date"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  v-model="endDate"
                  type="date"
                  label="End date"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="locationId"
                  :items="locationOptions"
                  item-title="name"
                  item-value="id"
                  label="Location"
                  density="comfortable"
                  hide-details
                  clearable
                  :loading="locationsLoading"
                />
              </v-col>
            </v-row>

            <v-alert
              v-if="error"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              {{ error }}
            </v-alert>

            <div v-if="summary" class="summary-grid mt-6">
              <div class="summary-card">
                <div class="summary-label">Shifts</div>
                <div class="summary-value">{{ summary.shiftCount }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Assignments</div>
                <div class="summary-value">{{ summary.assignmentCount }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Scheduled hours</div>
                <div class="summary-value">{{ summary.totalHours.toFixed(1) }}</div>
              </div>
              <div class="summary-card">
                <div class="summary-label">Locations</div>
                <div class="summary-value">{{ summary.locationCount }}</div>
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="px-4 py-3">
            <v-btn
              variant="text"
              :disabled="loading || !dateRangeValid"
              @click="previewExport"
            >
              Preview
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="loading"
              :disabled="!dateRangeValid"
              @click="downloadCsv"
            >
              <v-icon start>mdi-download</v-icon>
              Download CSV
            </v-btn>
          </v-card-actions>
        </v-card>

        <p class="text-caption text-medium-emphasis mt-3">
          Only Admin and Manager roles can access this page. Times are shown in each location's timezone.
        </p>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../api/axios'

interface LocationOption {
  id: number
  name: string
  timezone?: string
}

interface ShiftAssignment {
  user: { id: number; firstName: string; lastName: string; email: string }
}

interface ShiftRow {
  id: number
  date: string
  startTime: string
  endTime: string
  status: string
  headcountNeeded: number
  title?: string | null
  location: { id: number; name: string; timezone?: string }
  skill?: { name: string } | null
  shiftAssignments: ShiftAssignment[]
}

interface Summary {
  shiftCount: number
  assignmentCount: number
  totalHours: number
  locationCount: number
}

const today = new Date()
const isoDate = (d: Date) => d.toISOString().slice(0, 10)
const startOfWeek = new Date(today)
startOfWeek.setDate(today.getDate() - today.getDay())
const endOfWeek = new Date(startOfWeek)
endOfWeek.setDate(startOfWeek.getDate() + 6)

const startDate = ref(isoDate(startOfWeek))
const endDate = ref(isoDate(endOfWeek))
const locationId = ref<number | null>(null)
const locationOptions = ref<LocationOption[]>([])
const locationsLoading = ref(false)

const loading = ref(false)
const error = ref<string | null>(null)
const summary = ref<Summary | null>(null)

const dateRangeValid = computed(() => {
  if (!startDate.value || !endDate.value) return false
  return new Date(startDate.value).getTime() <= new Date(endDate.value).getTime()
})

async function loadLocations() {
  locationsLoading.value = true
  try {
    const { data } = await api.get('/api/locations')
    locationOptions.value = data?.locations ?? []
  } catch {
    // Locations are optional — leave empty.
  } finally {
    locationsLoading.value = false
  }
}

async function fetchShifts(): Promise<ShiftRow[]> {
  const params: Record<string, string | number> = {
    startDate: startDate.value,
    endDate: endDate.value
  }
  if (locationId.value) params.locationId = locationId.value

  const { data } = await api.get('/api/shifts', { params })
  return (data?.shifts ?? []) as ShiftRow[]
}

function summarize(shifts: ShiftRow[]): Summary {
  const locations = new Set<number>()
  let assignmentCount = 0
  let totalHours = 0
  for (const s of shifts) {
    locations.add(s.location.id)
    assignmentCount += s.shiftAssignments.length
    const hours =
      (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) /
      (1000 * 60 * 60)
    totalHours += hours * Math.max(s.shiftAssignments.length, 0)
  }
  return {
    shiftCount: shifts.length,
    assignmentCount,
    totalHours,
    locationCount: locations.size
  }
}

async function previewExport() {
  loading.value = true
  error.value = null
  summary.value = null
  try {
    const shifts = await fetchShifts()
    summary.value = summarize(shifts)
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      'Failed to load shifts for the selected range.'
  } finally {
    loading.value = false
  }
}

function formatLocalTime(iso: string, timezone?: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsv(shifts: ShiftRow[]): string {
  const headers = [
    'Shift ID',
    'Date',
    'Start (location time)',
    'End (location time)',
    'Hours',
    'Location',
    'Timezone',
    'Skill',
    'Status',
    'Headcount needed',
    'Headcount assigned',
    'Assigned staff'
  ]

  const rows = shifts.map((s) => {
    const tz = s.location.timezone
    const hours =
      (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) /
      (1000 * 60 * 60)
    const staff = s.shiftAssignments
      .map((a) => `${a.user.firstName} ${a.user.lastName}`)
      .join('; ')
    return [
      s.id,
      s.date.slice(0, 10),
      formatLocalTime(s.startTime, tz),
      formatLocalTime(s.endTime, tz),
      hours.toFixed(2),
      s.location.name,
      tz || '',
      s.skill?.name || '',
      s.status,
      s.headcountNeeded,
      s.shiftAssignments.length,
      staff
    ]
  })

  return [headers, ...rows]
    .map((row) => row.map(csvEscape).join(','))
    .join('\n')
}

function triggerDownload(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

async function downloadCsv() {
  loading.value = true
  error.value = null
  try {
    const shifts = await fetchShifts()
    summary.value = summarize(shifts)
    const csv = buildCsv(shifts)
    const filename = `shiftsync-schedule-${startDate.value}-to-${endDate.value}.csv`
    triggerDownload(filename, csv)
  } catch (err: any) {
    error.value =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      'Failed to export shifts.'
  } finally {
    loading.value = false
  }
}

onMounted(loadLocations)
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.summary-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  padding: 12px 14px;
  background: rgb(var(--v-theme-surface-variant));
}

.summary-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 4px;
}

.summary-value {
  font-size: 22px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}
</style>
