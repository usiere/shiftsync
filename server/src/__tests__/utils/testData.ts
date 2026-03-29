import { UserRole } from '@prisma/client'
import { ShiftAssignmentData, ExistingAssignment, QualifiedUser, ConstraintContext } from '../../types/constraint'

// Mock users
export const mockUsers: QualifiedUser[] = [
  {
    id: 1,
    email: 'alice@test.com',
    firstName: 'Alice',
    lastName: 'Smith',
    phone: '+1234567890',
    password: 'hashedpassword',
    role: UserRole.STAFF,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userSkills: [
      {
        id: 1,
        userId: 1,
        skillId: 1,
        proficiency: 4,
        certifiedAt: new Date('2024-01-01'),
        expiresAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        skill: { id: 1, name: 'Bartender' }
      }
    ],
    locationCertifications: [
      {
        id: 1,
        userId: 1,
        locationId: 1,
        certifiedAt: new Date('2024-01-01'),
        expiresAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ],
    availability: [
      {
        id: 1,
        userId: 1,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        specificDate: null,
        startDateTime: null,
        endDateTime: null,
        isAvailable: true,
        isRecurring: true,
        notes: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
  },
  {
    id: 2,
    email: 'bob@test.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    phone: '+1234567891',
    password: 'hashedpassword',
    role: UserRole.STAFF,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userSkills: [
      {
        id: 2,
        userId: 2,
        skillId: 1,
        proficiency: 5,
        certifiedAt: new Date('2024-01-01'),
        expiresAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        skill: { id: 1, name: 'Bartender' }
      }
    ],
    locationCertifications: [
      {
        id: 2,
        userId: 2,
        locationId: 1,
        certifiedAt: new Date('2024-01-01'),
        expiresAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ],
    availability: [
      {
        id: 2,
        userId: 2,
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '18:00',
        specificDate: null,
        startDateTime: null,
        endDateTime: null,
        isAvailable: true,
        isRecurring: true,
        notes: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
  },
  {
    id: 3,
    email: 'charlie@test.com',
    firstName: 'Charlie',
    lastName: 'Brown',
    phone: '+1234567892',
    password: 'hashedpassword',
    role: UserRole.STAFF,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    userSkills: [
      {
        id: 3,
        userId: 3,
        skillId: 2,
        proficiency: 3,
        certifiedAt: new Date('2024-01-01'),
        expiresAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        skill: { id: 2, name: 'Server' }
      }
    ],
    locationCertifications: [
      {
        id: 3,
        userId: 3,
        locationId: 2,
        certifiedAt: new Date('2024-01-01'),
        expiresAt: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ],
    availability: [
      {
        id: 3,
        userId: 3,
        dayOfWeek: 1, // Monday
        startTime: '12:00',
        endTime: '20:00',
        specificDate: null,
        startDateTime: null,
        endDateTime: null,
        isAvailable: true,
        isRecurring: true,
        notes: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ]
  }
]

// Helper to create a shift assignment
export function createShiftAssignment(
  userId: number,
  shiftData: Partial<{
    id: number
    locationId: number
    locationName: string
    locationTimezone: string
    skillId: number
    skillName: string
    date: Date
    startTime: Date
    endTime: Date
  }>
): ShiftAssignmentData {
  const user = mockUsers.find(u => u.id === userId)
  if (!user) throw new Error(`User with id ${userId} not found`)

  const defaultShiftData = {
    id: 1,
    locationId: 1,
    locationName: 'Test Location',
    locationTimezone: 'America/New_York',
    skillId: 1,
    skillName: 'Bartender',
    date: new Date('2024-01-15'),
    startTime: new Date('2024-01-15T14:00:00Z'),
    endTime: new Date('2024-01-15T18:00:00Z')
  }

  const shiftInfo = { ...defaultShiftData, ...shiftData }

  return {
    shiftId: shiftInfo.id,
    userId,
    shift: {
      id: shiftInfo.id,
      locationId: shiftInfo.locationId,
      skillId: shiftData.skillId || null,
      date: shiftInfo.date,
      startTime: shiftInfo.startTime,
      endTime: shiftInfo.endTime,
      headcountNeeded: 1,
      status: 'PUBLISHED' as any,
      title: 'Test Shift',
      description: null,
      createdById: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      publishedAt: new Date('2024-01-01'),
      location: {
        id: shiftInfo.locationId,
        name: shiftInfo.locationName,
        timezone: shiftInfo.locationTimezone
      },
      skill: shiftData.skillId ? {
        id: shiftInfo.skillId,
        name: shiftInfo.skillName
      } : null
    },
    user
  }
}

// Helper to create existing assignments
export function createExistingAssignment(
  userId: number,
  shiftData: Partial<{
    id: number
    locationId: number
    date: Date
    startTime: Date
    endTime: Date
    timezone: string
  }>
): ExistingAssignment {
  const defaultData = {
    id: 100,
    locationId: 1,
    date: new Date('2024-01-14'),
    startTime: new Date('2024-01-14T10:00:00Z'),
    endTime: new Date('2024-01-14T14:00:00Z'),
    timezone: 'America/New_York'
  }

  const assignmentData = { ...defaultData, ...shiftData }

  return {
    id: assignmentData.id,
    shiftId: assignmentData.id,
    userId,
    shift: {
      id: assignmentData.id,
      date: assignmentData.date,
      startTime: assignmentData.startTime,
      endTime: assignmentData.endTime,
      locationId: assignmentData.locationId,
      location: {
        timezone: assignmentData.timezone
      }
    }
  }
}

// Helper to create constraint context
export function createConstraintContext(
  assignment: ShiftAssignmentData,
  existingAssignments: ExistingAssignment[] = [],
  overrideFlags?: { allowConsecutiveDays?: boolean; allowExcessiveHours?: boolean }
): ConstraintContext {
  return {
    proposedAssignment: assignment,
    existingAssignments,
    allQualifiedUsers: mockUsers,
    overrideFlags
  }
}