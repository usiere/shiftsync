import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'
import { timezoneService } from '../timezoneService'

export function validateNoDoubleBooking(context: ConstraintContext): ValidationResult {
  const { proposedAssignment, existingAssignments } = context
  const { user, shift: proposedShift } = proposedAssignment
  const userId = user.id

  // Find overlapping assignments for the same user
  const overlappingAssignments = existingAssignments.filter(assignment => {
    if (assignment.userId !== userId) return false

    return timezoneService.doShiftsOverlap(
      proposedShift.startTime,
      proposedShift.endTime,
      proposedShift.location.timezone,
      assignment.shift.startTime,
      assignment.shift.endTime,
      assignment.shift.location.timezone
    )
  })

  if (overlappingAssignments.length > 0) {
    const overlappingShift = overlappingAssignments[0]

    // Find alternative qualified users
    const suggestions = context.allQualifiedUsers.filter(user => {
      if (user.id === userId) return false

      // Check if user has required skill
      if (proposedShift.skill) {
        const hasSkill = user.userSkills.some(us => us.skill.id === proposedShift.skill!.id)
        if (!hasSkill) return false
      }

      // Check if user is certified for location
      const hasCertification = user.locationCertifications.some(
        cert => cert.locationId === proposedShift.locationId
      )
      if (!hasCertification) return false

      // Check if user has no overlapping assignments
      const hasOverlap = existingAssignments.some(assignment => {
        if (assignment.userId !== user.id) return false
        return timezoneService.doShiftsOverlap(
          proposedShift.startTime,
          proposedShift.endTime,
          proposedShift.location.timezone,
          assignment.shift.startTime,
          assignment.shift.endTime,
          assignment.shift.location.timezone
        )
      })

      return !hasOverlap
    })

    return {
      valid: false,
      rule: ConstraintType.NO_DOUBLE_BOOKING,
      message: `${user.firstName} ${user.lastName} is already assigned to a shift from ${overlappingShift.shift.startTime.toLocaleTimeString()} to ${overlappingShift.shift.endTime.toLocaleTimeString()}`,
      suggestions
    }
  }

  return {
    valid: true,
    rule: ConstraintType.NO_DOUBLE_BOOKING,
    message: 'No double booking conflicts',
    suggestions: []
  }
}