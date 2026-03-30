<template>
  <!-- Modal Overlay -->
  <div v-if="localShow" class="modal-overlay" @click="close">
    <!-- Modal Container -->
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-content">
          <div class="staff-avatar">{{ getInitials(staff.firstName, staff.lastName) }}</div>
          <div class="header-info">
            <h2 class="modal-title">{{ staff.firstName }} {{ staff.lastName }}</h2>
            <p class="staff-subtitle">Staff Details & Availability</p>
          </div>
        </div>
        <button class="close-btn" @click="close" title="Close">
          ×
        </button>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Basic Information Section -->
        <div class="info-section">
          <div class="section-header">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <h3 class="section-title">Contact Information</h3>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Email</div>
              <a :href="`mailto:${staff.email}`" class="info-value email-link">{{ staff.email }}</a>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div class="info-value">{{ staff.phone || 'Not provided' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Status</div>
              <span class="status-badge" :class="staff.isActive ? 'active' : 'inactive'">
                {{ staff.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="info-item">
              <div class="info-label">Joined</div>
              <div class="info-value">{{ formatDate(staff.createdAt) }}</div>
            </div>
          </div>
        </div>

        <!-- Skills Section -->
        <div class="info-section">
          <div class="section-header">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <h3 class="section-title">Skills</h3>
          </div>

          <div v-if="staff.userSkills && staff.userSkills.length > 0" class="tags-container">
            <span v-for="userSkill in staff.userSkills" :key="userSkill.skill.id" class="skill-tag">
              {{ userSkill.skill.name }}
            </span>
          </div>
          <div v-else class="empty-message">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>No skills registered</p>
          </div>
        </div>

        <!-- Certified Locations Section -->
        <div class="info-section">
          <div class="section-header">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <h3 class="section-title">Certified Locations</h3>
          </div>

          <div v-if="staff.locationCertifications && staff.locationCertifications.length > 0" class="tags-container">
            <span v-for="cert in staff.locationCertifications" :key="cert.location.id" class="location-tag">
              {{ cert.location.name }}
            </span>
          </div>
          <div v-else class="empty-message">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p>No location certifications</p>
          </div>
        </div>

        <!-- Availability Section -->
        <div class="info-section availability-section">
          <div class="section-header">
            <svg class="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="section-title">Availability Windows</h3>
            <button
              v-if="!loadingAvailability && !availability"
              class="refresh-availability-btn"
              @click="fetchAvailability"
              title="Load availability data"
            >
              <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Load Availability
            </button>
          </div>

          <!-- Loading State -->
          <div v-if="loadingAvailability" class="availability-loading">
            <div class="loading-spinner"></div>
            <p>Loading availability data...</p>
          </div>

          <!-- Availability Error -->
          <div v-else-if="availabilityError" class="availability-error">
            <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <p class="error-text">Failed to load availability</p>
            <p class="error-subtext">{{ availabilityError }}</p>
            <button class="retry-btn" @click="fetchAvailability">Retry</button>
          </div>

          <!-- Availability Content -->
          <div v-else-if="availability" class="availability-content">
            <!-- Weekly Recurring Availability -->
            <div v-if="availability.weekly && availability.weekly.length > 0" class="availability-subsection">
              <h4 class="subsection-title">Weekly Schedule</h4>
              <div class="weekly-schedule">
                <div v-for="weeklySlot in availability.weekly" :key="`${weeklySlot.dayOfWeek}-${weeklySlot.startTime}`" class="schedule-row">
                  <div class="day-label">{{ getDayName(weeklySlot.dayOfWeek) }}</div>
                  <div class="time-range">
                    {{ formatTime(weeklySlot.startTime) }} - {{ formatTime(weeklySlot.endTime) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- One-off Exceptions -->
            <div v-if="availability.exceptions && availability.exceptions.length > 0" class="availability-subsection">
              <h4 class="subsection-title">Schedule Exceptions</h4>
              <div class="exceptions-list">
                <div v-for="exception in availability.exceptions" :key="`${exception.date}-${exception.startTime}`" class="exception-item">
                  <div class="exception-date">{{ formatDateOnly(exception.date) }}</div>
                  <div class="exception-time">
                    {{ formatTime(exception.startTime) }} - {{ formatTime(exception.endTime) }}
                  </div>
                  <div class="exception-type" :class="exception.isAvailable ? 'available' : 'unavailable'">
                    {{ exception.isAvailable ? 'Available' : 'Unavailable' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- No Availability Data -->
            <div v-if="(!availability.weekly || availability.weekly.length === 0) && (!availability.exceptions || availability.exceptions.length === 0)" class="empty-availability">
              <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p>No availability windows set</p>
              <p class="empty-subtext">Staff member has not configured their availability schedule</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="close-footer-btn" @click="close">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import api from '../api/axios'

interface Staff {
  id: number
  email: string
  firstName: string
  lastName: string
  phone: string | null
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  userSkills?: Array<{
    skill: {
      id: number
      name: string
    }
  }>
  locationCertifications?: Array<{
    location: {
      id: number
      name: string
    }
  }>
}

interface WeeklyAvailability {
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface AvailabilityException {
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface Availability {
  weekly: WeeklyAvailability[]
  exceptions: AvailabilityException[]
}

interface Props {
  staff: Staff
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const loadingAvailability = ref(false)
const availabilityError = ref('')
const availability = ref<Availability | null>(null)

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

async function fetchAvailability() {
  try {
    loadingAvailability.value = true
    availabilityError.value = ''

    const response = await api.get(`/api/users/${props.staff.id}/availability`)
    availability.value = response.data
  } catch (err: any) {
    console.error('Failed to fetch availability:', err)
    availabilityError.value = err.response?.data?.error || 'Failed to load availability data'
    availability.value = null
  } finally {
    loadingAvailability.value = false
  }
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatDateOnly(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatTime(timeString: string): string {
  // Handle both HH:mm and HH:mm:ss formats
  const timeParts = timeString.split(':')
  const hour = parseInt(timeParts[0])
  const minute = timeParts[1]

  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  return `${displayHour}:${minute} ${period}`
}

function getDayName(dayOfWeek: number): string {
  return dayNames[dayOfWeek] || 'Unknown'
}

function close() {
  localShow.value = false
  availability.value = null
  availabilityError.value = ''
}

// Auto-fetch availability when modal opens
watch(() => props.show, (newValue) => {
  if (newValue && !availability.value && !loadingAvailability.value) {
    fetchAvailability()
  }
})
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}

/* Modal Container */
.modal-container {
  width: 700px;
  max-width: calc(100vw - 40px);
  max-height: 90vh;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  padding: 24px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.staff-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #0F172A;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-info {
  min-width: 0;
}

.modal-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 4px 0;
}

.staff-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94A3B8;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

.close-btn:hover {
  background: #F1F5F9;
  color: #0F172A;
}

/* Modal Content */
.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 24px;
}

/* Info Sections */
.info-section {
  padding: 24px 0;
  border-bottom: 1px solid #F1F5F9;
}

.info-section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.section-icon {
  width: 20px;
  height: 20px;
  color: #64748B;
  flex-shrink: 0;
}

.section-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
  flex: 1;
}

.refresh-availability-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  background: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all 150ms ease;
}

.refresh-availability-btn:hover {
  border-color: #2563EB;
  color: #2563EB;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748B;
  letter-spacing: 0.05em;
}

.info-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #0F172A;
}

.email-link {
  color: #2563EB;
  text-decoration: none;
  transition: color 150ms ease;
}

.email-link:hover {
  color: #1D4ED8;
  text-decoration: underline;
}

/* Status Badge */
.status-badge {
  padding: 4px 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
  width: fit-content;
}

.status-badge.active {
  background: #DCFCE7;
  color: #15803D;
}

.status-badge.inactive {
  background: #FEE2E2;
  color: #DC2626;
}

/* Tags Container */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  padding: 6px 12px;
  background: #EFF6FF;
  color: #2563EB;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid #DBEAFE;
}

.location-tag {
  padding: 6px 12px;
  background: #F0FDF4;
  color: #15803D;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid #BBF7D0;
}

/* Empty Message */
.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
}

.empty-icon {
  width: 32px;
  height: 32px;
  color: #CBD5E1;
  margin-bottom: 12px;
}

.empty-message p {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

/* Availability Section */
.availability-section {
  padding-bottom: 0;
}

.availability-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #F1F5F9;
  border-top: 2px solid #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.availability-loading p {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

.availability-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  text-align: center;
}

.error-icon {
  width: 32px;
  height: 32px;
  color: #EF4444;
  margin-bottom: 12px;
}

.error-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #DC2626;
  margin: 0 0 4px 0;
}

.error-subtext {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #64748B;
  margin: 0 0 16px 0;
}

.retry-btn {
  padding: 6px 12px;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease;
}

.retry-btn:hover {
  background: #1D4ED8;
}

/* Availability Content */
.availability-content {
  padding-bottom: 24px;
}

.availability-subsection {
  margin-bottom: 24px;
}

.availability-subsection:last-child {
  margin-bottom: 0;
}

.subsection-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 12px 0;
}

/* Weekly Schedule */
.weekly-schedule {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.day-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
  min-width: 100px;
}

.time-range {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  color: #64748B;
  background: #F8FAFC;
  padding: 4px 8px;
  border-radius: 4px;
}

/* Exceptions List */
.exceptions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exception-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: #F8FAFC;
  border-radius: 8px;
  border: 1px solid #E2E8F0;
}

.exception-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
  min-width: 100px;
}

.exception-time {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #64748B;
  flex: 1;
}

.exception-type {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.exception-type.available {
  background: #DCFCE7;
  color: #15803D;
}

.exception-type.unavailable {
  background: #FEE2E2;
  color: #DC2626;
}

/* Empty Availability */
.empty-availability {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  text-align: center;
}

.empty-availability .empty-icon {
  width: 32px;
  height: 32px;
  color: #CBD5E1;
  margin-bottom: 12px;
}

.empty-availability p {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #64748B;
  margin: 0 0 4px 0;
}

.empty-subtext {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #94A3B8;
  margin: 0;
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px 24px 24px;
  border-top: 1px solid #F1F5F9;
  display: flex;
  justify-content: flex-end;
}

.close-footer-btn {
  height: 36px;
  padding: 0 20px;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  background: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all 150ms ease;
}

.close-footer-btn:hover {
  border-color: #94A3B8;
  color: #0F172A;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-container {
    width: 100%;
    height: 100vh;
    max-height: none;
    border-radius: 0;
  }

  .modal-overlay {
    align-items: stretch;
    padding: 0;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .schedule-row,
  .exception-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .day-label,
  .exception-date {
    min-width: auto;
  }
}
</style>