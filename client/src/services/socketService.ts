import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notifications'

interface _ServerToClientEvents {
  'schedule:published': (data: { scheduleId: string; title: string }) => void
  'schedule:updated': (data: { scheduleId: string; title: string; changes: string[] }) => void
  'swap:requested': (data: { requestId: string; requesterName: string; shiftTitle: string }) => void
  'swap:resolved': (data: { requestId: string; status: 'approved' | 'rejected'; shiftTitle: string }) => void
  'overtime:warning': (data: { userId: string; userName: string; hours: number; week: string }) => void
  'conflict:detected': (data: { type: string; description: string; severity: 'warning' | 'error' }) => void
  'notification:new': (data: { id: number; title: string; message: string; type: string }) => void
  'notification:unread-count': (data: { count: number }) => void
}

interface _ClientToServerEvents {
  'join:user-room': (userId: number) => void
  'leave:user-room': (userId: number) => void
}

class SocketService {
  private socket: Socket<_ServerToClientEvents, _ClientToServerEvents> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    const token = localStorage.getItem('token')

    if (!token) {
      console.warn('Cannot connect to socket: No authentication token')
      return
    }

    const authStore = useAuthStore()
    if (!authStore.userId) {
      console.warn('Cannot connect to socket: No user ID available')
      return
    }

    if (this.socket?.connected) {
      console.log('Socket already connected')
      return
    }

    try {
      this.socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionAttempts: this.maxReconnectAttempts
      })

      this.setupEventListeners()
      this.joinUserRoom()

      console.log('Socket connection initiated')
    } catch (error) {
      console.error('Failed to initialize socket connection:', error)
    }
  }

  disconnect() {
    if (this.socket) {
      const authStore = useAuthStore()
      if (authStore.userId) {
        this.leaveUserRoom()
      }
      this.socket.disconnect()
      this.socket = null
      console.log('Socket disconnected')
    }
  }

  private setupEventListeners() {
    if (!this.socket) return

    const notificationStore = useNotificationStore()

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
      this.joinUserRoom()
    })

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error)
      this.handleReconnect()
    })

    // Schedule events
    this.socket.on('schedule:published', (data: { scheduleId: string; title: string }) => {
      notificationStore.showToast({
        title: 'Schedule Published',
        message: `${data.title} has been published`,
        type: 'success',
        icon: 'mdi-calendar-check'
      })
    })

    this.socket.on('schedule:updated', (data: { scheduleId: string; title: string; changes: string[] }) => {
      notificationStore.showToast({
        title: 'Schedule Updated',
        message: `${data.title} has been updated: ${data.changes.join(', ')}`,
        type: 'info',
        icon: 'mdi-calendar-edit'
      })
    })

    // Swap events
    this.socket.on('swap:requested', (data: { requestId: string; requesterName: string; shiftTitle: string }) => {
      notificationStore.showToast({
        title: 'Swap Request',
        message: `${data.requesterName} wants to swap ${data.shiftTitle}`,
        type: 'info',
        icon: 'mdi-swap-horizontal',
        timeout: 8000
      })
    })

    this.socket.on('swap:resolved', (data: { requestId: string; status: 'approved' | 'rejected'; shiftTitle: string }) => {
      const isApproved = data.status === 'approved'
      notificationStore.showToast({
        title: `Swap ${isApproved ? 'Approved' : 'Rejected'}`,
        message: `Your swap request for ${data.shiftTitle} was ${data.status}`,
        type: isApproved ? 'success' : 'warning',
        icon: isApproved ? 'mdi-check-circle' : 'mdi-close-circle'
      })
    })

    // Overtime warning
    this.socket.on('overtime:warning', (data: { userId: string; userName: string; hours: number; week: string }) => {
      notificationStore.showToast({
        title: 'Overtime Warning',
        message: `${data.userName} is approaching ${data.hours}h for ${data.week}`,
        type: 'warning',
        icon: 'mdi-clock-alert',
        timeout: 10000
      })
    })

    // Conflict detection
    this.socket.on('conflict:detected', (data: { type: string; description: string; severity: 'warning' | 'error' }) => {
      notificationStore.showToast({
        title: 'Scheduling Conflict',
        message: data.description,
        type: data.severity === 'error' ? 'error' : 'warning',
        icon: 'mdi-alert-circle',
        timeout: 12000
      })
    })

    // Real-time notifications
    this.socket.on('notification:new', (data: { id: number; title: string; message: string; type: string }) => {
      notificationStore.handleNewNotification(data)
    })

    this.socket.on('notification:unread-count', (data: { count: number }) => {
      notificationStore.updateUnreadCount(data.count)
    })
  }

  private joinUserRoom() {
    const authStore = useAuthStore()
    if (this.socket && authStore.userId) {
      this.socket.emit('join:user-room', authStore.userId)
      console.log(`Joined user room: ${authStore.userId}`)
    }
  }

  private leaveUserRoom() {
    const authStore = useAuthStore()
    if (this.socket && authStore.userId) {
      this.socket.emit('leave:user-room', authStore.userId)
      console.log(`Left user room: ${authStore.userId}`)
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay * this.reconnectAttempts)
    } else {
      console.error('Max reconnection attempts reached')
      const notificationStore = useNotificationStore()
      notificationStore.showToast({
        title: 'Connection Lost',
        message: 'Unable to connect to server. Please refresh the page.',
        type: 'error',
        icon: 'mdi-wifi-off',
        timeout: 0 // Persistent
      })
    }
  }

  // Public method to check connection status
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Public method to get socket ID
  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

// Create singleton instance
export const socketService = new SocketService()
export default socketService