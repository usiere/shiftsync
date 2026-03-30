<template>
  <!-- Modal Overlay -->
  <div v-if="localShow" class="modal-overlay" @click="close">
    <!-- Modal Container -->
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <h2 class="modal-title">Assign Staff to Shift</h2>
        <button class="close-btn" @click="close" title="Close">
          ×
        </button>
      </div>

      <!-- Shift Details Section -->
      <div v-if="shift" class="shift-details-section">
        <div class="section-label">Shift Details</div>
        <div class="details-grid">
          <!-- Column 1: Location -->
          <div class="detail-row">
            <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="detail-value">{{ shift.location?.name || shift.location }}</span>
          </div>

          <!-- Column 2: Required Skill -->
          <div class="detail-row">
            <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span style="background: #EFF6FF; color: #2563EB; border-radius: 5px; padding: 2px 8px; font-size: 11px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">{{ shift.requiredSkill?.name || shift.skill?.name || shift.requiredSkill }}</span>
          </div>

          <!-- Column 1: Date -->
          <div class="detail-row">
            <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="detail-value detail-mono">{{ formatDate(shift.date) }}</span>
          </div>

          <!-- Column 2: Time -->
          <div class="detail-row">
            <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="detail-value detail-mono">{{ formatShiftTime(shift) }}</span>
          </div>

          <!-- Column 1: Headcount -->
          <div class="detail-row">
            <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span class="detail-value detail-mono">{{ getHeadcountDisplay(shift).replace('/', ' / ') }}</span>
          </div>

          <!-- Column 2: Empty -->
          <div class="detail-row">
          </div>
        </div>
      </div>

      <!-- Constraint Violation Alert -->
      <div v-if="constraintViolation" class="constraint-alert">
        <div class="alert-header">
          <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <span class="alert-title">Assignment Constraint Violated</span>
          <button class="alert-close" @click="constraintViolation = null">×</button>
        </div>
        <!-- Primary violation message -->
        <p class="alert-message">{{ constraintViolation.message }}</p>

        <!-- Multiple violations as bullet list -->
        <div v-if="constraintViolation.violations && constraintViolation.violations.length > 1" class="violations-list">
          <ul class="violation-bullets">
            <li v-for="violation in constraintViolation.violations" :key="violation.message" class="violation-item">
              {{ violation.message }}
            </li>
          </ul>
        </div>

        <!-- Suggested alternatives text -->
        <div v-if="constraintViolation.suggestions" class="suggestions-text">
          <p class="suggestions-message">{{ constraintViolation.suggestions }}</p>
        </div>

        <!-- Warnings in amber -->
        <div v-if="constraintViolation.warnings && constraintViolation.warnings.length > 0" class="warnings-section">
          <div class="warning-header">
            <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
            <span class="warning-title">Warnings</span>
          </div>
          <ul class="warning-list">
            <li v-for="warning in constraintViolation.warnings" :key="warning.message" class="warning-item">
              {{ warning.message }}
            </li>
          </ul>
        </div>

        <!-- Legacy alternative staff chips (for clickable staff assignments) -->
        <div v-if="constraintViolation.alternativeStaff?.length > 0" class="alternative-staff">
          <p class="alternative-title">Suggested Alternative Staff:</p>
          <div class="alternative-chips">
            <button
              v-for="staff in constraintViolation.alternativeStaff"
              :key="staff.id"
              class="alternative-chip"
              @click="selectAlternativeStaff(staff)"
              :title="`Click to assign ${staff.name} instead`"
            >
              <svg class="chip-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              {{ staff.name }} - {{ staff.skill }}
            </button>
          </div>
          <p class="alternative-hint">Click on any alternative staff member to assign them instead.</p>
        </div>
      </div>

      <!-- Eligible Staff Section -->
      <div class="staff-section">
        <div class="section-header">
          <span class="section-title">Eligible Staff</span>
          <span class="staff-count">{{ eligibleStaff.length }} staff</span>
          <button
            class="refresh-btn"
            @click="refreshEligibleStaff"
            :disabled="loadingStaff"
          >
            <svg class="refresh-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" :class="{ 'spinning': loadingStaff }">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingStaff" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading eligible staff...</p>
        </div>

        <!-- Staff List -->
        <div v-else-if="eligibleStaff.length > 0" class="staff-list">
          <div
            v-for="staff in eligibleStaff"
            :key="staff.id"
            class="staff-card"
          >
            <!-- Avatar -->
            <div class="staff-avatar">
              {{ getStaffInitials(staff.name) }}
            </div>

            <!-- Staff Info -->
            <div class="staff-info">
              <div class="staff-name">{{ staff.name }}</div>
              <div class="staff-meta">
                <span class="skill-tag-small">{{ staff.skill }}</span>
                <span class="weekly-hours">{{ staff.weeklyHours }} / 40 hrs</span>
              </div>
            </div>

            <!-- Assign Button -->
            <button
              class="assign-btn"
              @click="assignStaff(staff)"
              :disabled="staff.weeklyHours + getShiftHours() > 40 || assigningStaff.has(staff.id)"
              :class="{ 'loading': assigningStaff.has(staff.id) }"
            >
              <span v-if="assigningStaff.has(staff.id)" class="btn-spinner"></span>
              <span v-else>Assign</span>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <p class="empty-text">No eligible staff found</p>
          <p class="empty-subtext">All available staff with this skill are already assigned</p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <button class="close-footer-btn modal-close-btn" @click="close" style="border: 1.5px solid #E2E8F0 !important;">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import api from '../api/axios'
