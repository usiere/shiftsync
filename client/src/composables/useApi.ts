import { ref, type Ref } from 'vue'
import api from '@/services/api'

export interface ApiState<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<string | null>
}

export function useApi<T>() {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async (apiCall: () => Promise<T>): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await apiCall()
      data.value = result
      return result
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'An error occurred'
      error.value = message
      console.error('API Error:', message, err)
      return null
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    data.value = null
    loading.value = false
    error.value = null
  }

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

// Dashboard API calls
export function useDashboardApi() {
  const { data, loading, error, execute } = useApi<{
    totalStaff: number
    shiftsThisWeek: number
    pendingSwaps: number
    overtimeHours: number
  }>()

  const fetchStats = () => execute(() =>
    api.get('/api/dashboard/stats').then(response => response.data)
  )

  return {
    stats: data,
    loading,
    error,
    fetchStats
  }
}

// Shifts API calls
export function useShiftsApi() {
  const { data, loading, error, execute } = useApi<any[]>()

  const fetchShifts = (params?: any) => execute(() =>
    api.get('/api/shifts', { params }).then(response => response.data)
  )

  const createShift = (shiftData: any) => execute(() =>
    api.post('/api/shifts', shiftData).then(response => response.data)
  )

  const updateShift = (id: number, shiftData: any) => execute(() =>
    api.put(`/api/shifts/${id}`, shiftData).then(response => response.data)
  )

  const deleteShift = (id: number) => execute(() =>
    api.delete(`/api/shifts/${id}`).then(response => response.data)
  )

  return {
    shifts: data,
    loading,
    error,
    fetchShifts,
    createShift,
    updateShift,
    deleteShift
  }
}

// Swap Requests API calls
export function useSwapRequestsApi() {
  const { data, loading, error, execute } = useApi<any[]>()

  const fetchSwapRequests = () => execute(() =>
    api.get('/api/swap-requests').then(response => response.data)
  )

  const createSwapRequest = (requestData: any) => execute(() =>
    api.post('/api/swap-requests', requestData).then(response => response.data)
  )

  const approveSwapRequest = (id: number) => execute(() =>
    api.patch(`/api/swap-requests/${id}/approve`).then(response => response.data)
  )

  const rejectSwapRequest = (id: number) => execute(() =>
    api.patch(`/api/swap-requests/${id}/reject`).then(response => response.data)
  )

  const cancelSwapRequest = (id: number) => execute(() =>
    api.delete(`/api/swap-requests/${id}`).then(response => response.data)
  )

  return {
    swapRequests: data,
    loading,
    error,
    fetchSwapRequests,
    createSwapRequest,
    approveSwapRequest,
    rejectSwapRequest,
    cancelSwapRequest
  }
}

// Notifications API calls
export function useNotificationsApi() {
  const { data, loading, error, execute } = useApi<any[]>()

  const fetchNotifications = () => execute(() =>
    api.get('/api/notifications').then(response => response.data)
  )

  const markAsRead = (id: number) => execute(() =>
    api.patch(`/api/notifications/${id}/read`).then(response => response.data)
  )

  const markAllAsRead = () => execute(() =>
    api.patch('/api/notifications/mark-all-read').then(response => response.data)
  )

  const fetchUnreadCount = () => execute(() =>
    api.get('/api/notifications/unread-count').then(response => response.data.count)
  )

  return {
    notifications: data,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount
  }
}