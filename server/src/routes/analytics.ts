import { Router, Request, Response } from 'express'
import { PrismaClient, UserRole } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { requireManagerOrAdmin } from '../middleware/roleGuards'
import { startOfWeek, endOfWeek, parseISO, format, getDay } from 'date-fns'

const router = Router()
const prisma = new PrismaClient()

// Apply authentication and manager/admin role requirement to all routes
router.use(authenticateToken)
router.use(requireManagerOrAdmin)

/**
 * @swagger
 * /api/analytics/hours:
 *   get:
 *     summary: Get hours analytics for charting
 *     description: Returns hours per staff member for the specified week for charting purposes
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weekStart
 *         schema:
 *           type: string
 *           format: date
 *         description: Week start date (YYYY-MM-DD format). Defaults to current week.
 *         example: "2024-01-01"
 *     responses:
 *       200:
 *         description: Hours analytics data
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
 *                   skill:
 *                     type: string
 *                   hours:
 *                     type: number
 *                     format: float
 *               example:
 *                 - staffId: 1
 *                   staffName: "John Doe"
 *                   skill: "Server"
 *                   hours: 32.5
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/hours', async (req: Request, res: Response) => {
  try {
    const weekStartParam = req.query.weekStart as string
    let weekStart: Date
    let weekEnd: Date

    if (weekStartParam) {
      weekStart = parseISO(weekStartParam)
      weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
    } else {
      const now = new Date()
      weekStart = startOfWeek(now, { weekStartsOn: 1 })
      weekEnd = endOfWeek(now, { weekStartsOn: 1 })
    }

    const staffWithHours = await prisma.user.findMany({
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
        },
        userSkills: {
          include: {
            skill: true
          },
          take: 1 // Get primary skill
        }
      }
    })

    const hoursData = staffWithHours.map(staff => {
      const totalHours = staff.shiftAssignments.reduce((sum, assignment) => {
        const shift = assignment.shift
        let startTime = new Date(shift.startTime)
        let endTime = new Date(shift.endTime)

        // Debug logging for problematic shifts
        if (endTime < startTime) {
          console.log(`Found overnight shift - ID: ${shift.id}, Start: ${startTime.toISOString()}, End: ${endTime.toISOString()}`)
          endTime = new Date(endTime.getTime() + (24 * 60 * 60 * 1000))
        }

        // Calculate duration in milliseconds, then convert to hours
        const durationMs = endTime.getTime() - startTime.getTime()
        const hours = durationMs / (1000 * 60 * 60)

        // Debug logging for negative hours
        if (hours < 0) {
          console.log(`Negative hours detected - Shift ID: ${shift.id}, Start: ${startTime.toISOString()}, End: ${endTime.toISOString()}, Hours: ${hours}`)
        }

        // Safeguard: ensure we never add negative hours
        const safeHours = Math.max(0, Math.abs(hours))

        // Additional safeguard: if result is unreasonably large (>24 hours), cap it
        const cappedHours = Math.min(safeHours, 24)

        return sum + cappedHours
      }, 0)

      return {
        staffId: staff.id,
        staffName: `${staff.firstName} ${staff.lastName}`,
        skill: staff.userSkills[0]?.skill.name || 'No Skill',
        hours: parseFloat(totalHours.toFixed(1))
      }
    })

    res.json(hoursData)
  } catch (error) {
    console.error('Error fetching hours analytics:', error)
    res.status(500).json({ error: 'Failed to fetch hours analytics' })
  }
})

/**
 * @swagger
 * /api/analytics/fairness:
 *   get:
 *     summary: Get premium shifts fairness analytics
 *     description: Returns Friday/Saturday evening shift distribution per staff member with fairness scores
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fairness analytics data
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
 *                   skill:
 *                     type: string
 *                   fridayShifts:
 *                     type: integer
 *                   saturdayShifts:
 *                     type: integer
 *                   totalPremiumShifts:
 *                     type: integer
 *                   fairnessScore:
 *                     type: number
 *                     format: float
 *                   lastPremiumShift:
 *                     type: string
 *                     format: date
 *                     nullable: true
 *               example:
 *                 - staffId: 1
 *                   staffName: "John Doe"
 *                   skill: "Server"
 *                   fridayShifts: 2
 *                   saturdayShifts: 1
 *                   totalPremiumShifts: 3
 *                   fairnessScore: 85.5
 *                   lastPremiumShift: "2024-01-20"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/fairness', async (_req: Request, res: Response) => {
  try {
    // Get last 3 months of data for fairness calculation
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

    const staffWithPremiumShifts = await prisma.user.findMany({
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
                gte: threeMonthsAgo
              },
              // Premium shifts: Friday/Saturday after 6 PM
              OR: [
                {
                  AND: [
                    {
                      date: {
                        gte: threeMonthsAgo
                      }
                    },
                    {
                      startTime: {
                        gte: new Date('1970-01-01T18:00:00Z') // 6 PM or later
                      }
                    }
                  ]
                }
              ]
            }
          },
          include: {
            shift: true
          }
        },
        userSkills: {
          include: {
            skill: true
          },
          take: 1
        }
      }
    })

    // Calculate total premium shifts across all staff
    let totalPremiumShiftsOverall = 0

    const fairnessData = staffWithPremiumShifts.map(staff => {
      const premiumShifts = staff.shiftAssignments.filter(assignment => {
        const shift = assignment.shift
        const shiftDay = getDay(shift.date) // 0 = Sunday, 5 = Friday, 6 = Saturday
        const startHour = new Date(shift.startTime).getUTCHours()

        // Check if it's Friday (5) or Saturday (6) and after 6 PM (18:00)
        return (shiftDay === 5 || shiftDay === 6) && startHour >= 18
      })

      const fridayShifts = premiumShifts.filter(assignment =>
        getDay(assignment.shift.date) === 5
      ).length

      const saturdayShifts = premiumShifts.filter(assignment =>
        getDay(assignment.shift.date) === 6
      ).length

      const totalPremiumShifts = premiumShifts.length
      totalPremiumShiftsOverall += totalPremiumShifts

      // Find last premium shift
      const lastPremiumShift = premiumShifts.length > 0
        ? premiumShifts
            .sort((a, b) => b.shift.date.getTime() - a.shift.date.getTime())[0]
            .shift.date
        : null

      return {
        staffId: staff.id,
        staffName: `${staff.firstName} ${staff.lastName}`,
        skill: staff.userSkills[0]?.skill.name || 'No Skill',
        fridayShifts,
        saturdayShifts,
        totalPremiumShifts,
        lastPremiumShift: lastPremiumShift ? format(lastPremiumShift, 'yyyy-MM-dd') : null
      }
    })

    // Calculate fairness scores
    const avgPremiumShiftsPerStaff = totalPremiumShiftsOverall / Math.max(staffWithPremiumShifts.length, 1)

    const fairnessDataWithScores = fairnessData.map(staff => {
      // Fairness score: 100% = has average number of premium shifts
      // >100% = above average, <100% = below average
      const fairnessScore = avgPremiumShiftsPerStaff > 0
        ? Math.min((staff.totalPremiumShifts / avgPremiumShiftsPerStaff) * 100, 100)
        : 100

      return {
        ...staff,
        fairnessScore: parseFloat(fairnessScore.toFixed(1))
      }
    })

    // Sort by fairness score descending
    fairnessDataWithScores.sort((a, b) => b.fairnessScore - a.fairnessScore)

    res.json(fairnessDataWithScores)
  } catch (error) {
    console.error('Error fetching fairness analytics:', error)
    res.status(500).json({ error: 'Failed to fetch fairness analytics' })
  }
})

export default router