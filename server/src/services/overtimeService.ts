import { PrismaClient } from '@prisma/client'
import { timezoneService } from './timezoneService'

export interface OvertimeWarning {
  type: 'WEEKLY_35' | 'DAILY_8' | 'CONSECUTIVE_6'
  message: string
  currentValue: number
  threshold: number
}

export interface OvertimeBlock {
  type: 'WEEKLY_40' | 'DAILY_12' | 'CONSECUTIVE_7'
  message: string
  currentValue: number
  threshold: number
}

export interface HoursBreakdown {
  date: string
  hours: number
  shiftCount: number
}

export interface StaffHours {
  userId: number
  userName: string
  weeklyTotal: number
  dailyBreakdown: HoursBreakdown[]
  consecutiveDaysWorked: number
  warnings: OvertimeWarning[]
  blocks: OvertimeBlock[]
  overtimeHours: number
  regularHours: number
  overtimeCost: number
  totalCost: number
}

export interface OvertimeCostProjection {
  userId: number
  userName: string
  currentWeeklyHours: number
  projectedWeeklyHours: number
  currentOvertimeHours: number
  projectedOvertimeHours: number
  additionalOvertimeCost: number
  hourlyRate: number
  causingShifts: Array<{
    shiftId: number
    date: string
    hours: number
    isOvertimeCausing: boolean
  }>
}

export interface LocationOvertimeProjection {
  locationId: number
  locationName: string
  currentWeekCosts: {
    regular: number
    overtime: number
    total: number
  }
  projectedWeekCosts: {
    regular: number
    overtime: number
    total: number
  }
  staffProjections: OvertimeCostProjection[]
}

export class OvertimeService {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  private getWeekStart(date: Date): Date {
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  private getWeekEnd(weekStart: Date): Date {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    return weekEnd
  }

  private calculateShiftHours(startTime: Date, endTime: Date, locationTimezone?: string): number {
    const diffMs = endTime.getTime() - startTime.getTime()
    const hours = diffMs / (1000 * 60 * 60)

    // Handle overnight shifts if timezone is provided
    if (locationTimezone) {
      const resolvedShift = timezoneService.resolveOvernightShift(startTime, endTime, locationTimezone)
      return resolvedShift.duration
    }

    return hours
  }

  private parseWeekString(weekString: string): Date {
    // Parse format like "2024-W12" to get week start date
    const [year, weekNum] = weekString.split('-W')
    const yearNum = parseInt(year)
    const week = parseInt(weekNum)

    // Get first day of year
    const firstDay = new Date(yearNum, 0, 1)
    const firstDayOfWeek = firstDay.getDay()

    // Calculate days to add to get to target week
    const daysToAdd = (week - 1) * 7 - firstDayOfWeek

    const weekStart = new Date(firstDay)
    weekStart.setDate(firstDay.getDate() + daysToAdd)
    weekStart.setHours(0, 0, 0, 0)

    return weekStart
  }

