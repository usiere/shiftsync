import { PrismaClient } from '@prisma/client'
import { ShiftAssignmentData, ExistingAssignment, QualifiedUser, ConstraintContext } from '../types/constraint'
import { ConstraintEngine } from './ConstraintEngine'

const prisma = new PrismaClient()
const constraintEngine = new ConstraintEngine()

export interface ShiftFilters {
  locationId?: number
  startDate?: Date
  endDate?: Date
  status?: 'DRAFT' | 'PUBLISHED'
  userId?: number
  assignedTo?: number
}

export class ShiftService {
  /**
   * Get shifts with filters and includes
   */
  async getShifts(filters: ShiftFilters = {}) {
    const where: any = {}

    if (filters.locationId) {
      where.locationId = filters.locationId
    }

    if (filters.startDate || filters.endDate) {
      where.date = {}
      if (filters.startDate) {
        where.date.gte = filters.startDate
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate
      }
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.assignedTo) {
      where.shiftAssignments = {
        some: {
          userId: filters.assignedTo
        }
      }
    }

    const shifts = await prisma.shift.findMany({
      where,
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
              select: { id: true, firstName: true, lastName: true, email: true, role: true }
            }
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return shifts
  }

  /**
   * Get a single shift by ID with all relationships
   */
  async getShiftById(shiftId: number) {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        location: true,
        skill: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        shiftAssignments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, role: true }
            }
          }
        }
      }
    })

    return shift
  }

  /**
   * Get all qualified users for a shift (users with required skill and location certification)
   */
  async getQualifiedUsers(shiftId: number): Promise<QualifiedUser[]> {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { skill: true, location: true }
    })

    if (!shift) {
      throw new Error('Shift not found')
    }

    const whereCondition: any = {
      isActive: true,
      locationCertifications: {
        some: { locationId: shift.locationId }
      }
    }

    // If shift requires a specific skill, filter users who have that skill
    if (shift.skillId) {
      whereCondition.userSkills = {
        some: { skillId: shift.skillId }
      }
    }

    const users = await prisma.user.findMany({
      where: whereCondition,
      include: {
        userSkills: {
          include: { skill: true }
        },
        locationCertifications: true,
        availability: true
      }
    })

    return users as QualifiedUser[]
  }

  /**
   * Get existing assignments for a user in a date range (for constraint checking)
   */
  async getExistingAssignments(userId: number, startDate: Date, endDate: Date): Promise<ExistingAssignment[]> {
    const assignments = await prisma.shiftAssignment.findMany({
      where: {
        userId,
        shift: {
          date: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      include: {
        shift: {
          include: {
            location: {
              select: { timezone: true }
            }
          }
        }
      }
    })

    return assignments.map(assignment => ({
      id: assignment.id,
      shiftId: assignment.shiftId,
      userId: assignment.userId,
      shift: {
        id: assignment.shift.id,
        date: assignment.shift.date,
        startTime: assignment.shift.startTime,
        endTime: assignment.shift.endTime,
        locationId: assignment.shift.locationId,
        location: {
          timezone: assignment.shift.location.timezone
        }
      }
    }))
  }

  /**
   * Create constraint context for validation
   */
  async createConstraintContext(
    shiftId: number,
    userId: number,
    overrideFlags?: { allowConsecutiveDays?: boolean; allowExcessiveHours?: boolean }
  ): Promise<ConstraintContext> {
    const shift = await this.getShiftById(shiftId)
    if (!shift) {
      throw new Error('Shift not found')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSkills: { include: { skill: true } },
        locationCertifications: true,
        availability: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Get existing assignments for a broader range to check constraints
    const rangeStart = new Date(shift.date)
    rangeStart.setDate(rangeStart.getDate() - 30) // Look back 30 days

    const rangeEnd = new Date(shift.date)
    rangeEnd.setDate(rangeEnd.getDate() + 30) // Look forward 30 days

    const existingAssignments = await this.getExistingAssignments(userId, rangeStart, rangeEnd)
    const qualifiedUsers = await this.getQualifiedUsers(shiftId)

    const proposedAssignment: ShiftAssignmentData = {
      shiftId,
      userId,
      shift: {
        id: shift.id,
        locationId: shift.locationId,
        skillId: shift.skillId,
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        headcountNeeded: shift.headcountNeeded,
        status: shift.status,
        title: shift.title,
        description: shift.description,
        createdById: shift.createdById,
        createdAt: shift.createdAt,
        updatedAt: shift.updatedAt,
        publishedAt: shift.publishedAt,
        location: {
          id: shift.location.id,
          name: shift.location.name,
          timezone: shift.location.timezone
        },
        skill: shift.skill ? {
          id: shift.skill.id,
          name: shift.skill.name
        } : null
      },
      user: user as QualifiedUser
    }

    return {
      proposedAssignment,
      existingAssignments,
      allQualifiedUsers: qualifiedUsers,
      overrideFlags
    }
  }

  /**
   * Validate shift assignment using ConstraintEngine
   */
  async validateAssignment(shiftId: number, userId: number, overrideFlags?: any) {
    const context = await this.createConstraintContext(shiftId, userId, overrideFlags)
    return constraintEngine.validateAssignment(context)
  }

  /**
   * Assign user to shift after validation
   */
  async assignUserToShift(shiftId: number, userId: number, assignedById: number, overrideFlags?: any) {
    // Validate assignment first
    const validation = await this.validateAssignment(shiftId, userId, overrideFlags)

    if (!validation.isValid) {
      return {
        success: false,
        validation,
        assignment: null
      }
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.shiftAssignment.findUnique({
      where: {
        shiftId_userId: {
          shiftId,
          userId
        }
      }
    })

    if (existingAssignment) {
      throw new Error('User is already assigned to this shift')
    }

    // Create the assignment
    const assignment = await prisma.shiftAssignment.create({
      data: {
        shiftId,
        userId,
        assignedById,
        isConfirmed: false
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true }
        },
        shift: {
          include: {
            location: { select: { name: true } },
            skill: { select: { name: true } }
          }
        }
      }
    })

    return {
      success: true,
      validation,
      assignment
    }
  }

  /**
   * Remove user assignment from shift
   */
  async removeAssignment(shiftId: number, userId: number) {
    const assignment = await prisma.shiftAssignment.findUnique({
      where: {
        shiftId_userId: {
          shiftId,
          userId
        }
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        },
        shift: {
          include: {
            location: { select: { name: true, timezone: true } }
          }
        }
      }
    })

    if (!assignment) {
      throw new Error('Assignment not found')
    }

    await prisma.shiftAssignment.delete({
      where: {
        shiftId_userId: {
          shiftId,
          userId
        }
      }
    })

    return assignment
  }

  /**
   * Publish shifts for a week
   */
  async publishWeekSchedule(shiftId: number) {
    const shift = await this.getShiftById(shiftId)
    if (!shift) {
      throw new Error('Shift not found')
    }

    // Get the week range for the shift date
    const shiftDate = new Date(shift.date)
    const startOfWeek = new Date(shiftDate)
    startOfWeek.setDate(startOfWeek.getDate() - shiftDate.getDay() + 1) // Monday
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 6) // Sunday
    endOfWeek.setHours(23, 59, 59, 999)

    // Update all draft shifts in this week to published
    const updatedShifts = await prisma.shift.updateMany({
      where: {
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        },
        status: 'DRAFT'
      },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    })

    return {
      weekStart: startOfWeek,
      weekEnd: endOfWeek,
      publishedShifts: updatedShifts.count
    }
  }

  /**
   * Check if shift can be modified (not published or within cutoff)
   */
  isShiftModifiable(shift: any): { modifiable: boolean; reason?: string } {
    if (shift.status === 'PUBLISHED') {
      return {
        modifiable: false,
        reason: 'Cannot modify published shifts'
      }
    }

    // Check if we're past the cutoff (e.g., 24 hours before shift)
    const cutoffHours = 24
    const cutoffTime = new Date(shift.startTime)
    cutoffTime.setHours(cutoffTime.getHours() - cutoffHours)

    if (new Date() > cutoffTime) {
      return {
        modifiable: false,
        reason: `Cannot modify shifts within ${cutoffHours} hours of start time`
      }
    }

    return { modifiable: true }
  }
}