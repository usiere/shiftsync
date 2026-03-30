import { Router, Request, Response } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { startOfWeek, endOfWeek, startOfDay, endOfDay, parseISO } from 'date-fns'

const router = Router()
const prisma = new PrismaClient()

// Apply authentication middleware to all routes
router.use(authenticateToken)

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     description: Returns key metrics for the dashboard including staff count, shifts this week, pending swaps, and overtime alerts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalStaff:
 *                   type: integer
 *                   description: Count of users with role STAFF
 *                 shiftsThisWeek:
 *                   type: integer
 *                   description: Count of shifts with dates in current week
 *                 pendingSwaps:
 *                   type: integer
 *                   description: Count of SwapRequests with status PENDING
 *                 overtimeAlerts:
 *                   type: integer
 *                   description: Count of staff whose total assigned hours this week exceed 35
 *               example:
 *                 totalStaff: 25
 *                 shiftsThisWeek: 45
 *                 pendingSwaps: 3
 *                 overtimeAlerts: 2
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 }) // Sunday

    // Count total staff
    const totalStaff = await prisma.user.count({
      where: {
        role: UserRole.STAFF,
        isActive: true
      }
    })

    // Count shifts this week
    const shiftsThisWeek = await prisma.shift.count({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd
        }
      }
    })

    // Count pending swaps
    const pendingSwaps = await prisma.swapRequest.count({
      where: {
        status: 'PENDING'
      }
    })

    // Calculate overtime alerts (staff with >35 hours this week)
    const staffWithAssignments = await prisma.user.findMany({
      where: {
        role: UserRole.STAFF,
        isActive: true
      },
      include: {
        shiftAssignments: {
          where: {
            isConfirmed: true,
            shift: {
              date: {
                gte: weekStart,
                lte: weekEnd
              }
            }
          },
          include: {
            shift: true
          }
        }
      }
    })

    let overtimeAlerts = 0
    for (const staff of staffWithAssignments) {
      const totalHours = staff.shiftAssignments.reduce((sum, assignment) => {
        const shift = assignment.shift
        const startTime = new Date(shift.startTime)
        const endTime = new Date(shift.endTime)
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        return sum + hours
      }, 0)

      if (totalHours > 35) {
        overtimeAlerts++
      }
    }

    res.json({
      totalStaff,
      shiftsThisWeek,
      pendingSwaps,
      overtimeAlerts
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' })
  }
})

export default router