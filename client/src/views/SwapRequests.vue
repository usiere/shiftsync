<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Swap Requests</h1>
        <p class="text-subtitle-1">Manage shift swap requests</p>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="createSwapRequest"
        >
          New Swap Request
        </v-btn>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      class="mb-4"
      dismissible
    >
      Failed to load swap requests: {{ error }}
    </v-alert>

    <v-tabs v-model="tab" class="mb-4">
      <v-tab value="my-requests">My Requests</v-tab>
      <v-tab value="available">Available Swaps</v-tab>
      <v-tab value="pending" v-if="canApprove">Pending Approval</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab">
      <!-- My Requests Tab -->
      <v-tabs-window-item value="my-requests">
        <v-card>
          <v-card-text>
            <div v-if="myRequests.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey">mdi-swap-horizontal</v-icon>
              <p class="text-h6 mt-4 mb-2">No swap requests</p>
              <p class="text-subtitle-1 text-grey">Create a new swap request to get started</p>
            </div>
            
            <v-row v-else>
              <v-col
                v-for="request in myRequests"
                :key="request.id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card variant="outlined" class="h-100">
                  <v-card-title class="d-flex align-center">
                    <span>Swap Request #{{ request.id }}</span>
                    <v-spacer></v-spacer>
                    <v-chip
                      :color="getStatusColor(request.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ request.status }}
                    </v-chip>
                  </v-card-title>
                  
                  <v-card-text>
                    <div class="mb-3">
                      <strong>Your Shift:</strong><br>
                      {{ request.originalShift.date }} {{ request.originalShift.time }}<br>
                      <span class="text-caption">{{ request.originalShift.department }}</span>
                    </div>
                    
                    <div class="mb-3" v-if="request.targetShift">
                      <strong>Requested Shift:</strong><br>
                      {{ request.targetShift.date }} {{ request.targetShift.time }}<br>
                      <span class="text-caption">{{ request.targetShift.department }}</span>
                    </div>
                    
                    <div v-if="request.notes" class="mb-3">
                      <strong>Notes:</strong><br>
                      <span class="text-caption">{{ request.notes }}</span>
                    </div>
                  </v-card-text>
                  
                  <v-card-actions>
                    <v-btn
                      v-if="request.status === 'Pending'"
                      size="small"
                      variant="outlined"
                      color="error"
                      @click="cancelRequest(request.id)"
                    >
                      Cancel
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      size="small"
                      variant="text"
                      @click="viewDetails(request)"
                    >
                      Details
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Available Swaps Tab -->
      <v-tabs-window-item value="available">
        <v-card>
          <v-card-text>
            <div v-if="availableSwaps.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey">mdi-calendar-search</v-icon>
              <p class="text-h6 mt-4 mb-2">No available swaps</p>
              <p class="text-subtitle-1 text-grey">Check back later for new swap opportunities</p>
            </div>
            
            <v-row v-else>
              <v-col
                v-for="swap in availableSwaps"
                :key="swap.id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card variant="outlined" class="h-100">
                  <v-card-title class="d-flex align-center">
                    <v-avatar size="32" color="primary" class="me-2">
                      <span class="text-white">{{ getInitials(swap.requesterName) }}</span>
                    </v-avatar>
                    {{ swap.requesterName }}
                  </v-card-title>
                  
                  <v-card-text>
                    <div class="mb-3">
                      <strong>Offering:</strong><br>
                      {{ swap.offeringShift.date }} {{ swap.offeringShift.time }}<br>
                      <span class="text-caption">{{ swap.offeringShift.department }}</span>
                    </div>
                    
                    <div class="mb-3">
                      <strong>Looking for:</strong><br>
                      {{ swap.lookingForShift.date }} {{ swap.lookingForShift.time }}<br>
                      <span class="text-caption">{{ swap.lookingForShift.department }}</span>
                    </div>
                    
                    <div v-if="swap.notes" class="mb-3">
                      <strong>Notes:</strong><br>
                      <span class="text-caption">{{ swap.notes }}</span>
                    </div>
                  </v-card-text>
                  
                  <v-card-actions>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      @click="respondToSwap(swap.id, true)"
                    >
                      Accept
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn
                      variant="text"
                      @click="viewDetails(swap)"
                    >
                      Details
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>

      <!-- Pending Approval Tab (for managers/admins) -->
      <v-tabs-window-item value="pending" v-if="canApprove">
        <v-card>
          <v-card-text>
            <v-data-table
              :headers="pendingHeaders"
              :items="pendingApprovals"
              item-value="id"
              class="elevation-0"
            >
              <template v-slot:item.requester="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" color="primary" class="me-2">
                    <span class="text-white">{{ getInitials(item.requester) }}</span>
                  </v-avatar>
                  {{ item.requester }}
                </div>
              </template>
              
              <template v-slot:item.responder="{ item }">
                <div class="d-flex align-center">
                  <v-avatar size="32" color="success" class="me-2">
                    <span class="text-white">{{ getInitials(item.responder) }}</span>
                  </v-avatar>
                  {{ item.responder }}
                </div>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <v-btn
                  size="small"
                  color="success"
                  variant="tonal"
                  class="me-2"
                  @click="approveSwap(item.id)"
                >
                  Approve
                </v-btn>
                <v-btn
                  size="small"
                  color="error"
                  variant="tonal"
                  @click="rejectSwap(item.id)"
                >
                  Reject
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-tabs-window-item>
    </v-tabs-window>

    <!-- Create Swap Request Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title class="text-h5">
          Create Swap Request
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="submitSwapRequest">
            <v-select
              v-model="createForm.myShiftId"
              :items="myShiftsFormatted"
              item-title="label"
              item-value="value"
              label="Select your shift to swap"
              variant="outlined"
              class="mb-4"
              required
            ></v-select>

            <v-select
              v-model="createForm.targetShiftId"
              :items="availableShiftsFormatted"
              item-title="label"
              item-value="value"
              label="Select shift you want instead (optional)"
              variant="outlined"
              class="mb-4"
              clearable
            ></v-select>

            <v-textarea
              v-model="createForm.notes"
              label="Notes (optional)"
              placeholder="Explain why you need to swap shifts..."
              variant="outlined"
              rows="3"
              class="mb-4"
            ></v-textarea>

            <div class="text-caption text-grey mb-4">
              <v-icon size="small" class="me-1">mdi-information</v-icon>
              If you don't select a specific target shift, this will be posted as an open swap request for any qualified employee to accept.
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="showCreateDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!createForm.myShiftId"
            @click="submitSwapRequest"
          >
            Create Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/auth'
