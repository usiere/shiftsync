<template>
  <v-dialog v-model="localShow" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 d-flex align-center">
        <v-icon class="me-3">mdi-plus</v-icon>
        Create New Shift
        <v-spacer />
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-form ref="form" v-model="formValid" @submit.prevent="createShift">
          <v-row>
            <!-- Location -->
            <v-col cols="12" md="6">
              <v-select
                v-model="shiftForm.location"
                :items="locations"
                :loading="loadingLocations"
                label="Location *"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
              >
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-title>No locations available</v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Date -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="shiftForm.date"
                label="Date *"
                type="date"
                :rules="[rules.required, rules.futureDate]"
                variant="outlined"
                prepend-inner-icon="mdi-calendar"
              />
            </v-col>

            <!-- Start Time -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="shiftForm.startTime"
                label="Start Time *"
                type="time"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-clock-start"
              />
            </v-col>

            <!-- End Time -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="shiftForm.endTime"
                label="End Time *"
                type="time"
                :rules="[rules.required, rules.endTimeAfterStart]"
                variant="outlined"
                prepend-inner-icon="mdi-clock-end"
              />
            </v-col>

            <!-- Required Skill -->
            <v-col cols="12" md="6">
              <v-select
                v-model="shiftForm.requiredSkill"
                :items="skills"
                :loading="loadingSkills"
                label="Required Skill *"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-cog"
              >
                <template v-slot:no-data>
                  <v-list-item>
                    <v-list-item-title>No skills available</v-list-item-title>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Headcount -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="shiftForm.neededCount"
                label="Required Headcount *"
                type="number"
                min="1"
                max="50"
                :rules="[rules.required, rules.positiveNumber, rules.maxHeadcount]"
                variant="outlined"
                prepend-inner-icon="mdi-account-group"
              />
            </v-col>

            <!-- Notes (optional) -->
            <v-col cols="12">
              <v-textarea
                v-model="shiftForm.notes"
                label="Notes (Optional)"
                rows="3"
                variant="outlined"
                prepend-inner-icon="mdi-note-text"
                placeholder="Add any additional notes or requirements for this shift..."
              />
            </v-col>
          </v-row>

          <!-- Preview Section -->
          <v-card v-if="isFormPartiallyFilled" variant="outlined" class="mt-4">
            <v-card-title class="text-subtitle-1">
              <v-icon class="me-2">mdi-eye</v-icon>
              Shift Preview
            </v-card-title>
            <v-card-text>
              <div class="d-flex flex-wrap gap-2">
                <v-chip v-if="shiftForm.location" size="small" variant="outlined">
                  <v-icon start>mdi-map-marker</v-icon>
                  {{ getLocationName(shiftForm.location) }}
                </v-chip>
                <v-chip v-if="shiftForm.date" size="small" variant="outlined">
                  <v-icon start>mdi-calendar</v-icon>
                  {{ formatDate(shiftForm.date) }}
                </v-chip>
                <v-chip v-if="shiftForm.startTime && shiftForm.endTime" size="small" variant="outlined">
                  <v-icon start>mdi-clock</v-icon>
                  {{ shiftForm.startTime }} - {{ shiftForm.endTime }}
                </v-chip>
                <v-chip v-if="shiftForm.requiredSkill" size="small" color="info" variant="tonal">
                  <v-icon start>mdi-cog</v-icon>
                  {{ getSkillName(shiftForm.requiredSkill) }}
                </v-chip>
                <v-chip v-if="shiftForm.neededCount" size="small" color="success" variant="tonal">
                  <v-icon start>mdi-account-group</v-icon>
                  {{ shiftForm.neededCount }} needed
                </v-chip>
              </div>
            </v-card-text>
          </v-card>

          <!-- Error Alert -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="error = ''"
          >
            {{ error }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="creating">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="createShift"
          :loading="creating"
          :disabled="!formValid"
        >
          <v-icon class="me-1">mdi-plus</v-icon>
          Create Shift
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import api from '../api/axios'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'shift-created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localShow = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const form = ref()
const formValid = ref(false)
const creating = ref(false)
const error = ref('')

const loadingLocations = ref(false)
const loadingSkills = ref(false)
const locations = ref<any[]>([])
const skills = ref<any[]>([])

const shiftForm = ref({
  location: null,
  date: '',
  startTime: '',
  endTime: '',
  requiredSkill: null,
  neededCount: 1,
  notes: ''
})

const isFormPartiallyFilled = computed(() => {
  return shiftForm.value.location ||
         shiftForm.value.date ||
         shiftForm.value.startTime ||
         shiftForm.value.endTime ||
         shiftForm.value.requiredSkill
})

const rules = {
  required: (value: any) => !!value || 'This field is required',

  positiveNumber: (value: number) => {
    if (!value) return true
    return value > 0 || 'Must be greater than 0'
  },

  maxHeadcount: (value: number) => {
    if (!value) return true
    return value <= 50 || 'Maximum 50 staff members allowed'
  },

  futureDate: (value: string) => {
    if (!value) return true
    const selectedDate = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today || 'Date must be today or in the future'
  },

  endTimeAfterStart: (value: string) => {
    if (!value || !shiftForm.value.startTime) return true

    const start = new Date(`1970-01-01T${shiftForm.value.startTime}`)
    const end = new Date(`1970-01-01T${value}`)

    return end > start || 'End time must be after start time'
  }
}

async function fetchLocations() {
  try {
    loadingLocations.value = true
    const response = await api.get('/api/locations')
    locations.value = response.data.locations.map((loc: any) => ({
      title: loc.name,
      value: loc.id,
      raw: loc
    }))
  } catch (error) {
    console.error('Failed to fetch locations:', error)
  } finally {
    loadingLocations.value = false
  }
}

async function fetchSkills() {
  try {
    loadingSkills.value = true
    const response = await api.get('/api/skills')
    skills.value = response.data.skills.map((skill: any) => ({
      title: skill.name,
      value: skill.id,
      raw: skill
    }))
  } catch (error) {
    console.error('Failed to fetch skills:', error)
  } finally {
    loadingSkills.value = false
  }
}

async function createShift() {
  if (!formValid.value) return

  try {
    creating.value = true
    error.value = ''

    const shiftData = {
      locationId: shiftForm.value.location,
      skillId: shiftForm.value.requiredSkill,
      date: shiftForm.value.date,
      startTime: `${shiftForm.value.date}T${shiftForm.value.startTime}:00.000Z`,
      endTime: `${shiftForm.value.date}T${shiftForm.value.endTime}:00.000Z`,
      headcountNeeded: shiftForm.value.neededCount,
      description: shiftForm.value.notes || undefined
    }

    await api.post('/api/shifts', shiftData)

    // Reset form
    resetForm()

    // Notify parent
    emit('shift-created')

    // Close modal
    localShow.value = false

  } catch (err: any) {
    console.error('Failed to create shift:', err)

    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else {
      error.value = 'Failed to create shift. Please try again.'
    }
  } finally {
    creating.value = false
  }
}

function resetForm() {
  shiftForm.value = {
    location: null,
    date: '',
    startTime: '',
    endTime: '',
    requiredSkill: null,
    neededCount: 1,
    notes: ''
  }

  if (form.value) {
    form.value.resetValidation()
  }

  error.value = ''
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

function getLocationName(locationId: number): string {
  const location = locations.value.find(loc => loc.value === locationId)
  return location ? location.title : ''
}

function getSkillName(skillId: number): string {
  const skill = skills.value.find(s => s.value === skillId)
  return skill ? skill.title : ''
}

function close() {
  if (!creating.value) {
    resetForm()
    localShow.value = false
  }
}

// Watch for modal opening to fetch data
watch(() => props.show, (newValue) => {
  if (newValue) {
    Promise.all([
      fetchLocations(),
      fetchSkills()
    ])
  }
})

// Set default date to today on component mount
onMounted(() => {
  const today = new Date()
  shiftForm.value.date = today.toISOString().split('T')[0]
})
</script>