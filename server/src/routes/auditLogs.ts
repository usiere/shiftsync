import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { requireManagerOrAdmin } from '../middleware/roleGuards'

const router = Router()
const prisma = new PrismaClient()

// Apply authentication and manager/admin role requirement
router.use(authenticateToken)
router.use(requireManagerOrAdmin)

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     description: Returns the most recent audit log records with user information
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         description: Number of audit logs to return
 *         example: 10
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   action:
 *                     type: string
 *                   entityType:
 *                     type: string
 *                   entityId:
 *                     type: integer
 *                   details:
 *                     type: string
 *                   userId:
 *                     type: integer
 *                   user:
 *                     type: object
 *                     properties:
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                   oldValues:
 *                     type: object
 *                     nullable: true
 *                   newValues:
 *                     type: object
 *                     nullable: true
 *               example:
 *                 - id: 123
 *                   action: "CREATE"
 *                   entityType: "Shift"
 *                   entityId: 456
 *                   details: "Created new shift for Downtown Manhattan"
 *                   userId: 1
 *                   user:
 *                     firstName: "John"
 *                     lastName: "Manager"
 *                     email: "manager@example.com"
 *                     role: "MANAGER"
 *                   timestamp: "2024-01-15T10:30:00Z"
 *                   oldValues: null
 *                   newValues: { "location": "Downtown Manhattan", "date": "2024-01-20" }
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5
    const validatedLimit = Math.min(Math.max(limit, 1), 100) // Between 1 and 100

    const auditLogs = await prisma.auditLog.findMany({
      take: validatedLimit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    })

    // Format the response to match expected frontend structure
    const formattedLogs = auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.description || `${log.action} ${log.entityType}`,
      userId: log.userId,
      user: log.user,
      timestamp: log.createdAt.toISOString(),
      oldValues: log.oldValues,
      newValues: log.newValues
    }))

    res.json(formattedLogs)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
})

export default router