import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Toast {
  id: string
  title: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  icon?: string
  timeout?: number
  show?: boolean
}

interface Notification {
  id: number
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export const useNotificationStore = defineStore('notifications', () => {
  const toasts = ref<Toast[]>([])
  const unreadCount = ref(0)
  const notifications = ref<Notification[]>([])

  function showToast(toast: Omit<Toast, 'id' | 'show'>) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      id,
      show: true,
      timeout: 5000,
      ...toast
    }

    toasts.value.push(newToast)

    // Auto-remove toast after timeout (unless timeout is 0 for persistent toasts)
    if (newToast.timeout && newToast.timeout > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.timeout)
    }

    return id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value[index].show = false
      // Remove from array after animation completes
      setTimeout(() => {
        const currentIndex = toasts.value.findIndex(toast => toast.id === id)
        if (currentIndex > -1) {
          toasts.value.splice(currentIndex, 1)
        }
      }, 300)
    }
  }

  function clearAllToasts() {
    toasts.value.forEach(toast => {
      toast.show = false
    })
    setTimeout(() => {
      toasts.value.length = 0
    }, 300)
  }

  function updateUnreadCount(count: number) {
    unreadCount.value = count
  }

  function handleNewNotification(notification: { id: number; title: string; message: string; type: string }) {
    // Add to notifications list
    const newNotification: Notification = {
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    }

    notifications.value.unshift(newNotification)

    // Update unread count
    unreadCount.value++

    // Show toast notification
    showToast({
      title: notification.title,
      message: notification.message,
      type: getToastType(notification.type),
      icon: getNotificationIcon(notification.type),
      timeout: 6000
    })
  }

  function getToastType(notificationType: string): 'success' | 'info' | 'warning' | 'error' {
    switch (notificationType.toLowerCase()) {
      case 'shift_assigned':
      case 'swap_approved':
      case 'schedule_published':
        return 'success'
      case 'swap_request':
      case 'shift_updated':
      case 'schedule_updated':
        return 'info'
      case 'overtime_warning':
      case 'swap_pending':
      case 'availability_reminder':
        return 'warning'
      case 'shift_cancelled':
      case 'swap_denied':
      case 'conflict_detected':
        return 'error'
      default:
        return 'info'
    }
  }

  function getNotificationIcon(notificationType: string): string {
    switch (notificationType.toLowerCase()) {
      case 'shift_assigned':
        return 'mdi-calendar-plus'
      case 'shift_cancelled':
        return 'mdi-calendar-remove'
      case 'swap_request':
      case 'swap_requested':
        return 'mdi-swap-horizontal'
      case 'swap_approved':
        return 'mdi-check-circle'
      case 'swap_denied':
        return 'mdi-close-circle'
      case 'schedule_published':
        return 'mdi-calendar-check'
      case 'schedule_updated':
        return 'mdi-calendar-edit'
      case 'overtime_warning':
        return 'mdi-clock-alert'
      case 'availability_reminder':
        return 'mdi-calendar-question'
      case 'conflict_detected':
        return 'mdi-alert-circle'
      case 'shift_picked_up':
        return 'mdi-hand-extended'
      default:
        return 'mdi-bell'
    }
  }

  function markNotificationAsRead(notificationId: number) {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  function markAllNotificationsAsRead() {
    notifications.value.forEach(notification => {
      notification.read = true
    })
    unreadCount.value = 0
  }

  // Success toast shortcuts
  function showSuccess(title: string, message: string) {
    return showToast({ title, message, type: 'success', icon: 'mdi-check-circle' })
  }

  function showError(title: string, message: string) {
    return showToast({ title, message, type: 'error', icon: 'mdi-alert-circle', timeout: 8000 })
  }

  function showWarning(title: string, message: string) {
    return showToast({ title, message, type: 'warning', icon: 'mdi-alert', timeout: 7000 })
  }

  function showInfo(title: string, message: string) {
    return showToast({ title, message, type: 'info', icon: 'mdi-information' })
  }

  return {
    toasts,
    unreadCount,
    notifications,
    showToast,
    removeToast,
    clearAllToasts,
    updateUnreadCount,
    handleNewNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})