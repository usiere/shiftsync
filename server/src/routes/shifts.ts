import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticateToken } from '../middleware/auth'
import { requireManagerOrAdmin } from '../middleware/roleGuards'
import {
  validateShiftCreation,
  validateShiftUpdate,
  validateShiftAssignment,
  validateShiftRemoveAssignment,
  validateShiftFilters,
  validateShiftId
} from '../middleware/validation'
import { ShiftService } from '../services/shiftService'
import { SwapRequestService } from '../services/swapRequestService'
import { getSocketService } from '../services/socketService'
import { OvertimeService } from '../services/overtimeService'
import { timezoneService, ShiftTimes } from '../services/timezoneService'
import { notificationService } from '../services/notificationService'

const router = Router()
const prisma = new PrismaClient()
const shiftService = new ShiftService()
const swapRequestService = new SwapRequestService()
const overtimeService = new OvertimeService()

// Helper function to format constraint violation messages
function formatConstraintError(violation: any) {
  return {
    rule: violation.rule,
    message: violation.message,
    severity: violation.severity || 'error',
    suggestions: violation.suggestions.map((user: any) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      skills: user.userSkills.map((us: any) => us.skill.name),
      locations: user.locationCertifications.map((lc: any) => lc.locationId)
    }))
  }
}

// Helper function to add timezone display information to shifts
function addTimezoneDisplay(shift: any) {
  if (!shift.location?.timezone) {
    return shift
  }

  const shiftTimes: ShiftTimes = {
    id: shift.id,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    locationTimezone: shift.location.timezone
  }

  const timezoneDisplay = timezoneService.getShiftDisplay(shiftTimes)

  return {
    ...shift,
    timezone: {
      ...timezoneDisplay,
      utcStartTime: shift.startTime.toISOString(),
      utcEndTime: shift.endTime.toISOString()
    }
  }
}

/**
 * @swagger
 * /api/shifts:
 *   post:
 *     summary: Create a new shift
 *     description: Create a new shift for staff scheduling (Manager/Admin only)
 *     tags: [Shifts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShiftRequest'
 *           example:
 *             locationId: 6
 *             skillId: 5
 *             date: "2026-04-10"
 *             startTime: "2026-04-10T14:00:00Z"
 *             endTime: "2026-04-10T18:00:00Z"
 *             headcountNeeded: 2
 *             title: "Bartender Shift"
 *     responses:
 *       201:
 *         description: Shift created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 shift:
 *                   $ref: '#/components/schemas/Shift'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions (requires Manager or Admin role)
 *       404:
 *         description: Location or skill not found
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, requireManagerOrAdmin, validateShiftCreation, async (req: Request, res: Response) => {
  try {
    const {
      locationId,
      skillId,
      date,
      startTime,
      endTime,
      headcountNeeded = 1,
      title,
      description
    } = req.body

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId }
    })

    if (!location) {
      return res.status(404).json({
        error: 'Location not found',
        message: `Location with ID ${locationId} does not exist`
      })
    }

    // Verify skill exists if provided
    if (skillId) {
      const skill = await prisma.skill.findUnique({
        where: { id: skillId }
      })

      if (!skill) {
        return res.status(404).json({
          error: 'Skill not found',
          message: `Skill with ID ${skillId} does not exist`
        })
      }
    }

    const shift = await prisma.shift.create({
      data: {
        locationId,
        skillId: skillId || null,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        headcountNeeded,
        title: title || null,
        description: description || null,
        createdById: req.user!.id,
        status: 'DRAFT'
      },
      include: {
        location: {
          select: { id: true, name: true, timezone: true, address: true, city: true, state: true }
        },
        skill: {
          select: { id: true, name: true, description: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    })

    // Add timezone display information
    const shiftWithTimezone = addTimezoneDisplay(shift)

    res.status(201).json({
      message: 'Shift created successfully',
      shift: shiftWithTimezone
    })

  } catch (error) {
    console.error('Create shift error:', error)
    res.status(500).json({
      error: 'Failed to create shift',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * GET /shifts - List shifts with filtering
 */
