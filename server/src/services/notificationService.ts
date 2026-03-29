import { PrismaClient, NotificationType } from '@prisma/client'
import { getSocketService } from './socketService'

const prisma = new PrismaClient()

export interface CreateNotificationData {
  userId: number
  type: NotificationType
  title: string
  message: string
  data?: any
}

export interface NotificationWithUnreadCount {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  data?: any
  isRead: boolean
  readAt?: Date
  createdAt: Date
}

export class NotificationService {
  /**
   * Create a new notification and emit real-time update
   */
  async createNotification(notificationData: CreateNotificationData): Promise<void> {
    try {
      // Check if user has preferences that disable this notification type
      const preferences = await prisma.userNotificationPreferences.findUnique({
        where: { userId: notificationData.userId }
      })

      if (preferences && !this.shouldSendNotification(notificationData.type, preferences)) {
        return
      }

      const notification = await prisma.notification.create({
        data: notificationData
      })

      // Get updated unread count
      const unreadCount = await this.getUnreadCount(notificationData.userId)

      // Emit real-time notification to the user
      try {
        const socketService = getSocketService()
        socketService.emitToUser(notificationData.userId, 'newNotification', {
          notification: {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            isRead: notification.isRead,
            createdAt: notification.createdAt
          },
          unreadCount
        })
      } catch (socketError) {
        console.error('Failed to emit notification via socket:', socketError)
      }

    } catch (error) {
      console.error('Failed to create notification:', error)
      throw error
    }
  }

  /**
   * Create multiple notifications for different users
   */
  async createNotifications(notifications: CreateNotificationData[]): Promise<void> {
    try {
      for (const notificationData of notifications) {
        await this.createNotification(notificationData)
      }
    } catch (error) {
      console.error('Failed to create notifications:', error)
      throw error
    }
  }

  /**
   * Get all notifications for a user with pagination
   */
  async getUserNotifications(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notifications: NotificationWithUnreadCount[]; total: number; unreadCount: number }> {
    try {
      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.notification.count({
          where: { userId }
        }),
        prisma.notification.count({
          where: { userId, isRead: false }
        })
      ])

      return {
        notifications: notifications as NotificationWithUnreadCount[],
        total,
        unreadCount
      }
    } catch (error) {
      console.error('Failed to get user notifications:', error)
      throw error
    }
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    try {
      return await prisma.notification.count({
        where: { userId, isRead: false }
      })
    } catch (error) {
      console.error('Failed to get unread count:', error)
      throw error
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<{ success: boolean; unreadCount: number }> {
    try {
      await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      const unreadCount = await this.getUnreadCount(userId)

      // Emit updated unread count
      try {
        const socketService = getSocketService()
        socketService.emitToUser(userId, 'notificationRead', {
          notificationId,
          unreadCount
        })
      } catch (socketError) {
        console.error('Failed to emit notification read update:', socketError)
      }

      return { success: true, unreadCount }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<{ success: boolean; updatedCount: number }> {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      // Emit updated unread count (should be 0)
      try {
        const socketService = getSocketService()
        socketService.emitToUser(userId, 'allNotificationsRead', {
          unreadCount: 0
        })
      } catch (socketError) {
        console.error('Failed to emit all notifications read update:', socketError)
      }

      return { success: true, updatedCount: result.count }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      throw error
    }
  }

  /**
   * Get or create notification preferences for a user
   */
  async getUserPreferences(userId: number) {
    try {
      let preferences = await prisma.userNotificationPreferences.findUnique({
        where: { userId }
      })

      if (!preferences) {
        preferences = await prisma.userNotificationPreferences.create({
          data: { userId }
        })
      }

      return preferences
    } catch (error) {
      console.error('Failed to get user notification preferences:', error)
      throw error
    }
  }

  /**
   * Update notification preferences for a user
   */
  async updateUserPreferences(userId: number, preferences: Partial<{
    emailNotifications: boolean
    pushNotifications: boolean
    shiftAssignments: boolean
    shiftCancellations: boolean
    swapRequests: boolean
    schedulePublished: boolean
    availabilityReminders: boolean
  }>) {
    try {
      const updatedPreferences = await prisma.userNotificationPreferences.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          ...preferences
        }
      })

      return updatedPreferences
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      throw error
    }
  }

  /**
   * Check if notification should be sent based on user preferences
   */
  private shouldSendNotification(type: NotificationType, preferences: any): boolean {
    switch (type) {
      case NotificationType.SHIFT_ASSIGNED:
      case NotificationType.SHIFT_CANCELLED:
        return preferences.shiftAssignments
      case NotificationType.SWAP_REQUEST:
      case NotificationType.SWAP_REQUESTED:
      case NotificationType.SWAP_APPROVED:
      case NotificationType.SWAP_DENIED:
      case NotificationType.SWAP_ACCEPTED:
      case NotificationType.SWAP_CANCELLED:
      case NotificationType.SWAP_PENDING_APPROVAL:
      case NotificationType.DROP_REQUESTED:
      case NotificationType.SHIFT_PICKED_UP:
        return preferences.swapRequests
      case NotificationType.SCHEDULE_PUBLISHED:
        return preferences.schedulePublished
      case NotificationType.AVAILABILITY_REMINDER:
        return preferences.availabilityReminders
      default:
        return true
    }
  }

  /**
   * Helper methods for creating specific notification types
   */
  async notifyShiftAssigned(userId: number, shiftInfo: { date: string; time: string; location: string }) {
    await this.createNotification({
      userId,
      type: NotificationType.SHIFT_ASSIGNED,
      title: 'New Shift Assignment',
      message: `You've been assigned to work at ${shiftInfo.location} on ${shiftInfo.date} at ${shiftInfo.time}`,
      data: shiftInfo
    })
  }

  async notifyShiftCancelled(userId: number, shiftInfo: { date: string; time: string; location: string }) {
    await this.createNotification({
      userId,
      type: NotificationType.SHIFT_CANCELLED,
      title: 'Shift Cancelled',
      message: `Your shift at ${shiftInfo.location} on ${shiftInfo.date} at ${shiftInfo.time} has been cancelled`,
      data: shiftInfo
    })
  }

  async notifySwapRequest(userId: number, swapInfo: { requesterName: string; date: string; location: string }) {
    await this.createNotification({
      userId,
      type: NotificationType.SWAP_REQUEST,
      title: 'Swap Request Received',
      message: `${swapInfo.requesterName} wants to swap shifts with you on ${swapInfo.date} at ${swapInfo.location}`,
      data: swapInfo
    })
  }

  async notifySwapApproved(userId: number, swapInfo: { date: string; location: string }) {
    await this.createNotification({
      userId,
      type: NotificationType.SWAP_APPROVED,
      title: 'Swap Request Approved',
      message: `Your swap request for ${swapInfo.date} at ${swapInfo.location} has been approved`,
      data: swapInfo
    })
  }

  async notifySchedulePublished(userIds: number[], scheduleInfo: { weekStart: string; weekEnd: string; location: string }) {
    const notifications: CreateNotificationData[] = userIds.map(userId => ({
      userId,
      type: NotificationType.SCHEDULE_PUBLISHED,
      title: 'New Schedule Published',
      message: `The schedule for ${scheduleInfo.weekStart} - ${scheduleInfo.weekEnd} at ${scheduleInfo.location} is now available`,
      data: scheduleInfo
    }))

    await this.createNotifications(notifications)
  }
}

// Global notification service instance
export const notificationService = new NotificationService()