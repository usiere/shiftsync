<template>
  <div>
    <v-row class="mb-4">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Shifts Management</h1>
        <p class="text-subtitle-1">Create and manage employee shifts</p>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="createShiftAction"
        >
          Create Shift
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="d-flex align-center">
        <span>Shifts</span>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search shifts..."
          variant="outlined"
          hide-details
          density="compact"
          style="max-width: 300px;"
        ></v-text-field>
      </v-card-title>

      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        class="mb-4"
        dismissible
      >
        Failed to load shifts: {{ error }}
      </v-alert>

      <!-- Loading State -->
      <v-skeleton-loader
        v-if="loading"
        type="table"
      ></v-skeleton-loader>

      <!-- Data Table -->
      <v-data-table
        v-else
        :headers="headers"
        :items="shifts"
        :search="search"
        item-value="id"
        class="elevation-0"
      >
        <template v-slot:item.startTime="{ item }">
          {{ formatDateTime(item.date, item.startTime, item.timezone) }}
        </template>

        <template v-slot:item.endTime="{ item }">
          {{ item.endTime }}
          <small v-if="item.timezone" class="text-grey ml-1">({{ item.timezone }})</small>
        </template>

        <template v-slot:item.headcount="{ item }">
          <v-chip
            :color="item.assigned >= item.headcountNeeded ? 'success' : 'warning'"
            size="small"
            variant="tonal"
          >
            {{ item.headcount }}
          </v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon="mdi-account-plus"
            size="small"
            variant="text"
            color="primary"
            @click="assignStaff(item)"
            title="Assign Staff"
          ></v-btn>
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="editShift(item)"
            title="Edit Shift"
          ></v-btn>
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="deleteShift(item)"
            title="Delete Shift"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { format } from 'date-fns'
import { useShiftsApi } from '@/composables/useApi'

const search = ref('')
const showCreateDialog = ref(false)

const { shifts: rawShifts, loading, error, fetchShifts, createShift } = useShiftsApi()

const headers = [
  { title: 'Location', key: 'location', sortable: true },
  { title: 'Required Skill', key: 'skill', sortable: true },
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Start Time', key: 'startTime', sortable: true },
  { title: 'End Time', key: 'endTime', sortable: true },
  { title: 'Headcount', key: 'headcount', sortable: true },
  { title: 'Assigned', key: 'assigned', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, width: 120 }
]

// Transform API data for display
const shifts = computed(() => {
  if (!rawShifts.value) return []

  return rawShifts.value.map((shift: any) => ({
    id: shift.id,
    location: shift.location?.name || 'Unknown Location',
    skill: shift.skill?.name || 'No Skill Required',
    date: format(new Date(shift.date), 'yyyy-MM-dd'),
    startTime: format(new Date(shift.startTime), 'HH:mm'),
    endTime: format(new Date(shift.endTime), 'HH:mm'),
    headcount: `${shift.assignments?.length || 0}/${shift.headcountNeeded}`,
    assigned: shift.assignments?.length || 0,
    status: shift.status,
    timezone: shift.location?.timezone,
    assignments: shift.assignments || []
  }))
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'grey'
    case 'PUBLISHED': return 'primary'
    default: return 'grey'
  }
}

const formatDateTime = (date: string, time: string, timezone?: string) => {
  const display = `${date} ${time}`
  return timezone ? `${display} (${timezone})` : display
}

const shifts_old = ref([
  {
    id: 1,
    employee: 'John Doe',
    date: '2024-03-30',
    startTime: '09:00',
    endTime: '17:00',
    department: 'Sales',
    status: 'Scheduled'
  },
  {
    id: 2,
    employee: 'Jane Smith',
    date: '2024-03-30',
    startTime: '10:00',
    endTime: '18:00',
    department: 'Customer Service',
    status: 'Confirmed'
  },
  {
    id: 3,
    employee: 'Mike Johnson',
    date: '2024-03-30',
    startTime: '14:00',
    endTime: '22:00',
    department: 'Operations',
    status: 'In Progress'
  },
  {
    id: 4,
    employee: 'Sarah Wilson',
    date: '2024-03-31',
    startTime: '08:00',
    endTime: '16:00',
    department: 'HR',
    status: 'Scheduled'
  }
])

const assignStaff = (shift: any) => {
  console.log('Assign staff to shift:', shift)
  // TODO: Open assignment modal
}

const editShift = (shift: any) => {
  console.log('Edit shift:', shift)
  // TODO: Open edit modal
}

const deleteShift = (shift: any) => {
  console.log('Delete shift:', shift)
  // TODO: Confirm and delete
}

const createShiftAction = () => {
  showCreateDialog.value = true
}

onMounted(() => {
  fetchShifts()
})
</script>