import { AxiosError } from 'axios'
import type { Shift } from '../types'

interface Staff {
  id: number
  name: string
  skill: string
  weeklyHours: number
}

interface ConstraintViolation {
  message: string
  violations?: Array<{ message: string }>
  warnings?: Array<{ message: string }>
  suggestions?: string
  alternativeStaff?: Staff[]
}

interface _ErrorResponse {
  message: string
  constraint?: boolean
  alternativeStaff?: Staff[]
}

interface Props {
  show: boolean
  shift: Shift | null
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'staff-assigned'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const loadingStaff = ref(false)
const eligibleStaff = ref<Staff[]>([])
const assigningStaff = ref(new Set<number>())
const constraintViolation = ref<ConstraintViolation | null>(null)

async function fetchEligibleStaff() {
  if (!props.shift) return

  try {
    loadingStaff.value = true
    console.log(`Fetching eligible staff for shift ID: ${props.shift.id}`)
    const response = await api.get(`/api/shifts/${props.shift.id}/eligible-staff`)
    console.log('Eligible staff response:', response)
    eligibleStaff.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch eligible staff:', error)
    if (error instanceof AxiosError) {
      console.log('Error status:', error.response?.status)
      console.log('Error data:', error.response?.data)
    }
    // Could show user-friendly error message here
  } finally {
    loadingStaff.value = false
  }
}

async function assignStaff(staff: Staff) {
  if (!props.shift) return

  try {
    assigningStaff.value.add(staff.id)
    constraintViolation.value = null

    await api.post(`/api/shifts/${props.shift.id}/assign`, {
      userId: staff.id
    })

    // Remove assigned staff from eligible list
    eligibleStaff.value = eligibleStaff.value.filter(s => s.id !== staff.id)

    // Notify parent to refresh shift data
    emit('staff-assigned')

  } catch (error) {
    console.error('Failed to assign staff:', error)

    if (error instanceof AxiosError && error.response) {
      // Log the exact error response data to console for debugging
      console.log('Assignment error response data:', error.response.data)

      // Additional logging specifically for 409 errors as requested
      if (error.response.status === 409) {
        console.log('409 Constraint violation error details:', error.response.data)
      }

      const errorData = error.response.data

      // Handle both 400 (bad request) and 409 (conflict/constraint violation) errors
      if (error.response.status === 400 || error.response.status === 409) {
        // Extract primary error message from violations[0].message
        let primaryMessage = 'Assignment violates scheduling constraints'

        if (errorData.violations && errorData.violations.length > 0 && errorData.violations[0].message) {
          primaryMessage = errorData.violations[0].message
        } else if (errorData.details) {
          primaryMessage = errorData.details
        } else if (errorData.message) {
          primaryMessage = errorData.message
        } else if (errorData.error) {
          primaryMessage = errorData.error
        }

        // Format suggestions text if available
        let suggestionsText = ''
        if (errorData.suggestions?.alternatives && errorData.suggestions.alternatives.length > 0) {
          const names = errorData.suggestions.alternatives.map((alt: any) => alt.name).join(', ')
          suggestionsText = `Suggested alternatives: ${names}`
        }

        constraintViolation.value = {
          message: primaryMessage,
          violations: errorData.violations || [],
          warnings: errorData.warnings || [],
          suggestions: suggestionsText,
          // Keep legacy alternativeStaff for existing functionality
          alternativeStaff: errorData.suggestions?.alternatives || errorData.suggestions || errorData.alternativeStaff || []
        }
      }
    }

    // Note: Modal stays open on error so manager can see violation and pick alternative
  } finally {
    assigningStaff.value.delete(staff.id)
  }
}

function selectAlternativeStaff(staff: Staff) {
  assignStaff(staff)
}

async function refreshEligibleStaff() {
  await fetchEligibleStaff()
}

function getShiftHours(): number {
  if (!props.shift) return 0

  const start = new Date(`1970-01-01T${props.shift.startTime}`)
  const end = new Date(`1970-01-01T${props.shift.endTime}`)

  return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
}

function _getHeadcountColor(assigned: number, needed: number): string {
  if (assigned === 0) return 'error'
  if (assigned < needed) return 'warning'
  if (assigned === needed) return 'success'
  return 'info'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

function formatTime(timeString: string): string {
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatShiftTime(shift: Shift | any): string {
  // Add debugging for the shift data structure
  console.log('Shift data in modal:', shift)

  // Check if we have timezone display data (from API response)
  if (shift.timezone?.localStartTime && shift.timezone?.localEndTime) {
    const timezoneSuffix = shift.timezone.timezoneAbbreviation || ''
    return `${shift.timezone.localStartTime} - ${shift.timezone.localEndTime} ${timezoneSuffix}`.trim()
  }

  // Fallback to parsing times
  if (shift.startTime && shift.endTime) {
    try {
      const start = formatTime(shift.startTime)
      const end = formatTime(shift.endTime)
      return `${start} - ${end}`
    } catch (error) {
      console.error('Error formatting shift time:', error)
      return 'TBD'
    }
  }

  return 'TBD'
}

function getHeadcountDisplay(shift: Shift | any): string {
  // Log shift data to see available fields
  console.log('Shift data for headcount:', shift)

  const assigned = shift.assignedCount || 0
  const needed = shift.headcountNeeded || shift.headcount || shift.neededCount || shift.requiredHeadcount || 0

  return `${assigned}/${needed}`
}

function getStaffInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function close() {
  localShow.value = false
  constraintViolation.value = null
}

// Watch for modal opening to fetch eligible staff
watch(() => props.show, (newValue) => {
  if (newValue && props.shift) {
    fetchEligibleStaff()
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
  width: 560px;
  max-width: calc(100vw - 40px);
  max-height: 85vh;
  background: #FFFFFF;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin: 0;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94A3B8;
  font-size: 18px;
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

/* Shift Details Section */
.shift-details-section {
  padding: 20px 24px;
  background: #F8FAFF;
  border-bottom: 1px solid #F1F5F9;
}

.section-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #94A3B8;
  letter-spacing: 0.08em;
  margin-bottom: 14px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 32px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-icon {
  width: 14px;
  height: 14px;
  color: #CBD5E1;
  flex-shrink: 0;
}

.detail-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #0F172A;
}

.detail-mono {
  font-family: 'DM Mono', monospace;
}

.skill-tag {
  background: #EFF6FF;
  color: #2563EB;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
}

/* Constraint Alert */
.constraint-alert {
  margin: 20px 24px;
  padding: 16px;
  background: #FEF2F2;
  border: 1px solid #FECACA;
  border-radius: 12px;
}

.alert-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.alert-icon {
  width: 16px;
  height: 16px;
  color: #EF4444;
  flex-shrink: 0;
}

.alert-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #DC2626;
  flex: 1;
}

.alert-close {
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: #DC2626;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-close:hover {
  background: #FCA5A5;
}

.alert-message {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #DC2626;
  margin: 0 0 12px 0;
}

/* Multiple violations list */
.violations-list {
  margin-bottom: 12px;
}

.violation-bullets {
  margin: 0;
  padding-left: 16px;
  list-style-type: disc;
}

.violation-item {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #DC2626;
  margin: 4px 0;
}

/* Suggestions text */
.suggestions-text {
  margin: 12px 0;
}

.suggestions-message {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #059669;
  background: #ECFDF5;
  border: 1px solid #BBF7D0;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0;
}

/* Warnings section in amber */
.warnings-section {
  margin: 12px 0;
  padding: 12px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 8px;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.warning-icon {
  width: 14px;
  height: 14px;
  color: #F59E0B;
  flex-shrink: 0;
}

.warning-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #F59E0B;
}

.warning-list {
  margin: 0;
  padding-left: 16px;
  list-style-type: disc;
}

.warning-item {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #92400E;
  margin: 2px 0;
}

.alternative-staff {
  margin-top: 16px;
}

.alternative-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #DC2626;
  margin: 0 0 8px 0;
}

.alternative-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.alternative-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #ECFDF5;
  border: 1px solid #BBF7D0;
  border-radius: 6px;
  color: #059669;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.alternative-chip:hover {
  background: #D1FAE5;
  border-color: #86EFAC;
}

.chip-icon {
  width: 12px;
  height: 12px;
}

.alternative-hint {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: #DC2626;
  margin: 0;
  opacity: 0.8;
}

/* Staff Section */
.staff-section {
  padding: 20px 24px;
  flex: 1;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.section-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
}

.staff-count {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  background: #F1F5F9;
  color: #64748B;
  border-radius: 20px;
  padding: 2px 10px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid #E8ECEF;
  border-radius: 7px;
  padding: 5px 12px;
  background: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #64748B;
  cursor: pointer;
  transition: all 150ms ease;
}

.refresh-btn:hover:not(:disabled) {
  border-color: #2563EB;
  color: #2563EB;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  width: 12px;
  height: 12px;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #E5E7EB;
  border-top: 2px solid #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #94A3B8;
  margin: 0;
}

/* Staff List */
.staff-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Staff Card */
.staff-card {
  background: #FFFFFF;
  border: 1.5px solid #E8ECEF;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.staff-card:hover {
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.06);
}

/* Staff Avatar */
.staff-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #0F172A;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Staff Info */
.staff-info {
  flex: 1;
  min-width: 0;
}

.staff-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 4px;
}

