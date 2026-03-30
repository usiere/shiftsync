import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { requireManagerOrAdmin } from '../middleware/roleGuards'
import { OvertimeService } from '../services/overtimeService'

const router = Router()
const prisma = new PrismaClient()
const overtimeService = new OvertimeService()

/**
 * @swagger
 * /api/overtime/staff/{id}/hours:
 *   get:
 *     summary: Get staff member's hours and overtime status
 *     description: Returns total hours, daily breakdown, consecutive days worked, and overtime status for a specific week
 *     tags: [Overtime]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff member ID
 *       - in: query
 *         name: week
 *         required: false
 *         schema:
 *           type: string
 *         description: Week in format YYYY-WXX (e.g., 2024-W12). Defaults to current week.
 *     responses:
 *       200:
 *         description: Staff hours retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 staffId:
 *                   type: integer
 *                 staffName:
 *                   type: string
 *                 week:
 *                   type: string
 *                 totalHours:
 *                   type: number
 *                 dailyBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       hours:
 *                         type: number
 *                       shiftCount:
 *                         type: integer
 *                 consecutiveDaysWorked:
 *                   type: integer
 *                 overtimeStatus:
 *                   type: object
 *                   properties:
 *                     warnings:
 *                       type: array
 *                     blocks:
 *                       type: array
 *                 costs:
 *                   type: object
 *                   properties:
 *                     regularHours:
 *                       type: number
 *                     overtimeHours:
 *                       type: number
 *                     regularCost:
 *                       type: number
 *                     overtimeCost:
 *                       type: number
 *                     totalCost:
 *                       type: number
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
router.get('/staff/:id/hours', authenticateToken, requireManagerOrAdmin, async (req: Request, res: Response) => {
  try {
    const staffId = parseInt(req.params.id)
    const weekString = req.query.week as string

    const staffHours = await overtimeService.getStaffHours(staffId, weekString)

    if (!staffHours) {
      return res.status(404).json({
        error: 'Staff member not found',
        message: `Staff member with ID ${staffId} does not exist or is not active`
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: staffId },
      select: { hourlyRate: true }
    })

    const hourlyRate = user?.hourlyRate || 0

    return res.json({
      staffId,
      staffName: staffHours.userName,
      week: weekString || 'current',
      totalHours: staffHours.weeklyTotal,
      dailyBreakdown: staffHours.dailyBreakdown,
      consecutiveDaysWorked: staffHours.consecutiveDaysWorked,
      overtimeStatus: {
        warnings: staffHours.warnings,
        blocks: staffHours.blocks
      },
      costs: {
        regularHours: staffHours.regularHours,
        overtimeHours: staffHours.overtimeHours,
        regularCost: staffHours.regularHours * hourlyRate,
        overtimeCost: staffHours.overtimeCost,
        totalCost: staffHours.totalCost
      }
    })

  } catch (error) {
    console.error('Get staff hours error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve staff hours',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/overtime/locations/{id}/overtime:
 *   get:
 *     summary: Get projected overtime costs for a location
 *     description: Returns projected overtime costs for all staff at a location for the current week, highlighting which specific assignments are causing overtime
 *     tags: [Overtime]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location overtime projection retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 locationId:
 *                   type: integer
 *                 locationName:
 *                   type: string
 *                 weekPeriod:
 *                   type: string
 *                 currentWeekCosts:
 *                   type: object
 *                   properties:
 *                     regular:
 *                       type: number
 *                     overtime:
 *                       type: number
 *                     total:
 *                       type: number
 *                 projectedWeekCosts:
 *                   type: object
 *                   properties:
 *                     regular:
 *                       type: number
 *                     overtime:
 *                       type: number
 *                     total:
 *                       type: number
 *                 staffProjections:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: integer
 *                       userName:
 *                         type: string
 *                       currentWeeklyHours:
 *                         type: number
 *                       projectedWeeklyHours:
 *                         type: number
 *                       currentOvertimeHours:
 *                         type: number
 *                       projectedOvertimeHours:
 *                         type: number
 *                       additionalOvertimeCost:
 *                         type: number
 *                       hourlyRate:
 *                         type: number
 *                       causingShifts:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             shiftId:
 *                               type: integer
 *                             date:
 *                               type: string
 *                             hours:
 *                               type: number
 *                             isOvertimeCausing:
 *                               type: boolean
 *       404:
 *         description: Location not found
 *       500:
 *         description: Internal server error
 */
