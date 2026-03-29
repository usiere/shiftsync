<template>
  <div class="notification-preferences">
    <div class="preferences-header">
      <h2 class="preferences-title">Notification Preferences</h2>
      <p class="preferences-description">
        Choose how you'd like to be notified about important updates
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="preferences-loading">
      <div class="loading-spinner"></div>
      <span>Loading preferences...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="preferences-error">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load preferences</h3>
      <p>{{ error }}</p>
      <button @click="loadPreferences" class="retry-btn">
        Try Again
      </button>
    </div>

    <!-- Preferences Form -->
    <form v-else @submit.prevent="savePreferences" class="preferences-form">
      <!-- General Notification Settings -->
      <div class="preferences-section">
        <h3 class="section-title">General</h3>
        <div class="section-description">
          Control overall notification delivery methods
        </div>

        <div class="preference-group">
          <div class="preference-item">
            <label class="preference-label">
              <input
                type="checkbox"
                v-model="preferences.emailNotifications"
                class="preference-checkbox"
              />
              <div class="preference-content">
                <div class="preference-title">Email Notifications</div>
                <div class="preference-subtitle">
                  Receive notifications via email (simulated in this demo)
                </div>
              </div>
            </label>
          </div>

          <div class="preference-item">
            <label class="preference-label">
              <input
                type="checkbox"
                v-model="preferences.pushNotifications"
                class="preference-checkbox"
              />
              <div class="preference-content">
                <div class="preference-title">Push Notifications</div>
                <div class="preference-subtitle">
                  Receive real-time browser notifications
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Shift-Related Notifications -->
      <div class="preferences-section">
        <h3 class="section-title">Shift Notifications</h3>
        <div class="section-description">
          Get notified about your shift assignments and changes
        </div>

        <div class="preference-group">
          <div class="preference-item">
            <label class="preference-label">
              <input
                type="checkbox"
                v-model="preferences.shiftAssignments"
                class="preference-checkbox"
              />
              <div class="preference-content">
                <div class="preference-title">Shift Assignments</div>
                <div class="preference-subtitle">
                  When you're assigned to or removed from shifts
                </div>
              </div>
            </label>
          </div>

          <div class="preference-item">
            <label class="preference-label">
              <input
                type="checkbox"
                v-model="preferences.shiftCancellations"
                class="preference-checkbox"
              />
              <div class="preference-content">
                <div class="preference-title">Shift Cancellations</div>
                <div class="preference-subtitle">
                  When your shifts are cancelled or modified
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Swap Request Notifications -->
      <div class="preferences-section">
        <h3 class="section-title">Swap Requests</h3>
        <div class="section-description">
          Stay updated on shift swap activities
        </div>

        <div class="preference-group">
          <div class="preference-item">
            <label class="preference-label">
              <input
                type="checkbox"
                v-model="preferences.swapRequests"
                class="preference-checkbox"
              />
              <div class="preference-content">
                <div class="preference-title">Swap Request Updates</div>
                <div class="preference-subtitle">
                  New requests, acceptances, and approvals
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Schedule Notifications -->
      <div class="preferences-section">
        <h3 class="section-title">Schedule Updates</h3>
        <div class="section-description">
          Be informed about schedule publications and changes
        </div>

        <div class="preference-group">
          <div class="preference-item">
            <label class="preference-label">
              <input
                type="checkbox"
                v-model="preferences.schedulePublished"
                class="preference-checkbox"
              />
              <div class="preference-content">
                <div class="preference-title">Schedule Published</div>
                <div class="preference-subtitle">
                  When new weekly schedules are available
                </div>
              </div>
            </label>
          </div>

          <div class="preference-item">
            <label class="preference-label">
              <input
                type="checkbox"
                v-model="preferences.availabilityReminders"
                class="preference-checkbox"
              />
              <div class="preference-content">
                <div class="preference-title">Availability Reminders</div>
                <div class="preference-subtitle">
                  Reminders to update your availability
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Save/Reset Actions -->
      <div class="preferences-actions">
        <button
          type="button"
          @click="resetToDefaults"
          :disabled="saving"
          class="reset-btn"
        >
          Reset to Defaults
        </button>

        <div class="save-actions">
          <button
            type="button"
            @click="loadPreferences"
            :disabled="saving"
            class="cancel-btn"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="saving || !hasChanges"
            class="save-btn"
          >
            <span v-if="saving" class="save-spinner"></span>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="saveSuccess" class="save-success">
        ✓ Preferences saved successfully!
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'

interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  shiftAssignments: boolean
  shiftCancellations: boolean
  swapRequests: boolean
  schedulePublished: boolean
  availabilityReminders: boolean
}

// State
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const saveSuccess = ref(false)

// Default preferences
const defaultPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  shiftAssignments: true,
  shiftCancellations: true,
  swapRequests: true,
  schedulePublished: true,
  availabilityReminders: true
}

// Current preferences
const preferences = reactive<NotificationPreferences>({ ...defaultPreferences })

// Original preferences for change detection
const originalPreferences = ref<NotificationPreferences>({ ...defaultPreferences })

// API configuration
const API_BASE = process.env.VUE_APP_API_URL || 'http://localhost:3000'

const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
})

// Computed properties
const hasChanges = computed(() => {
  return Object.keys(preferences).some(key => {
    return preferences[key as keyof NotificationPreferences] !==
           originalPreferences.value[key as keyof NotificationPreferences]
  })
})

// Load preferences from API
const loadPreferences = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${API_BASE}/api/notifications/preferences`, {
      headers: getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Update preferences with API data
    Object.assign(preferences, data.preferences)
    originalPreferences.value = { ...data.preferences }

  } catch (err) {
    console.error('Error loading preferences:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load preferences'
  } finally {
    loading.value = false
  }
}

// Save preferences to API
const savePreferences = async () => {
  if (!hasChanges.value || saving.value) return

  saving.value = true
  saveSuccess.value = false

  try {
    const response = await fetch(`${API_BASE}/api/notifications/preferences`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    // Update original preferences to reflect saved state
    originalPreferences.value = { ...data.preferences }

    // Show success message
    saveSuccess.value = true
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)

  } catch (err) {
    console.error('Error saving preferences:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save preferences'
  } finally {
    saving.value = false
  }
}

// Reset to default preferences
const resetToDefaults = () => {
  Object.assign(preferences, defaultPreferences)
}

// Clear success message when preferences change
watch(preferences, () => {
  if (saveSuccess.value) {
    saveSuccess.value = false
  }
}, { deep: true })

// Load preferences on mount
onMounted(() => {
  loadPreferences()
})
</script>

<style scoped>
.notification-preferences {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.preferences-header {
  margin-bottom: 32px;
  text-align: center;
}

.preferences-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.preferences-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.preferences-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #6b7280;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.preferences-error {
  text-align: center;
  padding: 48px 24px;
  color: #dc2626;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.retry-btn {
  background: #dc2626;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 16px;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #b91c1c;
}

.preferences-form {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.preferences-section {
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.preferences-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
}

.section-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.preference-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preference-item {
  display: flex;
  align-items: flex-start;
}

.preference-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  gap: 12px;
  width: 100%;
}

.preference-checkbox {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: #2563eb;
  flex-shrink: 0;
}

.preference-content {
  flex: 1;
}

.preference-title {
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
}

.preference-subtitle {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.preferences-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.reset-btn {
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.reset-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-actions {
  display: flex;
  gap: 12px;
}

.cancel-btn {
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
  color: #374151;
}

.save-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.save-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.save-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.save-success {
  background: #10b981;
  color: white;
  padding: 12px 24px;
  text-align: center;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .notification-preferences {
    padding: 16px;
  }

  .preferences-title {
    font-size: 24px;
  }

  .preferences-section {
    padding: 20px;
  }

  .preferences-actions {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
    padding: 20px;
  }

  .save-actions {
    width: 100%;
    justify-content: stretch;
  }

  .cancel-btn,
  .save-btn {
    flex: 1;
    justify-content: center;
  }
}
</style>