import { useSwapRequestsApi, useShiftsApi } from '@/composables/useApi'

const authStore = useAuthStore()
const tab = ref('my-requests')

const {
  swapRequests: rawSwapRequests,
  loading: swapLoading,
  error: swapError,
  fetchSwapRequests,
  createSwapRequest: apiCreateSwapRequest,
  approveSwapRequest,
  rejectSwapRequest,
  cancelSwapRequest
} = useSwapRequestsApi()

const {
  shifts: userShifts,
  loading: shiftsLoading,
  error: shiftsError,
  fetchShifts
} = useShiftsApi()

const loading = computed(() => swapLoading.value || shiftsLoading.value)
const error = computed(() => swapError.value || shiftsError.value)

const canApprove = computed(() => {
  return authStore.isManagerOrAdmin
})

// Transform user's shifts for the create dialog
const myShiftsFormatted = computed(() => {
  if (!userShifts.value) return []

  return userShifts.value
    .filter((shift: any) => shift.assignments?.some((assignment: any) =>
      assignment.userId === authStore.user?.id
    ))
    .map((shift: any) => ({
      label: `${format(new Date(shift.date), 'yyyy-MM-dd')} ${format(new Date(shift.startTime), 'HH:mm')}-${format(new Date(shift.endTime), 'HH:mm')} - ${shift.location?.name}`,
      value: shift.id
    }))
})

const availableShiftsFormatted = computed(() => {
  if (!userShifts.value) return []

  return userShifts.value
    .filter((shift: any) => !shift.assignments?.some((assignment: any) =>
      assignment.userId === authStore.user?.id
    ))
    .map((shift: any) => ({
      label: `${format(new Date(shift.date), 'yyyy-MM-dd')} ${format(new Date(shift.startTime), 'HH:mm')}-${format(new Date(shift.endTime), 'HH:mm')} - ${shift.location?.name}`,
      value: shift.id
    }))
})

