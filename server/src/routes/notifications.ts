import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'
import { notificationService } from '../services/notificationService'

const router = Router()

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Returns all notifications for the authenticated user, sorted by date, with read/unread status
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of notifications to return (max 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of notifications to skip for pagination
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 total:
 *                   type: integer
 *                 unreadCount:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const offset = parseInt(req.query.offset as string) || 0

    const result = await notificationService.getUserNotifications(userId, limit, offset)

    res.json({
      message: 'Notifications retrieved successfully',
      notifications: result.notifications,
      total: result.total,
      unreadCount: result.unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < result.total
      }
    })

  } catch (error) {
    console.error('Get notifications error:', error)
    res.status(500).json({
      error: 'Failed to retrieve notifications',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     description: Returns the count of unread notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/unread-count', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const unreadCount = await notificationService.getUnreadCount(userId)

    res.json({ unreadCount })

  } catch (error) {
    console.error('Get unread count error:', error)
    res.status(500).json({
      error: 'Failed to get unread count',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 unreadCount:
 *                   type: integer
 *       400:
 *         description: Invalid notification ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/read', authenticateToken, async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id)
    const userId = req.user!.id

    if (isNaN(notificationId)) {
      return res.status(400).json({
        error: 'Invalid notification ID',
        message: 'Notification ID must be a number'
      })
    }

    const result = await notificationService.markAsRead(notificationId, userId)

    res.json({
      message: 'Notification marked as read successfully',
      success: result.success,
      unreadCount: result.unreadCount
    })

  } catch (error) {
    console.error('Mark notification as read error:', error)
    return res.status(500).json({
      error: 'Failed to mark notification as read',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Marks all notifications as read for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 success:
 *                   type: boolean
 *                 updatedCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/read-all', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const result = await notificationService.markAllAsRead(userId)

    res.json({
      message: 'All notifications marked as read successfully',
      success: result.success,
      updatedCount: result.updatedCount
    })

  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Get notification preferences
 *     description: Returns notification preferences for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Notification preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const preferences = await notificationService.getUserPreferences(userId)

    res.json({ preferences })

  } catch (error) {
    console.error('Get notification preferences error:', error)
    res.status(500).json({
      error: 'Failed to get notification preferences',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/notifications/preferences:
 *   patch:
 *     summary: Update notification preferences
 *     description: Updates notification preferences for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emailNotifications:
 *                 type: boolean
 *               pushNotifications:
 *                 type: boolean
 *               shiftAssignments:
 *                 type: boolean
 *               shiftCancellations:
 *                 type: boolean
 *               swapRequests:
 *                 type: boolean
 *               schedulePublished:
 *                 type: boolean
 *               availabilityReminders:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 preferences:
 *                   $ref: '#/components/schemas/NotificationPreferences'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/preferences', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id
    const {
      emailNotifications,
      pushNotifications,
      shiftAssignments,
      shiftCancellations,
      swapRequests,
      schedulePublished,
      availabilityReminders
    } = req.body

    const preferences = await notificationService.updateUserPreferences(userId, {
      emailNotifications,
      pushNotifications,
      shiftAssignments,
      shiftCancellations,
      swapRequests,
      schedulePublished,
      availabilityReminders
    })

    res.json({
      message: 'Notification preferences updated successfully',
      preferences
    })

  } catch (error) {
    console.error('Update notification preferences error:', error)
    res.status(500).json({
      error: 'Failed to update notification preferences',
      message: 'An internal server error occurred'
    })
  }
})

export default router