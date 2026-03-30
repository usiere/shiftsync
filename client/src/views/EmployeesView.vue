<template>
  <div class="employees-view">
    <div class="page-header">
      <h1 class="page-title">Staff Management</h1>
      <p class="page-subtitle">Manage staff members, view their availability, and contact information</p>
    </div>

    <div class="employees-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading staff members...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <svg class="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
        </svg>
        <p class="error-text">Failed to load staff members</p>
        <p class="error-subtext">{{ error }}</p>
        <button class="retry-btn" @click="fetchStaff">Retry</button>
      </div>

      <!-- Staff Table -->
      <div v-else class="staff-table-container">
        <div class="table-header">
          <div class="table-controls">
            <div class="search-box">
              <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search staff members..."
                class="search-input"
              />
            </div>
            <button class="refresh-btn" @click="fetchStaff" :disabled="loading">
              <svg class="refresh-icon" :class="{ 'spinning': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div class="staff-table">
          <div class="table-header-row">
            <div class="table-cell header-cell name-col">Staff Member</div>
            <div class="table-cell header-cell email-col">Email</div>
            <div class="table-cell header-cell skills-col">Skills</div>
            <div class="table-cell header-cell locations-col">Locations</div>
            <div class="table-cell header-cell status-col">Status</div>
            <div class="table-cell header-cell actions-col">Actions</div>
          </div>

          <div v-for="staff in filteredStaff" :key="staff.id" class="table-row">
            <div class="table-cell name-col">
              <div class="staff-info">
                <div class="staff-avatar">{{ getInitials(staff.firstName, staff.lastName) }}</div>
                <div class="staff-details">
                  <div class="staff-name">{{ staff.firstName }} {{ staff.lastName }}</div>
                  <div class="staff-phone">{{ staff.phone || 'No phone' }}</div>
                </div>
              </div>
            </div>

            <div class="table-cell email-col">
              <a :href="`mailto:${staff.email}`" class="email-link">{{ staff.email }}</a>
            </div>

            <div class="table-cell skills-col">
              <div class="skills-container">
                <span v-for="skill in staff.userSkills" :key="skill.skill.id" class="skill-tag">
                  {{ skill.skill.name }}
                </span>
                <span v-if="!staff.userSkills.length" class="no-skills">No skills</span>
              </div>
            </div>

            <div class="table-cell locations-col">
              <div class="locations-container">
                <span v-for="cert in staff.locationCertifications" :key="cert.location.id" class="location-tag">
                  {{ cert.location.name }}
                </span>
                <span v-if="!staff.locationCertifications.length" class="no-locations">No locations</span>
              </div>
            </div>

            <div class="table-cell status-col">
              <span class="status-badge" :class="staff.isActive ? 'active' : 'inactive'">
                {{ staff.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div class="table-cell actions-col">
              <button class="action-btn primary" @click="viewStaffDetails(staff)">
                <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                View Details
              </button>
            </div>
          </div>

          <div v-if="!filteredStaff.length" class="empty-state">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <p class="empty-text">No staff members found</p>
            <p class="empty-subtext">{{ searchQuery ? 'Try adjusting your search criteria' : 'No staff members are currently registered' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Staff Detail Modal -->
    <StaffDetailModal
      v-if="selectedStaff"
      :staff="selectedStaff"
      :show="showDetailModal"
      @update:show="showDetailModal = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'
import StaffDetailModal from '../components/StaffDetailModal.vue'

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
  userSkills: Array<{
    skill: {
      id: number
      name: string
    }
  }>
  locationCertifications: Array<{
    location: {
      id: number
      name: string
    }
  }>
}

const loading = ref(false)
const error = ref('')
const staff = ref<Staff[]>([])
const searchQuery = ref('')
const selectedStaff = ref<Staff | null>(null)
const showDetailModal = ref(false)

const filteredStaff = computed(() => {
  if (!searchQuery.value) return staff.value

  const query = searchQuery.value.toLowerCase()
  return staff.value.filter(s =>
    s.firstName.toLowerCase().includes(query) ||
    s.lastName.toLowerCase().includes(query) ||
    s.email.toLowerCase().includes(query) ||
    s.userSkills.some(us => us.skill.name.toLowerCase().includes(query)) ||
    s.locationCertifications.some(lc => lc.location.name.toLowerCase().includes(query))
  )
})

async function fetchStaff() {
  try {
    loading.value = true
    error.value = ''

    const response = await api.get('/api/users')
    const allUsers = response.data

    // Filter to only staff members and fetch additional details
    const staffMembers = allUsers.filter((user: any) => user.role === 'STAFF')

    // Fetch detailed information for each staff member
    const staffWithDetails = await Promise.all(
      staffMembers.map(async (staffMember: any) => {
        try {
          const detailResponse = await api.get(`/api/users/${staffMember.id}`)
          return detailResponse.data
        } catch (err) {
          console.error(`Failed to fetch details for staff ${staffMember.id}:`, err)
          return {
            ...staffMember,
            userSkills: [],
            locationCertifications: []
          }
        }
      })
    )

    staff.value = staffWithDetails
  } catch (err: any) {
    console.error('Failed to fetch staff:', err)
    error.value = err.response?.data?.error || 'Failed to load staff members'
  } finally {
    loading.value = false
  }
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function viewStaffDetails(staffMember: Staff) {
  selectedStaff.value = staffMember
  showDetailModal.value = true
}

onMounted(() => {
  fetchStaff()
})
</script>

<style scoped>
.employees-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #0F172A;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  color: #64748B;
  margin: 0;
}

.employees-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 32px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #F1F5F9;
  border-top: 3px solid #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #64748B;
  margin: 0;
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 32px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #EF4444;
  margin-bottom: 16px;
}

.error-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
  margin: 0 0 8px 0;
}

.error-subtext {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #64748B;
  margin: 0 0 24px 0;
}

.retry-btn {
  padding: 8px 16px;
  background: #2563EB;
  color: white;
  border: none;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease;
}

.retry-btn:hover {
  background: #1D4ED8;
}

/* Table Container */
.staff-table-container {
  padding: 24px;
}

.table-header {
  margin-bottom: 16px;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94A3B8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #0F172A;
  transition: border-color 150ms ease;
}

.search-input:focus {
  outline: none;
  border-color: #2563EB;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  background: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
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
  width: 16px;
  height: 16px;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* Staff Table */
.staff-table {
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  overflow: hidden;
}

.table-header-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1.5fr 0.8fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  background: #F8FAFC;
  border-bottom: 1px solid #E2E8F0;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1.5fr 1.5fr 0.8fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #F1F5F9;
  transition: background 150ms ease;
}

.table-row:hover {
  background: #F8FAFC;
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  display: flex;
  align-items: center;
}

.header-cell {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748B;
  letter-spacing: 0.05em;
}

/* Staff Info Column */
.staff-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.staff-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0F172A;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.staff-details {
  min-width: 0;
}

.staff-name {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 2px;
}

.staff-phone {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #64748B;
}

/* Email Column */
.email-link {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #2563EB;
  text-decoration: none;
  transition: color 150ms ease;
}

.email-link:hover {
  color: #1D4ED8;
  text-decoration: underline;
}

/* Skills Column */
.skills-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-tag {
  padding: 2px 8px;
  background: #EFF6FF;
  color: #2563EB;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  white-space: nowrap;
}

.no-skills {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #94A3B8;
  font-style: italic;
}

/* Locations Column */
.locations-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.location-tag {
  padding: 2px 8px;
  background: #F0FDF4;
  color: #15803D;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  white-space: nowrap;
}

.no-locations {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #94A3B8;
  font-style: italic;
}

/* Status Column */
.status-badge {
  padding: 4px 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-badge.active {
  background: #DCFCE7;
  color: #15803D;
}

.status-badge.inactive {
  background: #FEE2E2;
  color: #DC2626;
}

/* Actions Column */
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.action-btn.primary {
  background: #2563EB;
  color: white;
}

.action-btn.primary:hover {
  background: #1D4ED8;
}

.btn-icon {
  width: 14px;
  height: 14px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 32px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #E2E8F0;
  margin-bottom: 16px;
}

.empty-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #64748B;
  margin: 0 0 8px 0;
}

.empty-subtext {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #94A3B8;
  margin: 0;
  text-align: center;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .employees-view {
    padding: 16px;
  }

  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .table-header-row,
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .table-cell {
    padding: 8px 0;
    border-bottom: 1px solid #F1F5F9;
  }

  .header-cell {
    display: none;
  }

  .table-cell::before {
    content: attr(data-label);
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    color: #64748B;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
    display: block;
  }
}
</style>