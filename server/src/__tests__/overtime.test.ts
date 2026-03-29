import { describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { OvertimeService } from '../services/overtimeService'

const prisma = new PrismaClient()
const overtimeService = new OvertimeService()

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean up test data
  await prisma.shiftAssignment.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.user.deleteMany({
    where: {
      email: { contains: 'test-overtime' }
    }
  })
  await prisma.location.deleteMany({
    where: {
      name: { contains: 'Test Location' }
    }
  })
})

describe('OvertimeService', () => {
  test('should calculate basic weekly hours correctly', async () => {
    // Create test location
    const location = await prisma.location.create({
      data: {
        name: 'Test Location Overtime',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        timezone: 'America/New_York'
      }
    })

    // Create test user with hourly rate
    const user = await prisma.user.create({
      data: {
        email: 'test-overtime-user@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'STAFF',
        hourlyRate: 20.0
      }
    })

    // Create admin user for shift creation
    const admin = await prisma.user.create({
      data: {
        email: 'test-overtime-admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    })

    // Create shifts for a week
    const monday = new Date('2024-03-04T09:00:00Z') // Monday 9 AM
    const shifts = []

    // Monday: 8 hours (9 AM - 5 PM)
    const mondayShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: monday,
        startTime: new Date('2024-03-04T09:00:00Z'),
        endTime: new Date('2024-03-04T17:00:00Z'),
        headcountNeeded: 1,
        title: 'Monday Shift',
        createdById: admin.id,
        status: 'PUBLISHED'
      }
    })
    shifts.push(mondayShift)

    // Tuesday: 8 hours
    const tuesdayShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-05'),
        startTime: new Date('2024-03-05T09:00:00Z'),
        endTime: new Date('2024-03-05T17:00:00Z'),
        headcountNeeded: 1,
        title: 'Tuesday Shift',
        createdById: admin.id,
        status: 'PUBLISHED'
      }
    })
    shifts.push(tuesdayShift)

    // Wednesday: 8 hours
    const wednesdayShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-06'),
        startTime: new Date('2024-03-06T09:00:00Z'),
        endTime: new Date('2024-03-06T17:00:00Z'),
        headcountNeeded: 1,
        title: 'Wednesday Shift',
        createdById: admin.id,
        status: 'PUBLISHED'
      }
    })
    shifts.push(wednesdayShift)

    // Thursday: 8 hours
    const thursdayShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-07'),
        startTime: new Date('2024-03-07T09:00:00Z'),
        endTime: new Date('2024-03-07T17:00:00Z'),
        headcountNeeded: 1,
        title: 'Thursday Shift',
        createdById: admin.id,
        status: 'PUBLISHED'
      }
    })
    shifts.push(thursdayShift)

    // Friday: 8 hours
    const fridayShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-08'),
        startTime: new Date('2024-03-08T09:00:00Z'),
        endTime: new Date('2024-03-08T17:00:00Z'),
        headcountNeeded: 1,
        title: 'Friday Shift',
        createdById: admin.id,
        status: 'PUBLISHED'
      }
    })
    shifts.push(fridayShift)

    // Saturday: 4 hours (overtime hours)
    const saturdayShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-09'),
        startTime: new Date('2024-03-09T09:00:00Z'),
        endTime: new Date('2024-03-09T13:00:00Z'),
        headcountNeeded: 1,
        title: 'Saturday Shift',
        createdById: admin.id,
        status: 'PUBLISHED'
      }
    })
    shifts.push(saturdayShift)

    // Assign user to all shifts
    for (const shift of shifts) {
      await prisma.shiftAssignment.create({
        data: {
          shiftId: shift.id,
          userId: user.id,
          assignedById: admin.id,
          isConfirmed: true
        }
      })
    }

    // Test the overtime calculation
    const staffHours = await overtimeService.getStaffHours(user.id, '2024-W10')

    expect(staffHours).not.toBeNull()
    expect(staffHours!.weeklyTotal).toBe(44) // 5 * 8 + 4 hours
    expect(staffHours!.regularHours).toBe(40)
    expect(staffHours!.overtimeHours).toBe(4)
    expect(staffHours!.overtimeCost).toBe(4 * 20 * 1.5) // 4 hours * $20 * 1.5 = $120
    expect(staffHours!.totalCost).toBe((40 * 20) + (4 * 20 * 1.5)) // $800 + $120 = $920

    // Check warnings and blocks
    expect(staffHours!.warnings.some(w => w.type === 'WEEKLY_35')).toBe(true)
    expect(staffHours!.blocks.some(b => b.type === 'WEEKLY_40')).toBe(true)
  })

  test('should detect daily hour violations', async () => {
    // Create test data
    const location = await prisma.location.create({
      data: {
        name: 'Test Location Daily',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        timezone: 'America/New_York'
      }
    })

    const user = await prisma.user.create({
      data: {
        email: 'test-daily-user@example.com',
        firstName: 'Daily',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'STAFF',
        hourlyRate: 15.0
      }
    })

    const admin = await prisma.user.create({
      data: {
        email: 'test-daily-admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    })

    // Create a 14-hour shift (exceeds daily limit)
    const longShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-04'),
        startTime: new Date('2024-03-04T06:00:00Z'), // 6 AM
        endTime: new Date('2024-03-04T20:00:00Z'),   // 8 PM (14 hours)
        headcountNeeded: 1,
        title: 'Long Shift',
        createdById: admin.id,
        status: 'PUBLISHED'
      }
    })

    await prisma.shiftAssignment.create({
      data: {
        shiftId: longShift.id,
        userId: user.id,
        assignedById: admin.id,
        isConfirmed: true
      }
    })

    const staffHours = await overtimeService.getStaffHours(user.id, '2024-W10')

    expect(staffHours).not.toBeNull()
    expect(staffHours!.blocks.some(b => b.type === 'DAILY_12')).toBe(true)
    expect(staffHours!.dailyBreakdown[0].hours).toBe(14)
  })

  test('should check assignment preview correctly', async () => {
    // Create test data
    const location = await prisma.location.create({
      data: {
        name: 'Test Location Preview',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        timezone: 'America/New_York'
      }
    })

    const user = await prisma.user.create({
      data: {
        email: 'test-preview-user@example.com',
        firstName: 'Preview',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'STAFF',
        hourlyRate: 25.0
      }
    })

    const admin = await prisma.user.create({
      data: {
        email: 'test-preview-admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    })

    // Create 5 existing 8-hour shifts (40 hours total)
    for (let i = 0; i < 5; i++) {
      const shift = await prisma.shift.create({
        data: {
          locationId: location.id,
          date: new Date(`2024-03-0${4 + i}`),
          startTime: new Date(`2024-03-0${4 + i}T09:00:00Z`),
          endTime: new Date(`2024-03-0${4 + i}T17:00:00Z`),
          headcountNeeded: 1,
          title: `Shift ${i + 1}`,
          createdById: admin.id,
          status: 'PUBLISHED'
        }
      })

      await prisma.shiftAssignment.create({
        data: {
          shiftId: shift.id,
          userId: user.id,
          assignedById: admin.id,
          isConfirmed: true
        }
      })
    }

    // Create a new 6-hour shift to preview
    const newShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-09'),
        startTime: new Date('2024-03-09T10:00:00Z'),
        endTime: new Date('2024-03-09T16:00:00Z'),
        headcountNeeded: 1,
        title: 'New Weekend Shift',
        createdById: admin.id,
        status: 'PUBLISHED'
      }
    })

    const preview = await overtimeService.getShiftAssignmentPreview(newShift.id, user.id)

    expect(preview.currentHours.weeklyTotal).toBe(40)
    expect(preview.projectedHours.weeklyTotal).toBe(46)
    expect(preview.overtimeImpact.additionalOvertimeHours).toBe(6)
    expect(preview.overtimeImpact.additionalOvertimeCost).toBe(6 * 25 * 1.5) // 6 * $25 * 1.5 = $225
    expect(preview.blocks.some(b => b.type === 'WEEKLY_40')).toBe(true)
  })
})