.staff-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skill-tag-small {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 500;
  background: #F1F5F9;
  color: #475569;
  border-radius: 4px;
  padding: 1px 7px;
}

.weekly-hours {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #94A3B8;
}

/* Assign Button */
.assign-btn {
  height: 32px;
  padding: 0 16px;
  background: #2563EB;
  color: white;
  border-radius: 7px;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assign-btn:hover:not(:disabled) {
  background: #1D4ED8;
}

.assign-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.assign-btn.loading {
  opacity: 0.7;
  cursor: wait;
}

.btn-spinner {
  width: 12px;
  height: 12px;
  border: 1px solid transparent;
  border-top: 1px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
}

.empty-icon {
  width: 32px;
  height: 32px;
  color: #E2E8F0;
  margin-bottom: 12px;
}

.empty-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #94A3B8;
  margin: 0 0 4px 0;
}

.empty-subtext {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 400;
  color: #CBD5E1;
  margin: 0;
  text-align: center;
}

/* Modal Footer */
.modal-footer {
  padding: 16px 24px 20px 24px;
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
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .modal-container {
    position: fixed;
    bottom: 0;
    width: 100%;
    max-width: none;
    border-radius: 16px 16px 0 0;
    max-height: 90vh;
  }

  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .details-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .staff-card {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
    gap: 8px;
  }

  .staff-info {
    order: -1;
  }

  .staff-avatar {
    align-self: center;
  }
}

/* ESC Key Support */
.modal-overlay[data-esc] {
  /* ESC key handling would be implemented in the component logic */
}
</style>