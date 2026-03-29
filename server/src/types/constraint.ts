import { User, Shift, ShiftAssignment, UserSkill, LocationCertification, Availability } from '@prisma/client'

export interface ValidationResult {
  valid: boolean
  rule: string
  message: string
  suggestions: User[]
  severity?: 'warning' | 'error'
}

export interface ShiftAssignmentData {
  shiftId: number
  userId: number
  shift: Shift & {
    location: {
      id: number
      name: string
      timezone: string
    }
    skill?: {
      id: number
      name: string
    } | null
  }
  user: User & {
    userSkills: (UserSkill & {
      skill: {
        id: number
        name: string
      }
    })[]
    locationCertifications: LocationCertification[]
    availability: Availability[]
  }
}

export interface ExistingAssignment {
  id: number
  shiftId: number
  userId: number
  shift: {
    id: number
    date: Date
    startTime: Date
    endTime: Date
    locationId: number
    location: {
      timezone: string
    }
  }
}

export interface QualifiedUser extends User {
  userSkills: (UserSkill & {
    skill: {
      id: number
      name: string
    }
  })[]
  locationCertifications: LocationCertification[]
  availability: Availability[]
}

export interface ConstraintContext {
  proposedAssignment: ShiftAssignmentData
  existingAssignments: ExistingAssignment[]
  allQualifiedUsers: QualifiedUser[]
  overrideFlags?: {
    allowConsecutiveDays?: boolean
    allowExcessiveHours?: boolean
  }
}

export enum ConstraintType {
  NO_DOUBLE_BOOKING = 'NO_DOUBLE_BOOKING',
  MINIMUM_REST_PERIOD = 'MINIMUM_REST_PERIOD',
  SKILL_REQUIREMENT = 'SKILL_REQUIREMENT',
  LOCATION_CERTIFICATION = 'LOCATION_CERTIFICATION',
  AVAILABILITY_WINDOW = 'AVAILABILITY_WINDOW',
  DAILY_HOURS_LIMIT = 'DAILY_HOURS_LIMIT',
  WEEKLY_HOURS_LIMIT = 'WEEKLY_HOURS_LIMIT',
  CONSECUTIVE_DAYS_LIMIT = 'CONSECUTIVE_DAYS_LIMIT'
}