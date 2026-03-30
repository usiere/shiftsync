import { Router, Request, Response } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
// import { requireManagerOrAdmin } from '../middleware/roleGuards'
import { startOfWeek, endOfWeek, parseISO } from 'date-fns'

const router = Router()
const prisma = new PrismaClient()

// Apply authentication middleware
router.use(authenticateToken)

/**
 * @swagger
 * /api/staff/hours:
 *   get:
 *     summary: Get staff hours for a specific week
 *     description: Returns each staff member's total assigned hours for the specified week with overtime status
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: week
 *         schema:
 *           type: string
 *         description: Week in YYYY-WW format (ISO week). Defaults to current week.
 *         example: "2024-15"
 *       - in: query
 *         name: weekStart
 *         schema:
 *           type: string
 *           format: date
 *         description: Alternative week start date (YYYY-MM-DD format). Takes precedence over week parameter.
 *         example: "2024-04-08"
 *     responses:
 *       200:
 *         description: Staff hours data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   staffId:
 *                     type: integer
 *                   staffName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   totalHours:
 *                     type: number
 *                     format: float
 *                   overtimeStatus:
 *                     type: string
 *                     enum: [normal, warning, critical]
 *                     description: normal (<35h), warning (35-40h), critical (>40h)
 *                   shifts:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         date:
 *                           type: string
 *                           format: date
 *                         startTime:
 *                           type: string
 *                           format: time
 *                         endTime:
 *                           type: string
 *                           format: time
 *                         hours:
 *                           type: number
 *                           format: float
 *                         location:
 *                           type: string
 *                         skill:
 *                           type: string
 *               example:
 *                 - staffId: 1
 *                   staffName: "John Doe"
 *                   email: "john@example.com"
 *                   totalHours: 37.5
 *                   overtimeStatus: "warning"
 *                   shifts:
 *                     - id: 1
 *                       date: "2024-04-08"
 *                       startTime: "09:00:00"
 *                       endTime: "17:00:00"
 *                       hours: 8.0
 *                       location: "Downtown Manhattan"
 *                       skill: "Server"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (managers can only see their location staff)
 *       500:
 *         description: Server error
 */
router.get('/hours', async (req: Request, res: Response) => {
  try {
    const user = req.user!
    let weekStart: Date
    let weekEnd: Date

    // Parse week parameter
    if (req.query.weekStart) {
      weekStart = parseISO(req.query.weekStart as string)
      weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    } else if (req.query.week) {
      const weekParam = req.query.week as string
      const [year, week] = weekParam.split('-').map(Number)

      if (!year || !week) {
        return res.status(400).json({ error: 'Invalid week format. Use YYYY-WW (e.g., 2024-15)' })
      }

      // Calculate week start date from ISO week
      const jan4th = new Date(year, 0, 4)
      const jan4thWeekday = jan4th.getDay() || 7 // Sunday = 7
      const firstMonday = new Date(jan4th.getTime() - (jan4thWeekday - 1) * 24 * 60 * 60 * 1000)
      weekStart = new Date(firstMonday.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000)
      weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    } else {
      const now = new Date()
      weekStart = startOfWeek(now, { weekStartsOn: 1 })
      weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    }

    // Build where clause for staff filtering based on user role
    let staffWhereClause: any = {
      role: UserRole.STAFF,
      isActive: true
    }

    // If user is a manager, only show staff from their locations
    if (user.role === UserRole.MANAGER) {
      const managerLocations = await prisma.locationCertification.findMany({
        where: { userId: user.id },
        select: { locationId: true }
      })

      if (managerLocations.length === 0) {
        return res.json([]) // Manager has no locations
      }

      staffWhereClause.locationCertifications = {
        some: {
          locationId: {
            in: managerLocations.map(lc => lc.locationId)
          }
        }
      }
    }

    const staffWithHours = await prisma.user.findMany({
      where: staffWhereClause,
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
            shift: {
              include: {
                location: {
                  select: {
                    name: true
                  }
                },
                skill: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    const staffHoursData = staffWithHours.map(staff => {
      let totalHours = 0
      const shifts = staff.shiftAssignments.map(assignment => {
        const shift = assignment.shift
        const startTime = new Date(shift.startTime)
        const endTime = new Date(shift.endTime)
        const shiftHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        totalHours += shiftHours

        return {
          id: shift.id,
          date: shift.date.toISOString().split('T')[0],
          startTime: shift.startTime.toISOString().split('T')[1].slice(0, 8),
          endTime: shift.endTime.toISOString().split('T')[1].slice(0, 8),
          hours: parseFloat(shiftHours.toFixed(1)),
          location: shift.location.name,
          skill: shift.skill?.name || 'No specific skill'
        }
      })

      // Determine overtime status
      let overtimeStatus: 'normal' | 'warning' | 'critical'
      if (totalHours > 40) {
        overtimeStatus = 'critical'
      } else if (totalHours >= 35) {
        overtimeStatus = 'warning'
      } else {
        overtimeStatus = 'normal'
      }

      return {
        staffId: staff.id,
        staffName: `${staff.firstName} ${staff.lastName}`,
        email: staff.email,
        totalHours: parseFloat(totalHours.toFixed(1)),
        overtimeStatus,
        shifts: shifts.sort((a, b) => a.date.localeCompare(b.date))
      }
    })

    // Sort by total hours descending
    staffHoursData.sort((a, b) => b.totalHours - a.totalHours)

    return res.json(staffHoursData)
  } catch (error) {
    console.error('Error fetching staff hours:', error)
    return res.status(500).json({ error: 'Failed to fetch staff hours' })
  }
})

export default router