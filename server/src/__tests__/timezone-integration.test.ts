import { describe, test, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'
import { PrismaClient } from '@prisma/client'
import { validateAvailabilityWindow } from '../services/constraints/availabilityConstraint'
import { timezoneService } from '../services/timezoneService'
import { ConstraintContext } from '../types/constraint'

const prisma = new PrismaClient()

beforeAll(async () => {
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  // Clean up test data in proper order to avoid foreign key constraints
  await prisma.swapRequest.deleteMany()
  await prisma.shiftAssignment.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.shift.deleteMany()
  await prisma.locationCertification.deleteMany()
  await prisma.userSkill.deleteMany()
  await prisma.user.deleteMany({
    where: { email: { contains: 'timezone-test' } }
  })
  await prisma.location.deleteMany({
    where: { name: { contains: 'Timezone Test' } }
  })
  await prisma.skill.deleteMany({
    where: { name: { contains: 'Timezone Test' } }
  })
})

describe('Timezone Integration Tests', () => {
  test('should correctly validate availability across timezones', async () => {
    // Create locations in different timezones
    const nyLocation = await prisma.location.create({
      data: {
        name: 'Timezone Test NY',
        address: '123 Test St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        timezone: 'America/New_York'
      }
    })

    const laLocation = await prisma.location.create({
      data: {
        name: 'Timezone Test LA',
        address: '456 Test Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        timezone: 'America/Los_Angeles'
      }
    })

    // Create test skill
    const skill = await prisma.skill.create({
      data: {
        name: 'Timezone Test Skill',
        description: 'Test skill for timezone validation'
      }
    })

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'timezone-test-user@example.com',
        firstName: 'Timezone',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    // Certify user for both locations
    await prisma.locationCertification.createMany({
      data: [
        { userId: user.id, locationId: nyLocation.id },
        { userId: user.id, locationId: laLocation.id }
      ]
    })

    // Add user skill
    await prisma.userSkill.create({
      data: {
        userId: user.id,
        skillId: skill.id,
        proficiency: 3
      }
    })

    // Create recurring availability: Monday-Friday 9 AM - 5 PM in user's local time (EST)
    await prisma.availability.create({
      data: {
        userId: user.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
        isRecurring: true
      }
    })

    // Create admin user for shift creation
    const admin = await prisma.user.create({
      data: {
        email: 'timezone-test-admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    })

    // Test 1: Shift in NY that should match availability
    const nyShift = await prisma.shift.create({
      data: {
        locationId: nyLocation.id,
        skillId: skill.id,
        date: new Date('2024-03-18'), // Monday
        startTime: new Date('2024-03-18T14:00:00Z'), // 10:00 AM EST
        endTime: new Date('2024-03-18T20:00:00Z'),   // 04:00 PM EST
        headcountNeeded: 1,
        title: 'NY Morning Shift',
        createdById: admin.id,
        status: 'DRAFT'
      },
      include: {
        location: true,
        skill: true
      }
    })

    // Test 2: Shift in LA that should match availability (accounting for timezone)
    const laShift = await prisma.shift.create({
      data: {
        locationId: laLocation.id,
        skillId: skill.id,
        date: new Date('2024-03-18'), // Monday
        startTime: new Date('2024-03-18T17:00:00Z'), // 10:00 AM PST
        endTime: new Date('2024-03-18T23:00:00Z'),   // 04:00 PM PST
        headcountNeeded: 1,
        title: 'LA Morning Shift',
        createdById: admin.id,
        status: 'DRAFT'
      },
      include: {
        location: true,
        skill: true
      }
    })

    // Test 3: Shift that should NOT match (outside availability hours)
    const nightShift = await prisma.shift.create({
      data: {
        locationId: nyLocation.id,
        skillId: skill.id,
        date: new Date('2024-03-18'), // Monday
        startTime: new Date('2024-03-19T02:00:00Z'), // 10:00 PM EST
        endTime: new Date('2024-03-19T10:00:00Z'),   // 06:00 AM EST
        headcountNeeded: 1,
        title: 'NY Night Shift',
        createdById: admin.id,
        status: 'DRAFT'
      },
      include: {
        location: true,
        skill: true
      }
    })

    // Get user with availability
    const userWithAvailability = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        availability: true,
        userSkills: { include: { skill: true } },
        locationCertifications: true
      }
    })

    const allUsers = [userWithAvailability!]

    // Test NY shift validation
    const nyContext: ConstraintContext = {
      proposedAssignment: {
        user: userWithAvailability!,
        shift: nyShift
      },
      allQualifiedUsers: allUsers,
      existingAssignments: []
    }

    const nyResult = validateAvailabilityWindow(nyContext)
    expect(nyResult.valid).toBe(true)
    expect(nyResult.message).toContain('User is available')

    // Test LA shift validation
    const laContext: ConstraintContext = {
      proposedAssignment: {
        user: userWithAvailability!,
        shift: laShift
      },
      allQualifiedUsers: allUsers,
      existingAssignments: []
    }

    const laResult = validateAvailabilityWindow(laContext)
    expect(laResult.valid).toBe(true)
    expect(laResult.message).toContain('User is available')

    // Test night shift validation (should fail)
    const nightContext: ConstraintContext = {
      proposedAssignment: {
        user: userWithAvailability!,
        shift: nightShift
      },
      allQualifiedUsers: allUsers,
      existingAssignments: []
    }

    const nightResult = validateAvailabilityWindow(nightContext)
    expect(nightResult.valid).toBe(false)
    expect(nightResult.message).toContain('No matching availability found')
  })

  test('should handle overnight shifts with availability constraints', async () => {
    // Create location and user
    const location = await prisma.location.create({
      data: {
        name: 'Timezone Test Overnight',
        address: '789 Test Blvd',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60001',
        timezone: 'America/Chicago'
      }
    })

    const user = await prisma.user.create({
      data: {
        email: 'timezone-test-overnight@example.com',
        firstName: 'Night',
        lastName: 'Worker',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    await prisma.locationCertification.create({
      data: { userId: user.id, locationId: location.id }
    })

    // Create overnight availability: Friday 10 PM - Saturday 6 AM
    await prisma.availability.create({
      data: {
        userId: user.id,
        dayOfWeek: 5, // Friday
        startTime: '22:00',
        endTime: '06:00', // Overnight to Saturday
        isAvailable: true,
        isRecurring: true
      }
    })

    const admin = await prisma.user.create({
      data: {
        email: 'timezone-test-overnight-admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    })

    // Create overnight shift: Friday 10 PM - Saturday 2 AM (Chicago time)
    const overnightShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-15'), // Friday
        startTime: new Date('2024-03-16T04:00:00Z'), // 10:00 PM CST Friday
        endTime: new Date('2024-03-16T08:00:00Z'),   // 02:00 AM CST Saturday
        headcountNeeded: 1,
        title: 'Overnight Security',
        createdById: admin.id,
        status: 'DRAFT'
      },
      include: {
        location: true
      }
    })

    // Verify shift display shows overnight correctly
    const shiftDisplay = timezoneService.getShiftDisplay({
      id: overnightShift.id,
      date: overnightShift.date,
      startTime: overnightShift.startTime,
      endTime: overnightShift.endTime,
      locationTimezone: location.timezone
    })

    expect(shiftDisplay.isOvernight).toBe(true)
    expect(shiftDisplay.localStartTime).toBe('22:00')
    expect(shiftDisplay.localEndTime).toBe('02:00')
    expect(shiftDisplay.duration).toBe(4)

    // Validate availability
    const userWithAvailability = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        availability: true,
        userSkills: { include: { skill: true } },
        locationCertifications: true
      }
    })

    const context: ConstraintContext = {
      proposedAssignment: {
        user: userWithAvailability!,
        shift: overnightShift
      },
      allQualifiedUsers: [userWithAvailability!],
      existingAssignments: []
    }

    const result = validateAvailabilityWindow(context)
    expect(result.valid).toBe(true)
    expect(result.message).toContain('User is available')
  })

  test('should handle specific date availability overrides', async () => {
    const location = await prisma.location.create({
      data: {
        name: 'Timezone Test Override',
        address: '321 Test Way',
        city: 'Denver',
        state: 'CO',
        zipCode: '80001',
        timezone: 'America/Denver'
      }
    })

    const user = await prisma.user.create({
      data: {
        email: 'timezone-test-override@example.com',
        firstName: 'Flex',
        lastName: 'Worker',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    await prisma.locationCertification.create({
      data: { userId: user.id, locationId: location.id }
    })

    // Regular availability: Monday-Friday 9 AM - 5 PM
    await prisma.availability.create({
      data: {
        userId: user.id,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
        isRecurring: true
      }
    })

    // Specific unavailability: Doctor appointment on this Monday 2-4 PM
    await prisma.availability.create({
      data: {
        userId: user.id,
        specificDate: new Date('2024-03-18'), // Monday
        startDateTime: timezoneService.toUTC('2024-03-18T14:00:00', location.timezone), // 2 PM MST
        endDateTime: timezoneService.toUTC('2024-03-18T16:00:00', location.timezone),   // 4 PM MST
        isAvailable: false,
        isRecurring: false,
        notes: 'Doctor appointment'
      }
    })

    const admin = await prisma.user.create({
      data: {
        email: 'timezone-test-override-admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'hashedpassword',
        role: 'ADMIN'
      }
    })

    // Shift that conflicts with doctor appointment
    const conflictShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-18'),
        startTime: timezoneService.toUTC('2024-03-18T13:00:00', location.timezone), // 1 PM MST
        endTime: timezoneService.toUTC('2024-03-18T15:00:00', location.timezone),   // 3 PM MST
        headcountNeeded: 1,
        title: 'Afternoon Shift',
        createdById: admin.id,
        status: 'DRAFT'
      },
      include: {
        location: true
      }
    })

    // Shift that doesn't conflict
    const goodShift = await prisma.shift.create({
      data: {
        locationId: location.id,
        date: new Date('2024-03-18'),
        startTime: timezoneService.toUTC('2024-03-18T10:00:00', location.timezone), // 10 AM MST
        endTime: timezoneService.toUTC('2024-03-18T13:00:00', location.timezone),   // 1 PM MST
        headcountNeeded: 1,
        title: 'Morning Shift',
        createdById: admin.id,
        status: 'DRAFT'
      },
      include: {
        location: true
      }
    })

    const userWithAvailability = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        availability: true,
        userSkills: { include: { skill: true } },
        locationCertifications: true
      }
    })

    // Test conflicting shift
    const conflictContext: ConstraintContext = {
      proposedAssignment: {
        user: userWithAvailability!,
        shift: conflictShift
      },
      allQualifiedUsers: [userWithAvailability!],
      existingAssignments: []
    }

    const conflictResult = validateAvailabilityWindow(conflictContext)
    expect(conflictResult.valid).toBe(false)
    expect(conflictResult.message).toContain('Conflicts with unavailability')

    // Test non-conflicting shift
    const goodContext: ConstraintContext = {
      proposedAssignment: {
        user: userWithAvailability!,
        shift: goodShift
      },
      allQualifiedUsers: [userWithAvailability!],
      existingAssignments: []
    }

    const goodResult = validateAvailabilityWindow(goodContext)
    expect(goodResult.valid).toBe(true)
    expect(goodResult.message).toContain('User is available')
  })

  test('should handle DST transition periods correctly', async () => {
    const location = await prisma.location.create({
      data: {
        name: 'Timezone Test DST',
        address: '555 DST Ave',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        timezone: 'America/Phoenix' // No DST
      }
    })

    const user = await prisma.user.create({
      data: {
        email: 'timezone-test-dst@example.com',
        firstName: 'DST',
        lastName: 'Tester',
        password: 'hashedpassword',
        role: 'STAFF'
      }
    })

    await prisma.locationCertification.create({
      data: { userId: user.id, locationId: location.id }
    })

    // Check DST transitions
    const dstTransitions = timezoneService.getDSTTransitions('America/Phoenix', 2024)
    expect(dstTransitions).toHaveLength(0) // Phoenix doesn't observe DST

    const nyTransitions = timezoneService.getDSTTransitions('America/New_York', 2024)
    expect(nyTransitions).toHaveLength(2) // New York has spring and fall transitions

    // Verify business day calculation handles DST
    const springForwardDay = new Date('2024-03-10') // Spring forward in Eastern
    const businessDay = timezoneService.calculateBusinessDay(
      springForwardDay,
      'America/New_York',
      9,
      17
    )

    expect(businessDay.isDSTTransitionDay).toBe(true)
    expect(businessDay.duration).toBe(7) // One hour less due to spring forward
    expect(businessDay.transition?.type).toBe('spring')
  })
})