router.get('/locations/:id/overtime', authenticateToken, requireManagerOrAdmin, async (req: Request, res: Response) => {
  try {
    const locationId = parseInt(req.params.id)

    const projection = await overtimeService.getLocationOvertimeProjection(locationId)

    if (!projection) {
      return res.status(404).json({
        error: 'Location not found',
        message: `Location with ID ${locationId} does not exist or is not active`
      })
    }

    // Format week period for response
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    const weekPeriod = `${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`

    return res.json({
      locationId: projection.locationId,
      locationName: projection.locationName,
      weekPeriod,
      currentWeekCosts: projection.currentWeekCosts,
      projectedWeekCosts: projection.projectedWeekCosts,
      staffProjections: projection.staffProjections
    })

  } catch (error) {
    console.error('Get location overtime projection error:', error)
    return res.status(500).json({
      error: 'Failed to retrieve location overtime projection',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/overtime/shifts/{id}/assign/override:
 *   post:
 *     summary: Manager override for 7th day rule
 *     description: Allows managers to override the 7th consecutive day block with a documented reason
 *     tags: [Overtime]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shift ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - reason
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the staff member to assign
 *               reason:
 *                 type: string
 *                 description: Documented reason for the override
 *                 minLength: 10
 *           example:
 *             userId: 17
 *             reason: "Critical coverage needed due to unexpected staff absence and no other qualified alternatives available"
 *     responses:
 *       201:
 *         description: Override assignment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 assignment:
 *                   type: object
 *                 override:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     reason:
 *                       type: string
 *                     authorizedBy:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *       400:
 *         description: Invalid request or override not applicable
 *       404:
 *         description: Shift or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/shifts/:id/assign/override', authenticateToken, requireManagerOrAdmin, async (req: Request, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id)
    const { userId, reason } = req.body

    if (!userId || !reason || reason.length < 10) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'userId and reason (minimum 10 characters) are required'
      })
    }

    // Verify shift exists
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        location: { select: { name: true } }
      }
    })

    if (!shift) {
      return res.status(404).json({
        error: 'Shift not found',
        message: `Shift with ID ${shiftId} does not exist`
      })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${userId} does not exist or is not active`
      })
    }

    // Check if override is actually needed
    const assignmentCheck = await overtimeService.canAssignToShift(shiftId, userId, false)

    const needsSeventhDayOverride = assignmentCheck.blocks.some(block => block.type === 'CONSECUTIVE_7')

    if (!needsSeventhDayOverride) {
      return res.status(400).json({
        error: 'Override not needed',
        message: 'This assignment does not require a 7th day override'
      })
    }

    // Check if there are other non-overrideable blocks
    const nonOverrideableBlocks = assignmentCheck.blocks.filter(block =>
      block.type !== 'CONSECUTIVE_7'
    )

    if (nonOverrideableBlocks.length > 0) {
      return res.status(400).json({
        error: 'Cannot override',
        message: 'This assignment has other blocking constraints that cannot be overridden',
        blocks: nonOverrideableBlocks
      })
    }

    // Check if shift is full
    const currentAssignments = await prisma.shiftAssignment.count({
      where: { shiftId }
    })

    if (currentAssignments >= shift.headcountNeeded) {
      return res.status(409).json({
        error: 'Shift is full',
        message: `This shift already has ${currentAssignments} assignments (capacity: ${shift.headcountNeeded})`
      })
    }

    // Create the assignment with override
    const assignment = await prisma.shiftAssignment.create({
      data: {
        shiftId,
        userId,
        assignedById: req.user!.id,
        isConfirmed: false
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true }
        },
        shift: {
          include: {
            location: { select: { name: true } }
          }
        }
      }
    })

    // Log the override in audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'ASSIGN',
        entityType: 'ShiftAssignment',
        entityId: assignment.id,
        description: `Manager override for 7th consecutive day assignment: ${reason}`,
        oldValues: {},
        newValues: {
          shiftId,
          userId,
          override: {
            type: 'SEVENTH_DAY',
            reason,
            authorizedBy: req.user!.id
          }
        }
      }
    })

    return res.status(201).json({
      message: 'Override assignment created successfully',
      assignment: {
        id: assignment.id,
        shiftId,
        userId,
        user: {
          name: `${assignment.user.firstName} ${assignment.user.lastName}`,
          email: assignment.user.email
        },
        shift: {
          location: assignment.shift.location.name,
          startTime: assignment.shift.startTime,
          endTime: assignment.shift.endTime
        },
        assignedAt: assignment.assignedAt
      },
      override: {
        type: 'SEVENTH_DAY',
        reason,
        authorizedBy: `${req.user!.firstName} ${req.user!.lastName}`,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Override assignment error:', error)
    return res.status(500).json({
      error: 'Failed to create override assignment',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/overtime/shifts/{id}/assign/preview:
 *   get:
 *     summary: Preview overtime impact before confirming assignment
 *     description: What-if endpoint showing overtime impact before confirming an assignment
 *     tags: [Overtime]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Shift ID
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to preview assignment for
 *     responses:
 *       200:
 *         description: Assignment preview generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shiftId:
 *                   type: integer
 *                 userId:
 *                   type: integer
 *                 userName:
 *                   type: string
 *                 canAssign:
 *                   type: boolean
 *                 currentHours:
 *                   type: object
 *                   properties:
 *                     weeklyTotal:
 *                       type: number
 *                     overtimeHours:
 *                       type: number
 *                     totalCost:
 *                       type: number
 *                 projectedHours:
 *                   type: object
 *                   properties:
 *                     weeklyTotal:
 *                       type: number
 *                     overtimeHours:
 *                       type: number
 *                     totalCost:
 *                       type: number
 *                 overtimeImpact:
 *                   type: object
 *                   properties:
 *                     additionalOvertimeHours:
 *                       type: number
 *                     additionalOvertimeCost:
 *                       type: number
 *                     newTotalCost:
 *                       type: number
 *                 warnings:
 *                   type: array
 *                 blocks:
 *                   type: array
 *                 requiredOverrides:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         description: Shift or user not found
 *       500:
 *         description: Internal server error
 */
router.get('/shifts/:id/assign/preview', authenticateToken, requireManagerOrAdmin, async (req: Request, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id)
    const userId = parseInt(req.query.userId as string)

    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId',
        message: 'userId query parameter is required'
      })
    }

    // Verify shift exists
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        location: { select: { name: true } }
      }
    })

    if (!shift) {
      return res.status(404).json({
        error: 'Shift not found',
        message: `Shift with ID ${shiftId} does not exist`
      })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${userId} does not exist or is not active`
      })
    }

    // Get assignment preview
    const preview = await overtimeService.getShiftAssignmentPreview(shiftId, userId)

    return res.json({
      shiftId,
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      canAssign: preview.canAssign,
      currentHours: {
        weeklyTotal: preview.currentHours.weeklyTotal,
        overtimeHours: preview.currentHours.overtimeHours,
        totalCost: preview.currentHours.totalCost
      },
      projectedHours: {
        weeklyTotal: preview.projectedHours.weeklyTotal,
        overtimeHours: preview.projectedHours.overtimeHours,
        totalCost: preview.projectedHours.totalCost
      },
      overtimeImpact: preview.overtimeImpact,
      warnings: preview.warnings,
      blocks: preview.blocks,
      requiredOverrides: preview.blocks
        .filter(block => block.type === 'CONSECUTIVE_7')
        .map(() => 'SEVENTH_DAY')
    })

  } catch (error) {
    console.error('Get assignment preview error:', error)
    return res.status(500).json({
      error: 'Failed to generate assignment preview',
      message: 'An internal server error occurred'
    })
  }
})

export default router