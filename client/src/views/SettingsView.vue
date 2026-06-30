<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Settings</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-bell-cog</v-icon>
            Notification preferences
          </v-card-title>
          <v-card-subtitle>
            Choose which notifications you want to receive and how.
          </v-card-subtitle>

          <v-divider />

          <v-card-text>
            <div v-if="loading" class="d-flex justify-center py-8">
              <v-progress-circular indeterminate color="primary" />
            </div>

            <v-alert
              v-else-if="loadError"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              {{ loadError }}
            </v-alert>

            <template v-else>
              <div class="text-subtitle-2 mb-2">Delivery channels</div>
              <v-switch
                v-model="prefs.emailNotifications"
                color="primary"
                label="Email notifications"
                hide-details
                inset
              />
              <v-switch
                v-model="prefs.pushNotifications"
                color="primary"
                label="Push / in-app notifications"
                hide-details
                inset
              />

              <v-divider class="my-4" />

              <div class="text-subtitle-2 mb-2">Notify me about</div>
              <v-switch
                v-model="prefs.shiftAssignments"
                color="primary"
                label="Shift assignments"
                hide-details
                inset
              />
              <v-switch
                v-model="prefs.shiftCancellations"
                color="primary"
                label="Shift cancellations"
                hide-details
                inset
              />
              <v-switch
                v-model="prefs.swapRequests"
                color="primary"
                label="Swap requests"
                hide-details
                inset
              />
              <v-switch
                v-model="prefs.schedulePublished"
                color="primary"
                label="Schedule published"
                hide-details
                inset
              />
              <v-switch
                v-model="prefs.availabilityReminders"
                color="primary"
                label="Availability reminders"
                hide-details
                inset
              />
            </template>
          </v-card-text>

          <v-divider v-if="!loading && !loadError" />

          <v-card-actions v-if="!loading && !loadError" class="px-4 py-3">
            <v-spacer />
            <v-btn
              variant="text"
              :disabled="saving || !isDirty"
              @click="reset"
            >
              Reset
            </v-btn>
            <v-btn
              color="primary"
              :loading="saving"
              :disabled="!isDirty"
              @click="save"
            >
              Save changes
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="mt-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-view-dashboard-edit-outline</v-icon>
            Appearance
          </v-card-title>
          <v-card-subtitle>
            Tune how dense the interface feels.
          </v-card-subtitle>

          <v-divider />

          <v-card-text>
            <div class="text-subtitle-2 mb-2">UI density</div>
            <v-btn-toggle
              :model-value="density"
              mandatory
              color="primary"
              variant="outlined"
              divided
              @update:model-value="onDensityChange"
            >
              <v-btn value="comfortable">
                <v-icon start size="18">mdi-format-line-spacing</v-icon>
                Comfortable
              </v-btn>
              <v-btn value="compact">
                <v-icon start size="18">mdi-format-align-justify</v-icon>
                Compact
              </v-btn>
            </v-btn-toggle>
            <div class="text-caption text-medium-emphasis mt-2">
              Compact tightens card padding and table rows for denser screens.
            </div>
          </v-card-text>
        </v-card>

        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          location="bottom right"
          :timeout="3000"
        >
          {{ snackbar.text }}
        </v-snackbar>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../api/axios'
import { density, setDensity, type Density } from '../utils/density'

interface Preferences {
  emailNotifications: boolean
  pushNotifications: boolean
  shiftAssignments: boolean
  shiftCancellations: boolean
  swapRequests: boolean
  schedulePublished: boolean
  availabilityReminders: boolean
}

const DEFAULTS: Preferences = {
  emailNotifications: true,
  pushNotifications: true,
  shiftAssignments: true,
  shiftCancellations: true,
  swapRequests: true,
  schedulePublished: true,
  availabilityReminders: true
}

const loading = ref(true)
const saving = ref(false)
const loadError = ref<string | null>(null)
const prefs = reactive<Preferences>({ ...DEFAULTS })
const original = ref<Preferences>({ ...DEFAULTS })
const snackbar = reactive({ show: false, text: '', color: 'success' })

const isDirty = computed(() =>
  (Object.keys(prefs) as Array<keyof Preferences>).some(
    (k) => prefs[k] !== original.value[k]
  )
)

function applyPreferences(p: Partial<Preferences>) {
  const merged: Preferences = { ...DEFAULTS, ...p }
  Object.assign(prefs, merged)
  original.value = { ...merged }
}

async function load() {
  loading.value = true
  loadError.value = null
  try {
    const { data } = await api.get('/api/notifications/preferences')
    applyPreferences(data?.preferences ?? {})
  } catch (err: any) {
    loadError.value =
      err?.response?.data?.message || 'Could not load notification preferences.'
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const { data } = await api.patch('/api/notifications/preferences', { ...prefs })
    applyPreferences(data?.preferences ?? prefs)
    snackbar.text = 'Preferences saved'
    snackbar.color = 'success'
    snackbar.show = true
  } catch (err: any) {
    snackbar.text =
      err?.response?.data?.message || 'Failed to save preferences'
    snackbar.color = 'error'
    snackbar.show = true
  } finally {
    saving.value = false
  }
}

function reset() {
  Object.assign(prefs, original.value)
}

function onDensityChange(value: Density | null) {
  if (value) setDensity(value)
}

onMounted(load)
</script>
