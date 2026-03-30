<template>
  <v-dialog v-model="localShow" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon class="me-3">mdi-swap-horizontal</v-icon>
        Shift Actions
        <v-spacer />
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <!-- Shift Details -->
      <v-card-text v-if="shift">
        <v-row class="mb-4">
          <v-col cols="12">
            <h3 class="text-h6 mb-3">Shift Details</h3>
            <v-card variant="outlined">
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="d-flex align-center mb-2">
                      <v-icon class="me-2">mdi-map-marker</v-icon>
                      <strong>Location:</strong>
                      <v-chip size="small" class="ms-2" variant="outlined">
                        {{ shift.location?.name }}
                      </v-chip>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon class="me-2">mdi-calendar</v-icon>
                      <strong>Date:</strong>
                      <span class="ms-2">{{ formatDate(shift.date) }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon class="me-2">mdi-clock</v-icon>
                      <strong>Time:</strong>
                      <span class="ms-2">{{ shift.timezone?.localStartTime }} - {{ shift.timezone?.localEndTime }} {{ shift.timezone?.timezoneAbbreviation }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="d-flex align-center mb-2">
                      <v-icon class="me-2">mdi-cog</v-icon>
                      <strong>Required Skill:</strong>
                      <v-chip size="small" class="ms-2" color="info" variant="tonal">
                        {{ shift.requiredSkill?.name || shift.skill?.name }}
                      </v-chip>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon class="me-2">mdi-information</v-icon>
                      <strong>Status:</strong>
                      <v-chip
                        size="small"
                        class="ms-2"
                        :color="getStatusColor(shift.status)"
                        variant="flat"
                      >
                        {{ shift.status }}
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Pending Requests Warning -->
        <v-alert
          v-if="pendingRequestsCount >= 3"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <template v-slot:title>
            <strong>Maximum Requests Reached</strong>
          </template>
          You have {{ pendingRequestsCount }} pending requests. You cannot make more requests until some are resolved.
        </v-alert>

        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mb-4"
          closable
          @click:close="error = ''"
        >
          {{ error }}
        </v-alert>

        <!-- Action Selection -->
        <div>
          <h3 class="text-h6 mb-3">Choose Action</h3>

          <v-row>
            <!-- Request Swap -->
            <v-col cols="12" md="6">
              <v-card
                variant="outlined"
                class="pa-4 h-100"
                :class="{ 'border-primary': selectedAction === 'swap' }"
                @click="selectAction('swap')"
                style="cursor: pointer;"
              >
                <div class="text-center">
                  <v-icon size="48" color="primary" class="mb-2">mdi-swap-horizontal</v-icon>
                  <h4 class="text-h6 mb-2">Request Swap</h4>
                  <p class="text-body-2 text-grey">
                    Request another staff member to take your shift
                  </p>
                </div>
              </v-card>
            </v-col>

            <!-- Drop Shift -->
            <v-col cols="12" md="6">
              <v-card
                variant="outlined"
                class="pa-4 h-100"
                :class="{ 'border-primary': selectedAction === 'drop' }"
                @click="selectAction('drop')"
                style="cursor: pointer;"
              >
                <div class="text-center">
                  <v-icon size="48" color="error" class="mb-2">mdi-calendar-remove</v-icon>
                  <h4 class="text-h6 mb-2">Drop Shift</h4>
                  <p class="text-body-2 text-grey">
                    Request to drop this shift entirely
                  </p>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Staff Selection for Swap -->
          <div v-if="selectedAction === 'swap'" class="mt-4">
            <h4 class="text-subtitle-1 mb-3">Select Staff Member to Swap With</h4>

            <v-select
              v-model="selectedStaff"
              :items="availableStaff"
              :loading="loadingStaff"
              item-title="name"
              item-value="id"
              label="Choose Staff Member"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              :rules="swapRules"
              return-object
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-avatar size="32" color="primary">
                      <v-icon>mdi-account</v-icon>
                    </v-avatar>
                  </template>
                  <template v-slot:subtitle v-if="item.raw?.shiftInfo">
                    <div class="text-caption">
                      {{ formatDate(item.raw.shiftInfo.date) }} • {{ formatTime(item.raw.shiftInfo.startTime) }} - {{ formatTime(item.raw.shiftInfo.endTime) }}
                      <br>
                      {{ item.raw.shiftInfo.location }}
                    </div>
                  </template>
                  <template v-slot:append>
                    <v-chip size="small" color="info" variant="tonal">
                      {{ item.raw?.skill || 'No skill' }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>

              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-title>No available staff for swap</v-list-item-title>
                </v-list-item>
              </template>
            </v-select>
          </div>

          <!-- Reason/Notes -->
          <div v-if="selectedAction" class="mt-4">
            <v-textarea
              v-model="notes"
              label="Reason/Notes (Optional)"
              rows="3"
              variant="outlined"
              prepend-inner-icon="mdi-note-text"
              :placeholder="selectedAction === 'swap' ? 'Why do you need to swap this shift?' : 'Why do you need to drop this shift?'"
            />
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="submitting">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="submitRequest"
          :loading="submitting"
          :disabled="!canSubmit || pendingRequestsCount >= 3"
        >
          <v-icon class="me-1">
            {{ selectedAction === 'swap' ? 'mdi-swap-horizontal' : 'mdi-calendar-remove' }}
          </v-icon>
          {{ selectedAction === 'swap' ? 'Request Swap' : 'Request Drop' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import api from '../api/axios'

interface Shift {
  id: number
  location: string
  date: string
  startTime: string
  endTime: string
  timezone: string
  requiredSkill: string
  status: 'DRAFT' | 'PUBLISHED'
}

interface Staff {
  id: number
  assignmentId: number
  name: string
  skill: string
  shiftInfo?: {
    date: string
    startTime: string
    endTime: string
    location: string
    skillRequired: string
  }
}

interface Props {
  show: boolean
  shift: Shift | null
  pendingRequestsCount: number
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'request-submitted'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const selectedAction = ref<'swap' | 'drop' | null>(null)
const selectedStaff = ref<Staff | null>(null)
const notes = ref('')
const submitting = ref(false)
const error = ref('')

const loadingStaff = ref(false)
const availableStaff = ref<Staff[]>([])

const swapRules = [
  (value: Staff | null) => {
    if (selectedAction.value !== 'swap') return true
    return !!value || 'Please select a staff member to swap with'
  }
]

const canSubmit = computed(() => {
  if (!selectedAction.value) return false
  if (selectedAction.value === 'swap' && !selectedStaff.value) return false
  return true
})

async function fetchAvailableStaff() {
  if (!props.shift) return

  try {
    loadingStaff.value = true
    const response = await api.get(`/api/shifts/${props.shift.id}/swap-eligible-staff`)
    availableStaff.value = response.data
  } catch (error) {
    console.error('Failed to fetch available staff:', error)
  } finally {
    loadingStaff.value = false
  }
}

function selectAction(action: 'swap' | 'drop') {
  selectedAction.value = action
  if (action === 'swap' && availableStaff.value.length === 0) {
    fetchAvailableStaff()
  }
  if (action === 'drop') {
    selectedStaff.value = null
  }
}

async function submitRequest() {
  if (!props.shift || !selectedAction.value || !canSubmit.value) return

  try {
    submitting.value = true
    error.value = ''

    if (selectedAction.value === 'swap') {
      await api.post(`/api/shifts/${props.shift.id}/swap`, {
        toAssignmentId: selectedStaff.value?.assignmentId,
        notes: notes.value || undefined
      })
    } else {
      await api.post(`/api/shifts/${props.shift.id}/drop`, {
        notes: notes.value || undefined
      })
    }

    emit('request-submitted')
    close()

  } catch (err: any) {
    console.error(`Failed to submit ${selectedAction.value} request:`, err)

    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = `Failed to submit ${selectedAction.value} request. Please try again.`
    }
  } finally {
    submitting.value = false
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'DRAFT': return 'grey'
    case 'PUBLISHED': return 'blue'
    default: return 'primary'
  }
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

function resetForm() {
  selectedAction.value = null
  selectedStaff.value = null
  notes.value = ''
  error.value = ''
}

function close() {
  resetForm()
  localShow.value = false
}

// Watch for modal opening to reset form
watch(() => props.show, (newValue) => {
  if (newValue) {
    resetForm()
  }
})
</script>