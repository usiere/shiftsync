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

const router = Router()
const prisma = new PrismaClient()
const shiftService = new ShiftService()

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

    res.status(201).json({
      message: 'Shift created successfully',
      shift
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

    res.json({
      message: 'Shifts retrieved successfully',
      count: shifts.length,
      shifts
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

    res.json({
      message: 'Shift updated successfully',
      shift: updatedShift
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

    const shift = await shiftService.getShiftById(shiftId)

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

export default router