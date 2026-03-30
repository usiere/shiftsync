export interface Location {
  id: number
  name: string
  timezone: string
  address?: string
}

export interface Skill {
  id: number
  name: string
  description?: string
}

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

export interface AssignedUser {
  id: number
  firstName: string
  lastName: string
  email: string
}

export interface ShiftAssignment {
  id: number
  userId: number
  user: AssignedUser
  shiftId: number
}

export interface Shift {
  id: number
  location: string | Location
  date: string
  startTime: string
  endTime: string
  timezone?: string
  requiredSkill?: string | Skill
  skill?: string | Skill
  assignedCount?: number
  neededCount?: number
  headcount?: number
  status: 'DRAFT' | 'PUBLISHED'
  assignedStaffIds?: number[]
  assignments?: ShiftAssignment[]
  shiftAssignments?: ShiftAssignment[]
  createdAt?: string
}

export interface SwapRequest {
  id: number
  fromAssignment: ShiftAssignment & { shift: Shift }
  toAssignment: ShiftAssignment & { shift: Shift }
  reason: string
  status: 'PENDING_ACCEPTANCE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  rejectionReason?: string
}