<template>
  <div>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4">Swap Requests</h1>
          <v-btn
            color="primary"
            variant="outlined"
            @click="refreshAllData"
            :loading="refreshing"
          >
            <v-icon class="me-1">mdi-refresh</v-icon>
            Refresh All
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Pill Tabs -->
    <div class="pill-tabs-container mb-6">
      <div class="pill-tabs">
        <button
          v-if="!isManager"
          class="pill-tab"
          :class="{ 'pill-tab--active': activeTab === 'my-requests' }"
          @click="activeTab = 'my-requests'"
        >
          <v-icon size="14" class="me-2">mdi-account-check</v-icon>
          My Requests
        </button>

        <button
          class="pill-tab"
          :class="{ 'pill-tab--active': activeTab === 'available-drops' }"
          @click="activeTab = 'available-drops'"
        >
          <v-icon size="14" class="me-2">mdi-calendar-remove</v-icon>
          Available Drops
        </button>

        <button
          v-if="isManager"
          class="pill-tab pill-tab--with-badge"
          :class="{ 'pill-tab--active': activeTab === 'pending-approval' }"
          @click="activeTab = 'pending-approval'"
        >
          <v-icon size="14" class="me-2">mdi-gavel</v-icon>
          Pending Approval
          <div
            v-if="pendingApprovalCount > 0"
            class="tab-badge"
          >
            {{ pendingApprovalCount }}
          </div>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <v-card class="tab-content-card">

      <div class="tab-window">
        <!-- My Requests Tab -->
        <div v-if="activeTab === 'my-requests'" class="tab-content">
            <div v-if="myRequestsLoading">
              <v-row>
                <v-col v-for="i in 3" :key="i" cols="12" md="6" lg="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title>
                      <v-skeleton-loader type="text" width="60%" />
                    </v-card-title>
                    <v-card-text>
                      <v-skeleton-loader type="list-item-two-line" class="mb-3" />
                      <v-skeleton-loader type="list-item-two-line" class="mb-3" />
                      <v-skeleton-loader type="button" />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <div v-else-if="myRequests.length === 0" class="empty-state">
              <div class="empty-icon">
                <v-icon size="24" color="#94A3B8">mdi-swap-horizontal-variant</v-icon>
              </div>
              <div class="empty-title">No swap requests yet</div>
              <div class="empty-description">
                You haven't made any swap requests yet. Start by going to your schedule to request a swap or drop.
              </div>
              <button
                class="empty-button"
                @click="$router.push('/schedule')"
              >
                View My Schedule
              </button>
            </div>

            <div v-else>
              <v-row>
                <v-col
                  v-for="request in myRequests"
                  :key="request.id"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="text-h6 d-flex align-center">
                      <v-icon class="me-2">{{ getRequestTypeIcon(request.type) }}</v-icon>
                      {{ request.type === 'SWAP' ? 'Shift Swap' : 'Shift Drop' }}
                      <v-spacer />
                      <v-chip
                        size="small"
                        :color="getStatusColor(request.status)"
                        variant="flat"
                      >
                        {{ request.status }}
                      </v-chip>
                    </v-card-title>

                    <v-card-text>
                      <!-- Original Shift -->
                      <div class="mb-3">
                        <h4 class="text-subtitle-2 mb-2">Your Shift</h4>
                        <v-card variant="tonal" color="primary">
                          <v-card-text class="pa-3">
                            <div class="d-flex align-center mb-1">
                              <v-icon size="16" class="me-2">mdi-calendar</v-icon>
                              <span class="text-body-2">{{ request.fromAssignment?.shift?.startTime ? new Date(request.fromAssignment.shift.startTime).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'Invalid Date' }}</span>
                            </div>
                            <div class="d-flex align-center mb-1">
                              <v-icon size="16" class="me-2">mdi-clock</v-icon>
                              <span class="text-body-2">{{ request.fromAssignment?.shift?.time ? (request.fromAssignment.shift.time.localStartTime + ' - ' + request.fromAssignment.shift.time.localEndTime) : 'N/A' }}</span>
                            </div>
                            <div class="d-flex align-center mb-1">
                              <v-icon size="16" class="me-2">mdi-map-marker</v-icon>
                              <span class="text-body-2">{{ request.fromAssignment?.shift?.location?.name || 'N/A' }}</span>
                            </div>
                            <v-chip size="x-small" color="info" variant="tonal">
                              {{ request.fromAssignment?.shift?.skill?.name || 'N/A' }}
                            </v-chip>
                          </v-card-text>
                        </v-card>
                      </div>

                      <!-- Target Staff (for swaps) -->
                      <div v-if="request.type === 'SWAP' && request.toAssignment" class="mb-3">
                        <h4 class="text-subtitle-2 mb-2">Swap With</h4>
                        <div class="d-flex align-center">
                          <v-avatar size="32" color="secondary" class="me-2">
                            <v-icon>mdi-account</v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-body-2 font-weight-medium">{{ request.toAssignment?.user?.firstName || 'N/A' }} {{ request.toAssignment?.user?.lastName || '' }}</div>
                            <div class="text-caption text-grey">{{ request.toAssignment?.shift?.skill?.name || 'N/A' }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- Notes -->
                      <div v-if="request.notes" class="mb-3">
                        <h4 class="text-subtitle-2 mb-2">Notes</h4>
                        <p class="text-body-2 text-grey">{{ request.notes }}</p>
                      </div>

                      <!-- Request Date -->
                      <div class="mb-3">
                        <h4 class="text-subtitle-2 mb-2">Requested</h4>
                        <p class="text-caption text-grey">{{ formatDateTime(request.createdAt) }}</p>
                      </div>
                    </v-card-text>

                    <v-card-actions v-if="request.status === 'PENDING'">
                      <v-spacer />
                      <v-btn
                        color="error"
                        variant="outlined"
                        size="small"
                        @click="cancelRequest(request)"
                        :loading="cancelingRequests.has(request.id)"
                      >
                        <v-icon class="me-1">mdi-cancel</v-icon>
                        Cancel
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
        </div>

        <!-- Available Drops Tab -->
        <div v-if="activeTab === 'available-drops'" class="tab-content">
            <div v-if="availableDropsLoading">
              <v-row>
                <v-col v-for="i in 3" :key="i" cols="12" md="6" lg="4">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title>
                      <v-skeleton-loader type="text" width="60%" />
                    </v-card-title>
                    <v-card-text>
                      <v-skeleton-loader type="list-item-two-line" class="mb-3" />
                      <v-skeleton-loader type="button" />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <div v-else-if="availableDrops.length === 0" class="empty-state">
              <div class="empty-icon">
                <v-icon size="24" color="#94A3B8">mdi-calendar-plus</v-icon>
              </div>
              <div class="empty-title">No available drops</div>
              <div class="empty-description">
                There are currently no shifts available for pickup. Check back later or refresh to see new opportunities.
              </div>
              <button
                class="empty-button ghost"
                @click="fetchAvailableDrops"
              >
                <v-icon size="14" class="me-1">mdi-refresh</v-icon>
                Refresh Drops
              </button>
            </div>

            <div v-else>
              <v-row>
                <v-col
                  v-for="drop in availableDrops"
                  :key="drop.id"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="text-h6 d-flex align-center">
                      <v-icon class="me-2">mdi-calendar-plus</v-icon>
                      Available Shift
                    </v-card-title>

                    <v-card-text>
                      <!-- Shift Details -->
                      <v-card variant="tonal" color="success" class="mb-3">
                        <v-card-text class="pa-3">
                          <div class="d-flex align-center mb-1">
                            <v-icon size="16" class="me-2">mdi-calendar</v-icon>
                            <span class="text-body-2">{{ formatDate(drop.date) }}</span>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <v-icon size="16" class="me-2">mdi-clock</v-icon>
                            <span class="text-body-2">{{ formatShiftTime(drop) }}</span>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <v-icon size="16" class="me-2">mdi-map-marker</v-icon>
                            <span class="text-body-2">{{ drop.location }}</span>
                          </div>
                          <div class="d-flex align-center mb-1">
                            <v-icon size="16" class="me-2">mdi-earth</v-icon>
                            <span class="text-caption text-grey">{{ drop.timezone }}</span>
                          </div>
                          <v-chip size="x-small" color="info" variant="tonal">
                            {{ drop.requiredSkill }}
                          </v-chip>
                        </v-card-text>
                      </v-card>

                      <!-- Original Staff -->
                      <div class="mb-3">
                        <h4 class="text-subtitle-2 mb-2">Original Staff</h4>
                        <div class="d-flex align-center">
                          <v-avatar size="32" color="primary" class="me-2">
                            <v-icon>mdi-account</v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-body-2 font-weight-medium">{{ drop.originalStaff?.name || 'Unknown' }}</div>
                            <div class="text-caption text-grey">Requested drop</div>
                          </div>
                        </div>
                      </div>

                      <!-- Drop reason if provided -->
                      <div v-if="drop.dropReason" class="mb-3">
                        <h4 class="text-subtitle-2 mb-2">Reason</h4>
                        <p class="text-body-2 text-grey">{{ drop.dropReason }}</p>
                      </div>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer />
                      <v-btn
                        color="primary"
                        @click="pickupShift(drop)"
                        :loading="pickingUpShifts.has(drop.id)"
                      >
                        <v-icon class="me-1">mdi-hand-extended</v-icon>
                        Pick Up
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
        </div>

        <!-- Pending Approval Tab (Managers Only) -->
        <div v-if="activeTab === 'pending-approval' && isManager" class="tab-content">
            <div v-if="pendingApprovalsLoading">
              <v-row>
                <v-col v-for="i in 2" :key="i" cols="12" lg="6">
                  <v-card variant="outlined" class="h-100">
                    <v-card-title>
                      <v-skeleton-loader type="text" width="70%" />
                    </v-card-title>
                    <v-card-text>
                      <v-skeleton-loader type="list-item-two-line" class="mb-3" />
                      <v-skeleton-loader type="list-item-two-line" class="mb-3" />
                      <v-skeleton-loader type="actions" />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <div v-else-if="pendingApprovals.length === 0" class="empty-state">
              <div class="empty-icon">
                <v-icon size="24" color="#94A3B8">mdi-check-circle-outline</v-icon>
              </div>
              <div class="empty-title">All caught up!</div>
              <div class="empty-description">
                Great job! All swap requests have been processed. New requests will appear here when submitted.
              </div>
              <button
                class="empty-button ghost"
                @click="fetchPendingApprovals"
              >
                <v-icon size="14" class="me-1">mdi-refresh</v-icon>
                Check for New Requests
              </button>
            </div>

            <div v-else>
              <v-row>
                <v-col
                  v-for="approval in pendingApprovals"
                  :key="approval.id"
                  cols="12"
                  lg="6"
                >
                  <v-card variant="outlined" class="h-100">
                    <v-card-title class="text-h6 d-flex align-center">
                      <v-icon class="me-2">mdi-gavel</v-icon>
                      {{ approval.type === 'SWAP' ? 'Swap Request' : 'Drop Request' }}
                      <v-spacer />
                      <v-chip size="small" color="warning" variant="flat">
                        NEEDS APPROVAL
                      </v-chip>
                    </v-card-title>

                    <v-card-text>
                      <!-- Staff A (Requester) -->
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 mb-2 d-flex align-center">
                          <v-icon class="me-2" color="primary">mdi-account</v-icon>
                          Requesting Staff
                        </h4>

                        <div class="d-flex align-center mb-2">
                          <v-avatar size="32" color="primary" class="me-2">
                            <v-icon>mdi-account</v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-body-2 font-weight-medium">{{ approval.fromAssignment?.user?.name || 'N/A' }}</div>
                            <div class="text-caption text-grey">{{ approval.fromAssignment?.shift?.skill?.name || 'N/A' }}</div>
                          </div>
                        </div>

                        <v-card variant="tonal" color="primary">
                          <v-card-text class="pa-3">
                            <div class="text-caption text-grey mb-1">Their Shift</div>
                            <div class="d-flex align-center mb-1">
                              <v-icon size="14" class="me-1">mdi-calendar</v-icon>
                              <span class="text-body-2">{{ approval.fromAssignment?.shift?.startTime ? formatShiftDate(approval.fromAssignment.shift.startTime) : 'Invalid Date' }}</span>
                            </div>
                            <div class="d-flex align-center mb-1">
                              <v-icon size="14" class="me-1">mdi-clock</v-icon>
                              <span class="text-body-2">{{ approval.fromAssignment?.shift?.time ? (approval.fromAssignment.shift.time.localStartTime + ' - ' + approval.fromAssignment.shift.time.localEndTime) : 'N/A' }}</span>
                            </div>
                            <div class="d-flex align-center">
                              <v-icon size="14" class="me-1">mdi-map-marker</v-icon>
                              <span class="text-body-2">{{ approval.fromAssignment?.shift?.location?.name || 'N/A' }}</span>
                            </div>
                          </v-card-text>
                        </v-card>
                      </div>

                      <!-- Staff B (Target) for swaps -->
                      <div v-if="approval.type === 'SWAP' && approval.toAssignment" class="mb-4">
                        <h4 class="text-subtitle-2 mb-2 d-flex align-center">
                          <v-icon class="me-2" color="secondary">mdi-account-switch</v-icon>
                          Target Staff
                        </h4>

                        <div class="d-flex align-center mb-2">
                          <v-avatar size="32" color="secondary" class="me-2">
                            <v-icon>mdi-account</v-icon>
                          </v-avatar>
                          <div>
                            <div class="text-body-2 font-weight-medium">{{ approval.toAssignment?.user?.name || 'N/A' }}</div>
                            <div class="text-caption text-grey">{{ approval.toAssignment?.shift?.skill?.name || 'N/A' }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- Request Details -->
                      <div class="mb-4">
                        <h4 class="text-subtitle-2 mb-2">Request Details</h4>
                        <div class="text-caption text-grey mb-1">
                          Requested: {{ formatDateTime(approval.createdAt) }}
                        </div>
                        <div v-if="approval.notes" class="text-body-2">
                          <strong>Notes:</strong> {{ approval.notes }}
                        </div>
                      </div>

                      <!-- Rejection Reason (if showing rejection form) -->
                      <div v-if="showRejectForm === approval.id">
                        <v-textarea
                          v-model="rejectionReasons[approval.id]"
                          label="Rejection Reason *"
                          rows="3"
                          variant="outlined"
                          :rules="[v => !!v || 'Rejection reason is required']"
                          placeholder="Please provide a reason for rejecting this request..."
                        />
                      </div>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer />

                      <template v-if="showRejectForm === approval.id">
                        <v-btn
                          variant="outlined"
                          @click="cancelReject(approval.id)"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          color="error"
                          @click="confirmReject(approval)"
                          :loading="processingApprovals.has(approval.id)"
                          :disabled="!rejectionReasons[approval.id]"
                        >
                          Confirm Reject
                        </v-btn>
                      </template>

                      <template v-else>
                        <v-btn
                          color="error"
                          variant="outlined"
                          @click="startReject(approval.id)"
                        >
                          <v-icon class="me-1">mdi-close</v-icon>
                          Reject
                        </v-btn>
                        <v-btn
                          color="success"
                          @click="approveRequest(approval)"
                          :loading="processingApprovals.has(approval.id)"
                        >
                          <v-icon class="me-1">mdi-check</v-icon>
                          Approve
                        </v-btn>
                      </template>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </div>
        </div>
      </div>
    </v-card>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'
import { extractArray } from '../utils/apiHelpers'
import type { SwapRequest } from '../types'

const authStore = useAuthStore()

interface Staff {
  id: number
  name: string
  skill: string
}

interface AvailableDrop {
  id: number
  location: string
  date: string
  startTime: string
  endTime: string
  timezone: string
  requiredSkill: string
  originalStaff?: Staff
  dropReason?: string
}

const activeTab = ref(authStore.userRole === 'MANAGER' || authStore.userRole === 'ADMIN' ? 'available-drops' : 'my-requests')
const refreshing = ref(false)

// My Requests
const myRequestsLoading = ref(true)
const myRequests = ref<SwapRequest[]>([])
const cancelingRequests = ref(new Set<number>())

// Available Drops
const availableDropsLoading = ref(true)
const availableDrops = ref<AvailableDrop[]>([])
const pickingUpShifts = ref(new Set<number>())

// Pending Approvals (Manager only)
const pendingApprovalsLoading = ref(true)
const pendingApprovals = ref<SwapRequest[]>([])
const processingApprovals = ref(new Set<number>())
const showRejectForm = ref<number | null>(null)
const rejectionReasons = ref<Record<number, string>>({})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

const isManager = computed(() => {
  return authStore.userRole === 'ADMIN' || authStore.userRole === 'MANAGER'
})

const pendingApprovalCount = computed(() => {
  return pendingApprovals.value.length
})

async function fetchMyRequests() {
  try {
    myRequestsLoading.value = true
    const response = await api.get('/api/swap-requests?mine=true')
    myRequests.value = extractArray(response)
    console.log('My Requests Data:', myRequests.value)
  } catch (error) {
    console.error('Failed to fetch my requests:', error)
    showMessage('Failed to load your requests', 'error')
  } finally {
    myRequestsLoading.value = false
  }
}

async function fetchAvailableDrops() {
  try {
    availableDropsLoading.value = true
    const response = await api.get('/api/shifts/available-drops')
    availableDrops.value = extractArray(response)
  } catch (error) {
    console.error('Failed to fetch available drops:', error)
    showMessage('Failed to load available drops', 'error')
  } finally {
    availableDropsLoading.value = false
  }
}

async function fetchPendingApprovals() {
  if (!isManager.value) return

  try {
    pendingApprovalsLoading.value = true
    const response = await api.get('/api/swap-requests?status=PENDING_APPROVAL')
    pendingApprovals.value = extractArray(response)
    console.log('Pending Approvals Data:', pendingApprovals.value)
  } catch (error) {
    console.error('Failed to fetch pending approvals:', error)
    showMessage('Failed to load pending approvals', 'error')
  } finally {
    pendingApprovalsLoading.value = false
  }
}

async function cancelRequest(request: SwapRequest) {
  try {
    cancelingRequests.value.add(request.id)

    await api.delete(`/api/swap-requests/${request.id}`)

    myRequests.value = myRequests.value.filter(r => r.id !== request.id)
    showMessage('Request canceled successfully', 'success')

  } catch (error: any) {
    console.error('Failed to cancel request:', error)
    showMessage(error.response?.data?.message || 'Failed to cancel request', 'error')
  } finally {
    cancelingRequests.value.delete(request.id)
  }
}

async function pickupShift(drop: AvailableDrop) {
  try {
    pickingUpShifts.value.add(drop.id)

    await api.post(`/api/shifts/${drop.id}/pickup`)

    availableDrops.value = availableDrops.value.filter(d => d.id !== drop.id)
    showMessage('Shift picked up successfully', 'success')

  } catch (error: any) {
    console.error('Failed to pickup shift:', error)
    showMessage(error.response?.data?.message || 'Failed to pickup shift', 'error')
  } finally {
    pickingUpShifts.value.delete(drop.id)
  }
}

async function approveRequest(request: SwapRequest) {
  try {
    processingApprovals.value.add(request.id)

    await api.patch(`/api/swap-requests/${request.id}/approve`)

    pendingApprovals.value = pendingApprovals.value.filter(r => r.id !== request.id)
    showMessage('Request approved successfully', 'success')

  } catch (error: any) {
    console.error('Failed to approve request:', error)
    showMessage(error.response?.data?.message || 'Failed to approve request', 'error')
  } finally {
    processingApprovals.value.delete(request.id)
  }
}

function startReject(requestId: number) {
  showRejectForm.value = requestId
  if (!rejectionReasons.value[requestId]) {
    rejectionReasons.value[requestId] = ''
  }
}

function cancelReject(requestId: number) {
  showRejectForm.value = null
  delete rejectionReasons.value[requestId]
}

async function confirmReject(request: SwapRequest) {
  const reason = rejectionReasons.value[request.id]
  if (!reason) return

  try {
    processingApprovals.value.add(request.id)

    await api.patch(`/api/swap-requests/${request.id}/reject`, {
      reason: reason
    })

    pendingApprovals.value = pendingApprovals.value.filter(r => r.id !== request.id)
    showMessage('Request rejected successfully', 'success')

    showRejectForm.value = null
    delete rejectionReasons.value[request.id]

  } catch (error: any) {
    console.error('Failed to reject request:', error)
    showMessage(error.response?.data?.message || 'Failed to reject request', 'error')
  } finally {
    processingApprovals.value.delete(request.id)
  }
}

async function refreshAllData() {
  try {
    refreshing.value = true

    const promises = [
      fetchAvailableDrops()
    ]

    if (!isManager.value) {
      promises.push(fetchMyRequests())
    }

    if (isManager.value) {
      promises.push(fetchPendingApprovals())
    }

    await Promise.all(promises)
    showMessage('All data refreshed', 'success')

  } finally {
    refreshing.value = false
  }
}

function getRequestTypeIcon(type: string): string {
  switch (type) {
    case 'SWAP': return 'mdi-swap-horizontal'
    case 'DROP': return 'mdi-calendar-remove'
    default: return 'mdi-help'
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'PENDING_APPROVAL': return 'info'
    case 'APPROVED': return 'success'
    case 'REJECTED': return 'error'
    default: return 'grey'
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

function formatShiftDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric'
  })
}

function formatDateTime(dateTimeString: string): string {
  return new Date(dateTimeString).toLocaleString()
}

function formatShiftTime(shift: { startTime: string; endTime: string }): string {
  const start = new Date(`1970-01-01T${shift.startTime}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
  const end = new Date(`1970-01-01T${shift.endTime}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
  return `${start} - ${end}`
}

function showMessage(message: string, color: string = 'success') {
  snackbar.value = { show: true, message, color }
}

// Watch tab changes to load data on demand
watch(activeTab, (newTab) => {
  switch (newTab) {
    case 'my-requests':
      if (!isManager.value && myRequests.value.length === 0) fetchMyRequests()
      break
    case 'available-drops':
      if (availableDrops.value.length === 0) fetchAvailableDrops()
      break
    case 'pending-approval':
      if (isManager.value && pendingApprovals.value.length === 0) fetchPendingApprovals()
      break
  }
})

onMounted(() => {
  // Load data for the default tab based on user role
  if (isManager.value) {
    fetchAvailableDrops()
  } else {
    fetchMyRequests()
  }
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

/* Pill Tabs */
.pill-tabs-container {
  display: flex;
  justify-content: flex-start;
}

.pill-tabs {
  background: #F1F5F9;
  border-radius: 10px;
  padding: 4px;
  display: inline-flex;
  gap: 2px;
}

.pill-tab {
  padding: 7px 18px;
  border-radius: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #64748B;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  position: relative;
}

.pill-tab--active {
  background: white;
  color: #2563EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.pill-tab:hover:not(.pill-tab--active) {
  background: rgba(37, 99, 235, 0.06);
}

.pill-tab--with-badge {
  padding-right: 28px;
}

.tab-badge {
  position: absolute;
  top: -4px;
  right: 6px;
  width: 14px;
  height: 14px;
  background: #EF4444;
  color: white;
  font-family: 'DM Sans', sans-serif;
  font-size: 8px;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tab Content Card */
.tab-content-card {
  background: white;
  border: 1px solid #E8ECEF;
  border-radius: 14px;
  overflow: hidden;
}

.tab-window {
  width: 100%;
}

.tab-content {
  padding: 24px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  width: 48px;
  height: 48px;
  background: #F1F5F9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.empty-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #0F172A;
  margin-bottom: 8px;
}

.empty-description {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: #94A3B8;
  line-height: 1.5;
  margin-bottom: 24px;
}

.empty-button {
  background: #2563EB;
  color: white;
  border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
}

.empty-button:hover {
  background: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.empty-button.ghost {
  background: white;
  color: #64748B;
  border: 1.5px solid #E8ECEF;
}

.empty-button.ghost:hover {
  border-color: #2563EB;
  color: #2563EB;
  background: #EFF6FF;
  box-shadow: none;
  transform: none;
}

/* Request Cards */
.v-card {
  border-radius: 12px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.v-card-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #0F172A;
}

.v-card-text {
  padding: 24px;
}

.v-card-actions {
  padding: 16px 24px 24px 24px;
}

/* Status chips */
.v-chip {
  border-radius: 6px;
  font-weight: 500;
  font-size: 11px;
}

/* Request type cards - remove colored backgrounds */
.v-card[variant="tonal"] {
  border-radius: 8px;
  border-left: 3px solid;
  background: #F8F9FB !important;
}

.v-card[color="primary"][variant="tonal"] {
  border-left-color: #2563EB;
}

.v-card[color="success"][variant="tonal"] {
  border-left-color: #10B981;
}

/* Action buttons */
.v-btn {
  border-radius: 6px;
  font-weight: 500;
  font-size: 13px;
  text-transform: none;
}

/* Loading and Content Spacing */
.v-row {
  margin: 0 -12px;
}

.v-col {
  padding: 0 12px 24px 12px;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .tab-content {
    padding: 16px;
  }

  .empty-state {
    padding: 32px 16px;
  }

  .v-card-text {
    padding: 16px;
  }

  .v-card-actions {
    padding: 12px 16px 16px 16px;
  }

  .pill-tabs {
    width: 100%;
    justify-content: space-between;
  }

  .pill-tab {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
  }
}
</style>