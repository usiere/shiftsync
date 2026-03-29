import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'
import { timezoneService } from '../timezoneService'

const DAILY_HOURS_WARNING = 8
const DAILY_HOURS_HARD_LIMIT = 12

export function validateDailyHours(context: ConstraintContext): ValidationResult {
  const { proposedAssignment, existingAssignments } = context
  const { user, shift: proposedShift } = proposedAssignment
  const userId = user.id

  // Calculate hours for the proposed shift accounting for timezone
  const proposedShiftHours = timezoneService.getShiftDurationHours(
    proposedShift.startTime,
    proposedShift.endTime,
    proposedShift.location.timezone
  )

  // Find existing assignments on the same day
  const sameDayAssignments = existingAssignments.filter(assignment =>
    assignment.userId === userId &&
    timezoneService.areSameDay(assignment.shift.date, proposedShift.date)
  )

  // Calculate total hours for the day including the proposed shift
  const existingDailyHours = sameDayAssignments.reduce((total, assignment) => {
    return total + timezoneService.getShiftDurationHours(
      assignment.shift.startTime,
      assignment.shift.endTime,
      assignment.shift.location.timezone
    )
  }, 0)

  const totalDailyHours = existingDailyHours + proposedShiftHours

  // Check hard limit
  if (totalDailyHours > DAILY_HOURS_HARD_LIMIT) {
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

      // Check if alternative user would exceed daily limits
      const altSameDayAssignments = existingAssignments.filter(assignment =>
        assignment.userId === alternativeUser.id &&
        timezoneService.areSameDay(assignment.shift.date, proposedShift.date)
      )

      const altExistingDailyHours = altSameDayAssignments.reduce((total, assignment) => {
        return total + timezoneService.getShiftDurationHours(
          assignment.shift.startTime,
          assignment.shift.endTime,
          assignment.shift.location.timezone
        )
      }, 0)

      const altTotalDailyHours = altExistingDailyHours + proposedShiftHours

      return altTotalDailyHours <= DAILY_HOURS_HARD_LIMIT
    })

    return {
      valid: false,
      rule: ConstraintType.DAILY_HOURS_LIMIT,
      message: `${user.firstName} ${user.lastName} would work ${totalDailyHours.toFixed(1)} hours on ${proposedShift.date.toDateString()}, exceeding the ${DAILY_HOURS_HARD_LIMIT}-hour daily limit`,
      suggestions,
      severity: 'error'
    }
  }

  // Check warning threshold
  if (totalDailyHours > DAILY_HOURS_WARNING) {
    return {
      valid: true,
      rule: ConstraintType.DAILY_HOURS_LIMIT,
      message: `Warning: ${user.firstName} ${user.lastName} would work ${totalDailyHours.toFixed(1)} hours on ${proposedShift.date.toDateString()}, exceeding the ${DAILY_HOURS_WARNING}-hour recommended daily limit`,
      suggestions: [],
      severity: 'warning'
    }
  }

  return {
    valid: true,
    rule: ConstraintType.DAILY_HOURS_LIMIT,
    message: `Daily hours within acceptable limits (${totalDailyHours.toFixed(1)} hours)`,
    suggestions: []
  }
}