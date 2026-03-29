import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'
import { timezoneService } from '../timezoneService'

const WEEKLY_HOURS_WARNING = 35
const WEEKLY_HOURS_HARD_LIMIT = 40

export function validateWeeklyHours(context: ConstraintContext): ValidationResult {
  const { proposedAssignment, existingAssignments } = context
  const { user, shift: proposedShift } = proposedAssignment
  const userId = user.id

  // Calculate hours for the proposed shift accounting for timezone
  const proposedShiftHours = timezoneService.getShiftDurationHours(
    proposedShift.startTime,
    proposedShift.endTime,
    proposedShift.location.timezone
  )

  // Get week range for the proposed shift
  const weekRange = timezoneService.getWeekRange(proposedShift.date)

  // Find existing assignments in the same week
  const sameWeekAssignments = existingAssignments.filter(assignment => {
    if (assignment.userId !== userId) return false

    const assignmentDate = assignment.shift.date
    return assignmentDate >= weekRange.start && assignmentDate <= weekRange.end
  })

  // Calculate total hours for the week including the proposed shift
  const existingWeeklyHours = sameWeekAssignments.reduce((total, assignment) => {
    return total + timezoneService.getShiftDurationHours(
      assignment.shift.startTime,
      assignment.shift.endTime,
      assignment.shift.location.timezone
    )
  }, 0)

  const totalWeeklyHours = existingWeeklyHours + proposedShiftHours

  // Check hard limit
  if (totalWeeklyHours > WEEKLY_HOURS_HARD_LIMIT) {
    if (!context.overrideFlags?.allowExcessiveHours) {
      const suggestions = context.allQualifiedUsers.filter(alternativeUser => {
        if (alternativeUser.id === userId) return false

        // Check basic qualifications
        const hasCertification = alternativeUser.locationCertifications.some(
          cert => cert.locationId === proposedShift.locationId
        )
        if (!hasCertification) return false

        if (proposedShift.skill) {
          const hasSkill = alternativeUser.userSkills.some(us => us.skill.id === proposedShift.skill!.id)
          if (!hasSkill) return false
        }

        // Check if alternative user would exceed weekly limits
        const altSameWeekAssignments = existingAssignments.filter(assignment => {
          if (assignment.userId !== alternativeUser.id) return false

          const assignmentDate = assignment.shift.date
          return assignmentDate >= weekRange.start && assignmentDate <= weekRange.end
        })

        const altExistingWeeklyHours = altSameWeekAssignments.reduce((total, assignment) => {
          return total + timezoneService.getShiftDurationHours(
            assignment.shift.startTime,
            assignment.shift.endTime,
            assignment.shift.location.timezone
          )
        }, 0)

        const altTotalWeeklyHours = altExistingWeeklyHours + proposedShiftHours

        return altTotalWeeklyHours <= WEEKLY_HOURS_HARD_LIMIT
      })

      return {
        valid: false,
        rule: ConstraintType.WEEKLY_HOURS_LIMIT,
        message: `${user.firstName} ${user.lastName} would work ${totalWeeklyHours.toFixed(1)} hours in the week of ${weekRange.start.toDateString()}, exceeding the ${WEEKLY_HOURS_HARD_LIMIT}-hour weekly limit. Use override flag to allow.`,
        suggestions,
        severity: 'error'
      }
    }
  }

  // Check warning threshold
  if (totalWeeklyHours > WEEKLY_HOURS_WARNING) {
    return {
      valid: true,
      rule: ConstraintType.WEEKLY_HOURS_LIMIT,
      message: `${totalWeeklyHours > WEEKLY_HOURS_HARD_LIMIT ? 'Override applied: ' : 'Warning: '}${user.firstName} ${user.lastName} would work ${totalWeeklyHours.toFixed(1)} hours in the week of ${weekRange.start.toDateString()}, ${totalWeeklyHours > WEEKLY_HOURS_HARD_LIMIT ? 'exceeding the hard limit' : 'above the recommended limit'} of ${totalWeeklyHours > WEEKLY_HOURS_HARD_LIMIT ? WEEKLY_HOURS_HARD_LIMIT : WEEKLY_HOURS_WARNING} hours`,
      suggestions: [],
      severity: totalWeeklyHours > WEEKLY_HOURS_HARD_LIMIT ? 'error' : 'warning'
    }
  }

  return {
    valid: true,
    rule: ConstraintType.WEEKLY_HOURS_LIMIT,
    message: `Weekly hours within acceptable limits (${totalWeeklyHours.toFixed(1)} hours)`,
    suggestions: []
  }
}