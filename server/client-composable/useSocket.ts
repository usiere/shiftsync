import { ref, onMounted, onUnmounted, computed } from 'vue'
import { io, Socket } from 'socket.io-client'
import type {
  SchedulePublishedEvent,
  ScheduleUpdatedEvent,
  SwapRequestedEvent,
  SwapResolvedEvent,
  OvertimeWarningEvent,
  ConflictDetectedEvent
} from '../src/services/socketService'

export interface SocketUser {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

export interface ToastNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  duration?: number
  actions?: Array<{
    label: string
    handler: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
}

export function useSocket(user: SocketUser, authToken: string) {
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const notifications = ref<ToastNotification[]>([])
  const scheduleNeedsRefresh = ref(false)

  const serverUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

  const connect = () => {
    if (socket.value?.connected) {
      return
    }

    socket.value = io(serverUrl, {
      auth: {
        token: authToken
      },
      autoConnect: true
    })

    setupEventHandlers()
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  const setupEventHandlers = () => {
    if (!socket.value) return

    // Connection events
    socket.value.on('connect', () => {
      console.log('Connected to Socket.io server')
      connected.value = true
    })

    socket.value.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.io server:', reason)
      connected.value = false
    })

    socket.value.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error)
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to connect to real-time updates. Please refresh the page.',
        duration: 10000
      })
    })

    socket.value.on('connection:established', (data) => {
      console.log('Socket.io connection established:', data)
      addNotification({
        type: 'success',
        title: 'Connected',
        message: 'Real-time updates are now active',
        duration: 3000
      })
    })

    // Schedule events
    socket.value.on('schedule:published', (event: SchedulePublishedEvent) => {
      console.log('Schedule published event:', event)
      scheduleNeedsRefresh.value = true

      addNotification({
        type: 'info',
        title: 'Schedule Published',
        message: `${event.publishedBy.name} published the schedule for ${event.locationName} (${event.weekStart} to ${event.weekEnd})`,
        actions: [
          {
            label: 'View Schedule',
            handler: () => refreshSchedule(),
            style: 'primary'
          }
        ]
      })
    })

    socket.value.on('schedule:updated', (event: ScheduleUpdatedEvent) => {
      console.log('Schedule updated event:', event)
      scheduleNeedsRefresh.value = true

      const changesList = event.changes.map(c => `${c.field}: ${c.oldValue} → ${c.newValue}`).join(', ')

      addNotification({
        type: 'warning',
        title: 'Schedule Updated',
        message: `${event.updatedBy.name} updated a shift at ${event.locationName}. Changes: ${changesList}`,
        actions: [
          {
            label: 'Refresh',
            handler: () => refreshSchedule(),
            style: 'primary'
          }
        ]
      })
    })

    // Swap request events
    socket.value.on('swap:requested', (event: SwapRequestedEvent) => {
      console.log('Swap requested event:', event)

      if (event.type === 'SWAP') {
        addNotification({
          type: 'info',
          title: 'Swap Request',
          message: `${event.fromUser.name} wants to swap their ${event.fromShift.location} shift (${event.fromShift.date}) with your ${event.toShift?.location} shift (${event.toShift?.date})`,
          actions: [
            {
              label: 'View Request',
              handler: () => navigateToSwapRequests(),
              style: 'primary'
            }
          ],
          duration: 15000
        })
      } else {
        addNotification({
          type: 'info',
          title: 'Shift Available',
          message: `${event.fromUser.name} dropped their ${event.fromShift.location} shift on ${event.fromShift.date}. Pick it up?`,
          actions: [
            {
              label: 'View Available Shifts',
              handler: () => navigateToAvailableShifts(),
              style: 'primary'
            }
          ],
          duration: 15000
        })
      }
    })

    socket.value.on('swap:resolved', (event: SwapResolvedEvent) => {
      console.log('Swap resolved event:', event)
      scheduleNeedsRefresh.value = true

      const statusMessages = {
        ACCEPTED: `Your swap request for ${event.shift.location} (${event.shift.date}) was accepted by ${event.resolvedBy.name}`,
        APPROVED: `Your swap request for ${event.shift.location} (${event.shift.date}) was approved by ${event.resolvedBy.name}`,
        CANCELLED: `Your swap request for ${event.shift.location} (${event.shift.date}) was cancelled`
      }

      addNotification({
        type: event.status === 'CANCELLED' ? 'warning' : 'success',
        title: `Swap ${event.status.toLowerCase().replace(/^\w/, c => c.toUpperCase())}`,
        message: statusMessages[event.status],
        actions: [
          {
            label: 'View Schedule',
            handler: () => refreshSchedule(),
            style: 'primary'
          }
        ]
      })
    })

    // Manager/Admin specific events
    if (user.role === 'MANAGER' || user.role === 'ADMIN') {
      socket.value.on('overtime:warning', (event: OvertimeWarningEvent) => {
        console.log('Overtime warning event:', event)

        addNotification({
          type: 'warning',
          title: 'Overtime Warning',
          message: `Assigning ${event.userName} to ${event.shiftDetails.location} (${event.shiftDetails.date}) would result in ${event.overtimeImpact.projectedWeeklyHours} hours this week (+$${event.overtimeImpact.additionalOvertimeCost.toFixed(2)} overtime cost)`,
          duration: 10000
        })
      })

      socket.value.on('conflict:detected', (event: ConflictDetectedEvent) => {
        console.log('Conflict detected event:', event)

        addNotification({
          type: 'error',
          title: 'Assignment Conflict',
          message: `${event.userName} is already assigned to the ${event.shiftDetails.location} shift on ${event.shiftDetails.date}. ${event.firstManager.name} assigned them first.`,
          duration: 15000
        })
      })
    }
  }

  const addNotification = (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const newNotification: ToastNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration || 5000
    }

    notifications.value.unshift(newNotification)

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  const markScheduleAsRefreshed = () => {
    scheduleNeedsRefresh.value = false
  }

  // Navigation helpers (these would be implemented based on your Vue Router setup)
  const navigateToSwapRequests = () => {
    // Implementation depends on your Vue Router setup
    // Example: router.push('/swap-requests')
    console.log('Navigate to swap requests')
  }

  const navigateToAvailableShifts = () => {
    // Implementation depends on your Vue Router setup
    // Example: router.push('/available-shifts')
    console.log('Navigate to available shifts')
  }

  const refreshSchedule = () => {
    // This should trigger a refresh of the schedule component
    scheduleNeedsRefresh.value = true
    console.log('Refresh schedule triggered')
  }

  // Computed properties
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => n.timestamp > new Date(Date.now() - 30000)) // Last 30 seconds
  )

  const hasUnreadNotifications = computed(() => unreadNotifications.value.length > 0)

  // Lifecycle hooks
  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  // Manual emit functions for testing
  const emitEvent = (eventName: string, data: any) => {
    if (socket.value?.connected) {
      socket.value.emit(eventName, data)
    }
  }

  return {
    // State
    socket: computed(() => socket.value),
    connected,
    notifications,
    scheduleNeedsRefresh,
    unreadNotifications,
    hasUnreadNotifications,

    // Methods
    connect,
    disconnect,
    addNotification,
    removeNotification,
    clearAllNotifications,
    markScheduleAsRefreshed,
    emitEvent,

    // Navigation helpers
    navigateToSwapRequests,
    navigateToAvailableShifts,
    refreshSchedule
  }
}

// Singleton instance for app-wide usage
let socketInstance: ReturnType<typeof useSocket> | null = null

export function useGlobalSocket(user?: SocketUser, authToken?: string) {
  if (!socketInstance && user && authToken) {
    socketInstance = useSocket(user, authToken)
  }

  return socketInstance
}

export function disconnectGlobalSocket() {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}