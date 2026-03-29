import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'
import { doShiftsOverlap } from '../../utils/timezone'

export function validateNoDoubleBooking(context: ConstraintContext): ValidationResult {
  const { proposedAssignment, existingAssignments } = context
  const { userId, shift: proposedShift } = proposedAssignment

  // Find overlapping assignments for the same user
  const overlappingAssignments = existingAssignments.filter(assignment => {
    if (assignment.userId !== userId) return false

    return doShiftsOverlap(
      proposedShift.startTime,
      proposedShift.endTime,
      assignment.shift.startTime,
      assignment.shift.endTime
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
        return doShiftsOverlap(
          proposedShift.startTime,
          proposedShift.endTime,
          assignment.shift.startTime,
          assignment.shift.endTime
        )
      })

      return !hasOverlap
    })

    return {
      valid: false,
      rule: ConstraintType.NO_DOUBLE_BOOKING,
      message: `${proposedAssignment.user.firstName} ${proposedAssignment.user.lastName} is already assigned to a shift from ${overlappingShift.shift.startTime.toLocaleTimeString()} to ${overlappingShift.shift.endTime.toLocaleTimeString()}`,
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