router.get('/', authenticateToken, requireManagerOrAdmin, validateShiftFilters, async (req: Request, res: Response) => {
  try {
    const filters: any = {}

    if (req.query.locationId) {
      filters.locationId = parseInt(req.query.locationId as string)
    }

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string)
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string)
    }

    if (req.query.status) {
      filters.status = req.query.status as string
    }

    const shifts = await shiftService.getShifts(filters)

    // Add timezone display information to all shifts
    const shiftsWithTimezone = shifts.map(shift => addTimezoneDisplay(shift))

    res.json({
      message: 'Shifts retrieved successfully',
      count: shifts.length,
      shifts: shiftsWithTimezone
    })

  } catch (error) {
    console.error('Get shifts error:', error)
    res.status(500).json({
      error: 'Failed to retrieve shifts',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * PATCH /shifts/:id - Update shift details (before cutoff only)
 */
router.patch('/:id', authenticateToken, requireManagerOrAdmin, validateShiftUpdate, async (req: Request, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id)
    const updates = req.body

    const shift = await shiftService.getShiftById(shiftId)

    if (!shift) {
      return res.status(404).json({
        error: 'Shift not found',
        message: `Shift with ID ${shiftId} does not exist`
      })
    }

    // Check if shift can be modified
    const modifiabilityCheck = shiftService.isShiftModifiable(shift)
    if (!modifiabilityCheck.modifiable) {
      return res.status(409).json({
        error: 'Shift cannot be modified',
        message: modifiabilityCheck.reason
      })
    }

    // Verify skill exists if being updated
    if (updates.skillId) {
      const skill = await prisma.skill.findUnique({
        where: { id: updates.skillId }
      })

      if (!skill) {
        return res.status(404).json({
          error: 'Skill not found',
          message: `Skill with ID ${updates.skillId} does not exist`
        })
      }
    }

    const updatedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        ...updates,
        startTime: updates.startTime ? new Date(updates.startTime) : undefined,
        endTime: updates.endTime ? new Date(updates.endTime) : undefined,
        updatedAt: new Date()
      },
      include: {
        location: {
          select: { id: true, name: true, timezone: true, address: true, city: true, state: true }
        },
        skill: {
          select: { id: true, name: true, description: true }
        },
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        shiftAssignments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    })

    // Cancel any pending swap requests for this shift since it was modified
    await swapRequestService.cancelSwapsForEditedShift(shiftId, req.user!.id)

    // Emit real-time event for schedule update
    try {
      const socketService = getSocketService()
      const changes = Object.keys(updates).map(field => ({
        field,
        oldValue: (shift as any)[field],
        newValue: updates[field]
      }))

      socketService.emitScheduleUpdated({
        shiftId,
        locationId: updatedShift.location.id,
        locationName: updatedShift.location.name,
        changes,
        updatedBy: {
          id: req.user!.id,
          name: `${req.user!.firstName} ${req.user!.lastName}`
        }
      })
    } catch (socketError) {
      console.error('Failed to emit schedule updated event:', socketError)
    }

    // Add timezone display information
    const shiftWithTimezone = addTimezoneDisplay(updatedShift)

    res.json({
      message: 'Shift updated successfully',
      shift: shiftWithTimezone
    })

  } catch (error) {
    console.error('Update shift error:', error)
    res.status(500).json({
      error: 'Failed to update shift',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * POST /shifts/:id/publish - Publish a week's schedule
 */
router.post('/:id/publish', authenticateToken, requireManagerOrAdmin, validateShiftId, async (req: Request, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id)

    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        location: { select: { id: true, name: true } }
      }
    })

    if (!shift) {
      return res.status(404).json({
        error: 'Shift not found',
        message: `Shift with ID ${shiftId} does not exist`
      })
    }

    if (shift.status === 'PUBLISHED') {
      return res.status(409).json({
        error: 'Schedule already published',
        message: 'This week\'s schedule has already been published'
      })
    }

    const result = await shiftService.publishWeekSchedule(shiftId)

    // Emit real-time event for schedule publication
    try {
      const socketService = getSocketService()
      socketService.emitSchedulePublished({
        locationId: shift.location.id,
        locationName: shift.location.name,
        weekStart: result.weekStart.toISOString().split('T')[0],
        weekEnd: result.weekEnd.toISOString().split('T')[0],
        publishedShifts: result.publishedShifts,
        publishedBy: {
          id: req.user!.id,
          name: `${req.user!.firstName} ${req.user!.lastName}`
        }
      })
    } catch (socketError) {
      console.error('Failed to emit schedule published event:', socketError)
    }

    // Create notifications for all affected users
    try {
      const affectedUsers = await prisma.user.findMany({
        where: {
          locationCertifications: {
            some: {
              locationId: shift.location.id
            }
          },
          isActive: true
        },
        select: { id: true }
      })

      const userIds = affectedUsers.map(user => user.id)

      await notificationService.notifySchedulePublished(userIds, {
        weekStart: result.weekStart.toLocaleDateString(),
        weekEnd: result.weekEnd.toLocaleDateString(),
        location: shift.location.name
      })
    } catch (notificationError) {
      console.error('Failed to create schedule published notifications:', notificationError)
    }

    res.json({
      message: 'Schedule published successfully',
      weekStart: result.weekStart,
      weekEnd: result.weekEnd,
      publishedShifts: result.publishedShifts
    })

  } catch (error) {
    console.error('Publish schedule error:', error)
    res.status(500).json({
      error: 'Failed to publish schedule',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * @swagger
 * /api/shifts/{id}/assign:
 *   post:
 *     summary: Assign staff member to shift
 *     description: Assign a staff member to a shift with constraint validation (Manager/Admin only)
 *     tags: [Shifts]
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
 *             $ref: '#/components/schemas/AssignStaffRequest'
 *           example:
 *             userId: 17
 *     responses:
 *       201:
 *         description: Staff assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 assignment:
 *                   type: object
 *                 warnings:
 *                   type: object
 *       409:
 *         description: Constraint violation - assignment blocked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 violations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConstraintViolation'
 *                 suggestions:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     alternatives:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Shift or user not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/assign', authenticateToken, requireManagerOrAdmin, validateShiftAssignment, async (req: Request, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id)
    const { userId, overrideFlags } = req.body

    // Verify shift exists
    const shift = await shiftService.getShiftById(shiftId)
    if (!shift) {
      return res.status(404).json({
        error: 'Shift not found',
        message: `Shift with ID ${shiftId} does not exist`
      })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true, isActive: true }
    })

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: `User with ID ${userId} does not exist`
      })
    }

    if (!user.isActive) {
      return res.status(400).json({
        error: 'User not active',
        message: `User ${user.firstName} ${user.lastName} is not active`
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

    // Check for existing assignment (conflict detection)
    const existingAssignment = await prisma.shiftAssignment.findFirst({
      where: { shiftId, userId },
      include: {
        shift: { include: { location: true } },
        user: true
      }
    })

    if (existingAssignment) {
      // Emit conflict detection event
      try {
        const socketService = getSocketService()
        socketService.emitConflictDetected({
          conflictType: 'DOUBLE_ASSIGNMENT',
          shiftId,
          userId,
          userName: `${user.firstName} ${user.lastName}`,
          shiftDetails: {
            date: existingAssignment.shift.date.toISOString().split('T')[0],
            startTime: existingAssignment.shift.startTime.toISOString(),
            endTime: existingAssignment.shift.endTime.toISOString(),
            location: existingAssignment.shift.location.name
          },
          firstManager: {
            id: existingAssignment.assignedById || 0,
            name: 'Previous Manager'
          },
          secondManager: {
            id: req.user!.id,
            name: `${req.user!.firstName} ${req.user!.lastName}`
          },
          timestamp: new Date().toISOString(),
          locationId: existingAssignment.shift.location.id
        })
      } catch (socketError) {
        console.error('Failed to emit conflict detected event:', socketError)
      }

      return res.status(409).json({
        error: 'Assignment already exists',
        message: 'User is already assigned to this shift'
      })
    }

    // Check for overtime warning before assignment
    try {
      const overtimeCheck = await overtimeService.canAssignToShift(shiftId, userId)
      if (overtimeCheck.warnings.length > 0) {
        const socketService = getSocketService()
        const shiftPreview = await overtimeService.getShiftAssignmentPreview(shiftId, userId)

        socketService.emitOvertimeWarning({
          userId,
          userName: `${user.firstName} ${user.lastName}`,
          shiftId,
          shiftDetails: {
            date: shift.date.toISOString().split('T')[0],
            startTime: shift.startTime.toISOString(),
            endTime: shift.endTime.toISOString(),
            location: shift.location?.name || 'Unknown'
          },
          overtimeImpact: shiftPreview.overtimeImpact,
          warnings: overtimeCheck.warnings,
          locationId: shift.locationId
        })
      }
    } catch (overtimeError) {
      console.error('Failed to check overtime or emit warning:', overtimeError)
    }

    // Attempt assignment with constraint validation
    const result = await shiftService.assignUserToShift(
      shiftId,
      userId,
      req.user!.id,
      overrideFlags
    )

    if (!result.success) {
      // Assignment failed due to constraint violations
      const formattedViolations = result.validation.violations.map(formatConstraintError)
      const formattedWarnings = result.validation.warnings.map(formatConstraintError)

      return res.status(409).json({
        error: 'Assignment violates scheduling constraints',
        message: 'Cannot assign this user to the shift due to the following constraints',
        violations: formattedViolations,
        warnings: formattedWarnings,
        suggestions: {
          message: 'Consider assigning one of these alternative staff members',
          alternatives: result.validation.violations[0]?.suggestions.map((user: any) => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            skills: user.userSkills.map((us: any) => us.skill.name),
            certifiedLocations: user.locationCertifications.map((lc: any) => lc.locationId)
          })) || []
        }
      })
    }

    // Assignment successful
    const warnings = result.validation.warnings.map(formatConstraintError)

    // Create notification for assigned user
    try {
      const shiftDisplay = timezoneService.getShiftDisplay({
        id: shift.id,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        locationTimezone: shift.location?.timezone || 'UTC'
      })

      await notificationService.notifyShiftAssigned(userId, {
        date: shiftDisplay.localDate,
        time: `${shiftDisplay.localStartTime} - ${shiftDisplay.localEndTime}`,
        location: shift.location?.name || 'Unknown'
      })
    } catch (notificationError) {
      console.error('Failed to create shift assignment notification:', notificationError)
    }

    res.status(201).json({
      message: 'User assigned to shift successfully',
      assignment: {
        id: result.assignment?.id,
        shiftId,
        userId,
        user: {
          name: `${result.assignment?.user.firstName} ${result.assignment?.user.lastName}`,
          email: result.assignment?.user.email
        },
        shift: {
          title: result.assignment?.shift.title,
          location: result.assignment?.shift.location.name,
          skill: result.assignment?.shift.skill?.name || 'No specific skill required',
          startTime: shift.startTime,
          endTime: shift.endTime
        },
        assignedAt: result.assignment?.assignedAt,
        isConfirmed: result.assignment?.isConfirmed
      },
      warnings: warnings.length > 0 ? {
        message: 'Assignment successful but with warnings',
        items: warnings
      } : undefined
    })

  } catch (error: any) {
    console.error('Assign user error:', error)

    if (error.message === 'User is already assigned to this shift') {
      return res.status(409).json({
        error: 'Assignment already exists',
        message: error.message
      })
    }

    res.status(500).json({
      error: 'Failed to assign user to shift',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * DELETE /shifts/:id/assign/:userId - Remove assignment
 */
router.delete('/:id/assign/:userId', authenticateToken, requireManagerOrAdmin, validateShiftRemoveAssignment, async (req: Request, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id)
    const userId = parseInt(req.params.userId)

    const removedAssignment = await shiftService.removeAssignment(shiftId, userId)

    // Create notification for cancelled shift
    try {
      const shiftDisplay = timezoneService.getShiftDisplay({
        id: removedAssignment.shift.id,
        date: removedAssignment.shift.date,
        startTime: removedAssignment.shift.startTime,
        endTime: removedAssignment.shift.endTime,
        locationTimezone: removedAssignment.shift.location.timezone || 'UTC'
      })

      await notificationService.notifyShiftCancelled(userId, {
        date: shiftDisplay.localDate,
        time: `${shiftDisplay.localStartTime} - ${shiftDisplay.localEndTime}`,
        location: removedAssignment.shift.location.name
      })
    } catch (notificationError) {
      console.error('Failed to create shift cancellation notification:', notificationError)
    }

    res.json({
      message: 'Assignment removed successfully',
      removedAssignment: {
        user: `${removedAssignment.user.firstName} ${removedAssignment.user.lastName}`,
        shift: removedAssignment.shift.location.name,
        removedAt: new Date()
      }
    })

  } catch (error: any) {
    console.error('Remove assignment error:', error)

    if (error.message === 'Assignment not found') {
      return res.status(404).json({
        error: 'Assignment not found',
        message: `No assignment found for user ${req.params.userId} on shift ${req.params.id}`
      })
    }

    res.status(500).json({
      error: 'Failed to remove assignment',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * POST /shifts/:id/swap - Request a swap with another staff member
 */
router.post('/:id/swap', authenticateToken, async (req: Request, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id)
    const { toAssignmentId, reason } = req.body

    if (!toAssignmentId) {
      return res.status(400).json({
        error: 'Target assignment required',
        message: 'toAssignmentId is required for swap requests'
      })
    }

    // Get user's assignment for this shift
    const fromAssignment = await prisma.shiftAssignment.findFirst({
      where: {
        shiftId,
        userId: req.user!.id
      }
    })

    if (!fromAssignment) {
      return res.status(404).json({
        error: 'Assignment not found',
        message: 'You are not assigned to this shift'
      })
    }

    // Verify target assignment exists and is different from user's assignment
    const toAssignment = await prisma.shiftAssignment.findUnique({
      where: { id: toAssignmentId },
      include: {
        user: { select: { firstName: true, lastName: true } },
        shift: { select: { id: true, date: true, startTime: true, endTime: true } }
      }
    })

    if (!toAssignment) {
      return res.status(404).json({
        error: 'Target assignment not found',
        message: `Assignment with ID ${toAssignmentId} does not exist`
      })
    }

    if (toAssignment.userId === req.user!.id) {
      return res.status(400).json({
        error: 'Invalid swap target',
        message: 'Cannot swap with yourself'
      })
    }

    const swapRequest = await swapRequestService.createSwapRequest(
      fromAssignment.id,
      toAssignmentId,
      reason
    )

    // Emit real-time event for swap request
    try {
      const socketService = getSocketService()
      socketService.emitSwapRequested({
        swapRequestId: swapRequest.id,
        fromUser: {
          id: req.user!.id,
          name: `${req.user!.firstName} ${req.user!.lastName}`
        },
        toUser: {
          id: swapRequest.toUserId!,
          name: `${toAssignment.user.firstName} ${toAssignment.user.lastName}`
        },
        fromShift: {
          id: swapRequest.fromAssignment.shift.id,
          date: swapRequest.fromAssignment.shift.date.toISOString().split('T')[0],
          startTime: swapRequest.fromAssignment.shift.startTime.toISOString(),
          endTime: swapRequest.fromAssignment.shift.endTime.toISOString(),
          location: swapRequest.fromAssignment.shift.location.name
        },
        toShift: {
          id: swapRequest.toAssignment!.shift.id,
          date: swapRequest.toAssignment!.shift.date.toISOString().split('T')[0],
          startTime: swapRequest.toAssignment!.shift.startTime.toISOString(),
          endTime: swapRequest.toAssignment!.shift.endTime.toISOString(),
          location: swapRequest.toAssignment!.shift.location.name
        },
        type: 'SWAP',
        reason
      })
    } catch (socketError) {
      console.error('Failed to emit swap requested event:', socketError)
    }

    res.status(201).json({
      message: 'Swap request created successfully',
      swapRequest: {
        id: swapRequest.id,
        type: swapRequest.type,
        status: swapRequest.status,
        from: {
          userId: swapRequest.fromUserId,
          shift: {
            id: swapRequest.fromAssignment.shift.id,
            location: swapRequest.fromAssignment.shift.location.name,
            skill: swapRequest.fromAssignment.shift.skill?.name,
            date: swapRequest.fromAssignment.shift.date,
            startTime: swapRequest.fromAssignment.shift.startTime,
            endTime: swapRequest.fromAssignment.shift.endTime
          }
        },
        to: {
          userId: swapRequest.toUserId,
          user: `${swapRequest.toUser?.firstName} ${swapRequest.toUser?.lastName}`,
          shift: {
            id: swapRequest.toAssignment?.shift.id,
            location: swapRequest.toAssignment?.shift.location.name,
            skill: swapRequest.toAssignment?.shift.skill?.name,
            date: swapRequest.toAssignment?.shift.date,
            startTime: swapRequest.toAssignment?.shift.startTime,
            endTime: swapRequest.toAssignment?.shift.endTime
          }
        },
        reason: swapRequest.reason,
        createdAt: swapRequest.createdAt
      }
    })

  } catch (error: any) {
    console.error('Create swap request error:', error)

    if (error.message.includes('limit of 3 pending requests')) {
      return res.status(409).json({
        error: 'Request limit exceeded',
        message: error.message
      })
    }

    if (error.message.includes('not qualified')) {
      return res.status(409).json({
        error: 'Qualification requirements not met',
        message: error.message
      })
    }

    res.status(500).json({
      error: 'Failed to create swap request',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * POST /shifts/:id/drop - Request to drop a shift
 */
router.post('/:id/drop', authenticateToken, async (req: Request, res: Response) => {
  try {
    const shiftId = parseInt(req.params.id)
    const { reason } = req.body

    // Get user's assignment for this shift
    const assignment = await prisma.shiftAssignment.findFirst({
      where: {
        shiftId,
        userId: req.user!.id
      }
    })

    if (!assignment) {
      return res.status(404).json({
        error: 'Assignment not found',
        message: 'You are not assigned to this shift'
      })
    }

    const dropRequest = await swapRequestService.createDropRequest(
      assignment.id,
      reason
    )

    res.status(201).json({
      message: 'Drop request created successfully',
      dropRequest: {
        id: dropRequest.id,
        type: dropRequest.type,
        status: dropRequest.status,
        shift: {
          id: dropRequest.fromAssignment.shift.id,
          location: dropRequest.fromAssignment.shift.location.name,
          skill: dropRequest.fromAssignment.shift.skill?.name,
          date: dropRequest.fromAssignment.shift.date,
          startTime: dropRequest.fromAssignment.shift.startTime,
          endTime: dropRequest.fromAssignment.shift.endTime
        },
        reason: dropRequest.reason,
        expiresAt: dropRequest.expiresAt,
        createdAt: dropRequest.createdAt
      }
    })

  } catch (error: any) {
    console.error('Create drop request error:', error)

    if (error.message.includes('limit of 3 pending requests')) {
      return res.status(409).json({
        error: 'Request limit exceeded',
        message: error.message
      })
    }

    if (error.message.includes('shift starts within 24 hours')) {
      return res.status(409).json({
        error: 'Drop request too late',
        message: error.message
      })
    }

    res.status(500).json({
      error: 'Failed to create drop request',
      message: 'An internal server error occurred'
    })
  }
})

/**
 * GET /shifts/available - Get shifts available for pickup
 */
router.get('/available', authenticateToken, async (req: Request, res: Response) => {
  try {
    const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined

    const availableShifts = await swapRequestService.getAvailableShifts(req.user!.id, locationId)

    const formattedShifts = availableShifts.map(dropRequest => ({
      dropRequestId: dropRequest.id,
      shift: {
        id: dropRequest.fromAssignment.shift.id,
        location: {
          id: dropRequest.fromAssignment.shift.location.id,
          name: dropRequest.fromAssignment.shift.location.name
        },
        skill: dropRequest.fromAssignment.shift.skill ? {
          id: dropRequest.fromAssignment.shift.skill.id,
          name: dropRequest.fromAssignment.shift.skill.name
        } : null,
        date: dropRequest.fromAssignment.shift.date,
        startTime: dropRequest.fromAssignment.shift.startTime,
        endTime: dropRequest.fromAssignment.shift.endTime
      },
      originalStaff: {
        id: dropRequest.fromAssignment.user.id,
        name: `${dropRequest.fromAssignment.user.firstName} ${dropRequest.fromAssignment.user.lastName}`
      },
      canPickup: dropRequest.canPickup,
      disqualificationReason: dropRequest.canPickup ? undefined : (dropRequest as any).disqualificationReason,
      expiresAt: dropRequest.expiresAt,
      createdAt: dropRequest.createdAt
    }))

    res.json({
      message: 'Available shifts retrieved successfully',
      count: formattedShifts.length,
      availableShifts: formattedShifts
    })

  } catch (error) {
    console.error('Get available shifts error:', error)
    res.status(500).json({
      error: 'Failed to retrieve available shifts',
      message: 'An internal server error occurred'
    })
  }
})

export default router