// Transform API swap requests data
const myRequests = computed(() => {
  if (!rawSwapRequests.value) return []

  return rawSwapRequests.value
    .filter((request: any) => request.fromUserId === authStore.user?.id)
    .map((request: any) => ({
      id: request.id,
      status: request.status,
      originalShift: {
        date: format(new Date(request.fromAssignment?.shift?.date), 'yyyy-MM-dd'),
        time: `${format(new Date(request.fromAssignment?.shift?.startTime), 'HH:mm')}-${format(new Date(request.fromAssignment?.shift?.endTime), 'HH:mm')}`,
        department: request.fromAssignment?.shift?.location?.name || 'Unknown'
      },
      targetShift: request.toAssignment ? {
        date: format(new Date(request.toAssignment?.shift?.date), 'yyyy-MM-dd'),
        time: `${format(new Date(request.toAssignment?.shift?.startTime), 'HH:mm')}-${format(new Date(request.toAssignment?.shift?.endTime), 'HH:mm')}`,
        department: request.toAssignment?.shift?.location?.name || 'Unknown'
      } : null,
      notes: request.reason
    }))
})

const availableSwaps = computed(() => {
  if (!rawSwapRequests.value) return []

  return rawSwapRequests.value
    .filter((request: any) => request.fromUserId !== authStore.user?.id && request.status === 'PENDING')
    .map((request: any) => ({
      id: request.id,
      requesterName: `${request.fromUser?.firstName} ${request.fromUser?.lastName}`,
      offeringShift: {
        date: format(new Date(request.fromAssignment?.shift?.date), 'yyyy-MM-dd'),
        time: `${format(new Date(request.fromAssignment?.shift?.startTime), 'HH:mm')}-${format(new Date(request.fromAssignment?.shift?.endTime), 'HH:mm')}`,
        department: request.fromAssignment?.shift?.location?.name || 'Unknown'
      },
      lookingForShift: request.toAssignment ? {
        date: format(new Date(request.toAssignment?.shift?.date), 'yyyy-MM-dd'),
        time: `${format(new Date(request.toAssignment?.shift?.startTime), 'HH:mm')}-${format(new Date(request.toAssignment?.shift?.endTime), 'HH:mm')}`,
        department: request.toAssignment?.shift?.location?.name || 'Unknown'
      } : { date: 'Any', time: 'Any', department: 'Any' },
      notes: request.reason
    }))
})

const pendingApprovals = computed(() => {
  if (!rawSwapRequests.value || !authStore.isManagerOrAdmin) return []

  return rawSwapRequests.value
    .filter((request: any) => request.status === 'ACCEPTED')
    .map((request: any) => ({
      id: request.id,
      requester: `${request.fromUser?.firstName} ${request.fromUser?.lastName}`,
      responder: `${request.toUser?.firstName} ${request.toUser?.lastName}`,
      originalShift: `${format(new Date(request.fromAssignment?.shift?.date), 'MMM d')}, ${format(new Date(request.fromAssignment?.shift?.startTime), 'HH:mm')}-${format(new Date(request.fromAssignment?.shift?.endTime), 'HH:mm')}`,
      newShift: request.toAssignment
        ? `${format(new Date(request.toAssignment?.shift?.date), 'MMM d')}, ${format(new Date(request.toAssignment?.shift?.startTime), 'HH:mm')}-${format(new Date(request.toAssignment?.shift?.endTime), 'HH:mm')}`
        : 'Open Request',
      requestedDate: format(new Date(request.createdAt), 'yyyy-MM-dd')
    }))
})

const myRequests_old = ref([
  {
    id: 1,
    status: 'Pending',
    originalShift: {
      date: '2024-04-01',
      time: '09:00-17:00',
      department: 'Customer Service'
    },
    targetShift: {
      date: '2024-04-02',
      time: '14:00-22:00',
      department: 'Operations'
    },
    notes: 'Need to attend doctor appointment'
  },
  {
    id: 2,
    status: 'Approved',
    originalShift: {
      date: '2024-03-28',
      time: '10:00-18:00',
      department: 'Sales'
    },
    targetShift: {
      date: '2024-03-29',
      time: '08:00-16:00',
      department: 'Sales'
    },
    notes: null
  }
])

