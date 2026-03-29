<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div" class="notification-list">
      <div
        v-for="notification in visibleNotifications"
        :key="notification.id"
        :class="[
          'notification-toast',
          `notification-toast--${notification.type}`,
          { 'notification-toast--with-actions': notification.actions?.length }
        ]"
      >
        <div class="notification-toast__icon">
          <Icon :name="getIconName(notification.type)" />
        </div>

        <div class="notification-toast__content">
          <h4 class="notification-toast__title">{{ notification.title }}</h4>
          <p class="notification-toast__message">{{ notification.message }}</p>

          <div v-if="notification.actions?.length" class="notification-toast__actions">
            <button
              v-for="action in notification.actions"
              :key="action.label"
              :class="[
                'notification-toast__action',
                `notification-toast__action--${action.style || 'secondary'}`
              ]"
              @click="handleActionClick(action, notification)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>

        <button
          class="notification-toast__close"
          @click="removeNotification(notification.id)"
          :aria-label="`Close ${notification.title} notification`"
        >
          <Icon name="x" />
        </button>
      </div>
    </TransitionGroup>

    <!-- Connection status indicator -->
    <div
      v-if="!connected"
      class="connection-status connection-status--disconnected"
    >
      <Icon name="wifi-off" />
      <span>Real-time updates disconnected</span>
      <button @click="connect" class="connection-status__retry">
        Retry
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalSocket, type ToastNotification } from './useSocket'

// Props
interface Props {
  maxVisible?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  autoRemove?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxVisible: 5,
  position: 'top-right',
  autoRemove: true
})

// Use the global socket instance
const socketComposable = useGlobalSocket()

if (!socketComposable) {
  throw new Error('Socket not initialized. Make sure to call useGlobalSocket with user and token first.')
}

const {
  connected,
  notifications,
  removeNotification,
  clearAllNotifications,
  connect
} = socketComposable

// Computed properties
const visibleNotifications = computed(() =>
  notifications.value.slice(0, props.maxVisible)
)

// Methods
const getIconName = (type: ToastNotification['type']) => {
  const iconMap = {
    info: 'info-circle',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle'
  }
  return iconMap[type]
}

const handleActionClick = (action: NonNullable<ToastNotification['actions']>[0], notification: ToastNotification) => {
  action.handler()

  // Remove notification after action is taken (optional)
  if (props.autoRemove) {
    removeNotification(notification.id)
  }
}

// Expose methods for parent components
defineExpose({
  clearAllNotifications,
  removeNotification
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  z-index: 9999;
  pointer-events: none;
}

/* Position variants */
.notification-container {
  top: 20px;
  right: 20px;
  max-width: 400px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid;
  pointer-events: auto;
  min-width: 320px;
  max-width: 400px;
}

/* Type variants */
.notification-toast--info {
  border-left-color: #3b82f6;
}

.notification-toast--success {
  border-left-color: #10b981;
}

.notification-toast--warning {
  border-left-color: #f59e0b;
}

.notification-toast--error {
  border-left-color: #ef4444;
}

.notification-toast__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-toast__content {
  flex: 1;
  min-width: 0;
}

.notification-toast__title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.notification-toast__message {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.notification-toast__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.notification-toast__action {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-toast__action--primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.notification-toast__action--primary:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.notification-toast__action--secondary {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.notification-toast__action--secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.notification-toast__action--danger {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.notification-toast__action--danger:hover {
  background: #dc2626;
  border-color: #dc2626;
}

.notification-toast__close {
  flex-shrink: 0;
  padding: 4px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s;
}

.notification-toast__close:hover {
  color: #6b7280;
  background: #f3f4f6;
}

/* Connection status */
.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  color: #92400e;
  font-size: 13px;
  font-weight: 500;
  margin-top: 12px;
  pointer-events: auto;
}

.connection-status--disconnected {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}

.connection-status__retry {
  padding: 4px 8px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}

.connection-status__retry:hover {
  background: #b91c1c;
}

/* Transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-container {
    left: 20px;
    right: 20px;
    max-width: none;
  }

  .notification-toast {
    min-width: 0;
    max-width: none;
  }
}
</style>