  async getStaffHours(userId: number, weekString?: string): Promise<StaffHours | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isActive: true,
        hourlyRate: true
      }
    })

    if (!user || !user.isActive) {
      return null
    }

    const weekStart = weekString ? this.parseWeekString(weekString) : this.getWeekStart(new Date())
    const weekEnd = this.getWeekEnd(weekStart)

    // Get all shift assignments for the week
    const assignments = await this.prisma.shiftAssignment.findMany({
      where: {
        userId,
        shift: {
          startTime: {
            gte: weekStart,
            lte: weekEnd
          }
        }
      },
      include: {
        shift: {
          select: {
            date: true,
            startTime: true,
            endTime: true,
            location: {
              select: { timezone: true }
            }
          }
        }
      },
      orderBy: {
        shift: {
          startTime: 'asc'
        }
      }
    })

    // Calculate daily breakdown
    const dailyMap = new Map<string, HoursBreakdown>()
    let weeklyTotal = 0

    assignments.forEach(assignment => {
      const locationTimezone = assignment.shift.location.timezone

      // Use location timezone to determine the correct date
      const localDate = timezoneService.toLocationTime(assignment.shift.startTime, locationTimezone)
      const dateKey = localDate.toFormat('yyyy-MM-dd')

      const hours = this.calculateShiftHours(
        assignment.shift.startTime,
        assignment.shift.endTime,
        locationTimezone
      )

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          hours: 0,
          shiftCount: 0
        })
      }

      const daily = dailyMap.get(dateKey)!
      daily.hours += hours
      daily.shiftCount += 1
      weeklyTotal += hours
    })

    const dailyBreakdown = Array.from(dailyMap.values())

    // Calculate consecutive days worked
    const consecutiveDaysWorked = this.calculateConsecutiveDaysWorked(dailyBreakdown, weekStart)

    // Check for warnings and blocks
    const warnings: OvertimeWarning[] = []
    const blocks: OvertimeBlock[] = []

    // Weekly hour checks
    if (weeklyTotal >= 40) {
      blocks.push({
        type: 'WEEKLY_40',
        message: 'Weekly hour limit reached (40+ hours)',
        currentValue: weeklyTotal,
        threshold: 40
      })
    } else if (weeklyTotal >= 35) {
      warnings.push({
        type: 'WEEKLY_35',
        message: 'Approaching weekly hour limit (35+ hours)',
        currentValue: weeklyTotal,
        threshold: 35
      })
    }

    // Daily hour checks
    dailyBreakdown.forEach(day => {
      if (day.hours >= 12) {
        blocks.push({
          type: 'DAILY_12',
          message: `Daily hour limit exceeded on ${day.date} (${day.hours} hours)`,
          currentValue: day.hours,
          threshold: 12
        })
      } else if (day.hours >= 8) {
        warnings.push({
          type: 'DAILY_8',
          message: `Approaching daily hour limit on ${day.date} (${day.hours} hours)`,
          currentValue: day.hours,
          threshold: 8
        })
      }
    })

    // Consecutive day checks
    if (consecutiveDaysWorked >= 7) {
      blocks.push({
        type: 'CONSECUTIVE_7',
        message: `7th consecutive day worked (requires manager override)`,
        currentValue: consecutiveDaysWorked,
        threshold: 7
      })
    } else if (consecutiveDaysWorked >= 6) {
      warnings.push({
        type: 'CONSECUTIVE_6',
        message: `6th consecutive day worked`,
        currentValue: consecutiveDaysWorked,
        threshold: 6
      })
    }

    // Calculate overtime costs
    const regularHours = Math.min(weeklyTotal, 40)
    const overtimeHours = Math.max(0, weeklyTotal - 40)
    const hourlyRate = user.hourlyRate || 0
    const overtimeCost = overtimeHours * hourlyRate * 1.5
    const totalCost = (regularHours * hourlyRate) + overtimeCost

    return {
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      weeklyTotal,
      dailyBreakdown,
      consecutiveDaysWorked,
      warnings,
      blocks,
      overtimeHours,
      regularHours,
      overtimeCost,
      totalCost
    }
  }

  private calculateConsecutiveDaysWorked(
    dailyBreakdown: HoursBreakdown[],
    weekStart: Date
  ): number {
    // We need to look at days leading up to this week as well to count consecutive days
    // For now, we'll count within the week and add logic to look back if needed
    const sortedDays = dailyBreakdown
      .filter(day => day.hours > 0)
      .sort((a, b) => a.date.localeCompare(b.date))

    if (sortedDays.length === 0) return 0

    let consecutive = 1
    let maxConsecutive = 1

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(sortedDays[i - 1].date)
      const currDate = new Date(sortedDays[i].date)
      const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)

      if (dayDiff === 1) {
        consecutive++
        maxConsecutive = Math.max(maxConsecutive, consecutive)
      } else {
        consecutive = 1
      }
    }

    return maxConsecutive
  }

  async getLocationOvertimeProjection(locationId: number): Promise<LocationOvertimeProjection | null> {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true, name: true, isActive: true }
    })

    if (!location || !location.isActive) {
      return null
    }

    const currentWeek = this.getWeekStart(new Date())
    const weekEnd = this.getWeekEnd(currentWeek)

    // Get all assignments for this location's shifts in the current week
    const assignments = await this.prisma.shiftAssignment.findMany({
      where: {
        shift: {
          locationId,
          startTime: {
            gte: currentWeek,
            lte: weekEnd
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            hourlyRate: true
          }
        },
        shift: {
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true
          }
        }
      }
    })

    // Group by user
    const userMap = new Map<number, {
      user: any,
      assignments: any[]
    }>()

    assignments.forEach(assignment => {
      if (!userMap.has(assignment.userId)) {
        userMap.set(assignment.userId, {
          user: assignment.user,
          assignments: []
        })
      }
      userMap.get(assignment.userId)!.assignments.push(assignment)
    })

    const staffProjections: OvertimeCostProjection[] = []
    let currentRegularCost = 0
    let currentOvertimeCost = 0
    let projectedRegularCost = 0
    let projectedOvertimeCost = 0

    for (const [userId, data] of userMap) {
      const staffHours = await this.getStaffHours(userId)
      if (!staffHours) continue

      const hourlyRate = data.user.hourlyRate || 0
      const locationShifts = data.assignments.map(a => ({
        shiftId: a.shift.id,
        date: a.shift.date.toISOString().split('T')[0],
        hours: this.calculateShiftHours(a.shift.startTime, a.shift.endTime),
        isOvertimeCausing: staffHours.weeklyTotal > 40
      }))

      const currentWeeklyHours = staffHours.weeklyTotal
      const currentOvertimeHours = staffHours.overtimeHours
      const regularHours = Math.min(currentWeeklyHours, 40)
      const overtimeHours = Math.max(0, currentWeeklyHours - 40)

      currentRegularCost += regularHours * hourlyRate
      currentOvertimeCost += overtimeHours * hourlyRate * 1.5

      // For projection, assume current state is the projection (no new assignments)
      projectedRegularCost += regularHours * hourlyRate
      projectedOvertimeCost += overtimeHours * hourlyRate * 1.5

      staffProjections.push({
        userId,
        userName: `${data.user.firstName} ${data.user.lastName}`,
        currentWeeklyHours,
        projectedWeeklyHours: currentWeeklyHours,
        currentOvertimeHours,
        projectedOvertimeHours: currentOvertimeHours,
        additionalOvertimeCost: 0,
        hourlyRate,
        causingShifts: locationShifts
      })
    }

    return {
      locationId,
      locationName: location.name,
      currentWeekCosts: {
        regular: currentRegularCost,
        overtime: currentOvertimeCost,
        total: currentRegularCost + currentOvertimeCost
      },
      projectedWeekCosts: {
        regular: projectedRegularCost,
        overtime: projectedOvertimeCost,
        total: projectedRegularCost + projectedOvertimeCost
      },
      staffProjections
    }
  }

  async canAssignToShift(
    shiftId: number,
    userId: number,
    overrideSeventhDay: boolean = false
  ): Promise<{
    canAssign: boolean
    warnings: OvertimeWarning[]
    blocks: OvertimeBlock[]
    requiredOverrides: string[]
  }> {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true
      }
    })

    if (!shift) {
      throw new Error('Shift not found')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true }
    })

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive')
    }

    const shiftHours = this.calculateShiftHours(shift.startTime, shift.endTime)
    const shiftDate = shift.date.toISOString().split('T')[0]

    // Get current week hours
    const weekStart = this.getWeekStart(shift.date)
    const staffHours = await this.getStaffHours(userId, this.formatWeekString(weekStart))

    if (!staffHours) {
      throw new Error('Could not calculate staff hours')
    }

    const warnings: OvertimeWarning[] = []
    const blocks: OvertimeBlock[] = []
    const requiredOverrides: string[] = []

    // Check daily hours for the shift date
    const existingDailyHours = staffHours.dailyBreakdown
      .find(day => day.date === shiftDate)?.hours || 0
    const newDailyHours = existingDailyHours + shiftHours

    if (newDailyHours >= 12) {
      blocks.push({
        type: 'DAILY_12',
        message: `Would exceed daily 12-hour limit (${newDailyHours.toFixed(1)} hours)`,
        currentValue: newDailyHours,
        threshold: 12
      })
    } else if (newDailyHours >= 8) {
      warnings.push({
        type: 'DAILY_8',
        message: `Would approach daily 8-hour warning (${newDailyHours.toFixed(1)} hours)`,
        currentValue: newDailyHours,
        threshold: 8
      })
    }

    // Check weekly hours
    const newWeeklyHours = staffHours.weeklyTotal + shiftHours

    if (newWeeklyHours >= 40) {
      blocks.push({
        type: 'WEEKLY_40',
        message: `Would exceed weekly 40-hour limit (${newWeeklyHours.toFixed(1)} hours)`,
        currentValue: newWeeklyHours,
        threshold: 40
      })
    } else if (newWeeklyHours >= 35) {
      warnings.push({
        type: 'WEEKLY_35',
        message: `Would approach weekly 35-hour warning (${newWeeklyHours.toFixed(1)} hours)`,
        currentValue: newWeeklyHours,
        threshold: 35
      })
    }

    // Check consecutive days (simplified - would need more complex logic for cross-week)
    const wouldWorkSeventhDay = staffHours.consecutiveDaysWorked >= 6 &&
                                !staffHours.dailyBreakdown.some(day => day.date === shiftDate)

    if (wouldWorkSeventhDay) {
      if (!overrideSeventhDay) {
        blocks.push({
          type: 'CONSECUTIVE_7',
          message: 'Would create 7th consecutive working day (manager override required)',
          currentValue: 7,
          threshold: 7
        })
        requiredOverrides.push('SEVENTH_DAY')
      }
    } else if (staffHours.consecutiveDaysWorked >= 5) {
      warnings.push({
        type: 'CONSECUTIVE_6',
        message: 'Would create 6th consecutive working day',
        currentValue: staffHours.consecutiveDaysWorked + 1,
        threshold: 6
      })
    }

    const canAssign = blocks.length === 0 || (blocks.length === 1 && blocks[0].type === 'CONSECUTIVE_7' && overrideSeventhDay)

    return {
      canAssign,
      warnings,
      blocks,
      requiredOverrides
    }
  }

  async getShiftAssignmentPreview(
    shiftId: number,
    userId: number
  ): Promise<{
    currentHours: StaffHours
    projectedHours: StaffHours
    overtimeImpact: {
      additionalOvertimeHours: number
      additionalOvertimeCost: number
      newTotalCost: number
    }
    canAssign: boolean
    warnings: OvertimeWarning[]
    blocks: OvertimeBlock[]
  }> {
    const shift = await this.prisma.shift.findUnique({
      where: { id: shiftId },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true
      }
    })

    if (!shift) {
      throw new Error('Shift not found')
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        hourlyRate: true
      }
    })

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive')
    }

    const weekStart = this.getWeekStart(shift.date)
    const weekString = this.formatWeekString(weekStart)

    const currentHours = await this.getStaffHours(userId, weekString)
    if (!currentHours) {
      throw new Error('Could not calculate current staff hours')
    }

    const shiftHours = this.calculateShiftHours(shift.startTime, shift.endTime)
    const assignmentCheck = await this.canAssignToShift(shiftId, userId)

    // Calculate projected hours
    const newWeeklyTotal = currentHours.weeklyTotal + shiftHours
    const newOvertimeHours = Math.max(0, newWeeklyTotal - 40)
    const additionalOvertimeHours = newOvertimeHours - currentHours.overtimeHours
    const hourlyRate = user.hourlyRate || 0
    const additionalOvertimeCost = additionalOvertimeHours * hourlyRate * 1.5
    const newTotalCost = currentHours.totalCost + (shiftHours * hourlyRate) +
                        (additionalOvertimeHours * hourlyRate * 0.5) // 0.5x additional for overtime premium

    // Create projected hours object (simplified version)
    const projectedHours: StaffHours = {
      ...currentHours,
      weeklyTotal: newWeeklyTotal,
      overtimeHours: newOvertimeHours,
      regularHours: Math.min(newWeeklyTotal, 40),
      overtimeCost: newOvertimeHours * hourlyRate * 1.5,
      totalCost: newTotalCost
    }

    return {
      currentHours,
      projectedHours,
      overtimeImpact: {
        additionalOvertimeHours,
        additionalOvertimeCost,
        newTotalCost
      },
      canAssign: assignmentCheck.canAssign,
      warnings: assignmentCheck.warnings,
      blocks: assignmentCheck.blocks
    }
  }

  private formatWeekString(weekStart: Date): string {
    const year = weekStart.getFullYear()
    const week = this.getWeekNumber(weekStart)
    return `${year}-W${week.toString().padStart(2, '0')}`
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }
}