const availableSwaps = ref([
  {
    id: 3,
    requesterName: 'John Doe',
    offeringShift: {
      date: '2024-04-05',
      time: '06:00-14:00',
      department: 'Warehouse'
    },
    lookingForShift: {
      date: '2024-04-06',
      time: '14:00-22:00',
      department: 'Any'
    },
    notes: 'Weekend coverage needed'
  },
  {
    id: 4,
    requesterName: 'Sarah Wilson',
    offeringShift: {
      date: '2024-04-03',
      time: '09:00-17:00',
      department: 'HR'
    },
    lookingForShift: {
      date: '2024-04-04',
      time: '09:00-17:00',
      department: 'HR'
    },
    notes: 'Family event on Thursday'
  }
])

const pendingHeaders = [
  { title: 'Requester', key: 'requester' },
  { title: 'Responder', key: 'responder' },
  { title: 'Original Shift', key: 'originalShift' },
  { title: 'New Shift', key: 'newShift' },
  { title: 'Requested', key: 'requestedDate' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const pendingApprovals = ref([
  {
    id: 5,
    requester: 'Mike Johnson',
    responder: 'Jane Smith',
    originalShift: 'Apr 1, 09:00-17:00',
    newShift: 'Apr 2, 14:00-22:00',
    requestedDate: '2024-03-29'
  },
  {
    id: 6,
    requester: 'Lisa Chen',
    responder: 'David Brown',
    originalShift: 'Apr 3, 10:00-18:00',
    newShift: 'Apr 4, 08:00-16:00',
    requestedDate: '2024-03-28'
  }
])

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Pending': return 'warning'
    case 'Approved': return 'success'
    case 'Rejected': return 'error'
    case 'Cancelled': return 'grey'
    default: return 'primary'
  }
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const showCreateDialog = ref(false)
const createForm = ref({
  myShiftId: null,
  targetShiftId: null,
  notes: ''
})

const myShifts = ref([
  { id: 1, date: '2024-04-01', time: '09:00-17:00', department: 'Customer Service' },
  { id: 2, date: '2024-04-03', time: '14:00-22:00', department: 'Operations' },
  { id: 3, date: '2024-04-05', time: '10:00-18:00', department: 'Sales' }
])

const availableShifts = ref([
  { id: 4, date: '2024-04-02', time: '08:00-16:00', department: 'Customer Service' },
  { id: 5, date: '2024-04-04', time: '12:00-20:00', department: 'Sales' },
  { id: 6, date: '2024-04-06', time: '16:00-24:00', department: 'Operations' }
])

const createSwapRequest = () => {
  showCreateDialog.value = true
}

const submitSwapRequest = async () => {
  const requestData = {
    fromShiftId: createForm.value.myShiftId,
    toShiftId: createForm.value.targetShiftId,
    reason: createForm.value.notes
  }

  const result = await apiCreateSwapRequest(requestData)

  if (result) {
    // Reset form and close dialog
    createForm.value = {
      myShiftId: null,
      targetShiftId: null,
      notes: ''
    }
    showCreateDialog.value = false

    // Refresh data
    fetchSwapRequests()
    alert('Swap request created successfully!')
  }
}

const cancelRequest = async (id: number) => {
  const result = await cancelSwapRequest(id)
  if (result) {
    fetchSwapRequests()
    alert('Swap request cancelled')
  }
}

const respondToSwap = async (id: number, accept: boolean) => {
  // TODO: Implement accept swap request API call
  console.log('Respond to swap:', id, accept)
}

const viewDetails = (item: any) => {
  console.log('View details:', item)
  // TODO: Open details modal
}

const approveSwap = async (id: number) => {
  const result = await approveSwapRequest(id)
  if (result) {
    fetchSwapRequests()
    alert('Swap request approved!')
  }
}

const rejectSwap = async (id: number) => {
  const result = await rejectSwapRequest(id)
  if (result) {
    fetchSwapRequests()
    alert('Swap request rejected!')
  }
}

onMounted(() => {
  fetchSwapRequests()
  fetchShifts() // Fetch all shifts for the create dialog
})
</script>