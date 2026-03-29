import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'
import { timezoneService } from '../timezoneService'
import { addDays, subDays } from 'date-fns'

const CONSECUTIVE_DAYS_WARNING = 6
const CONSECUTIVE_DAYS_HARD_LIMIT = 7

export function validateConsecutiveDays(context: ConstraintContext): ValidationResult {
  const { proposedAssignment, existingAssignments } = context
  const { user, shift: proposedShift } = proposedAssignment
  const userId = user.id

  // Get all assignment dates for the user including the proposed shift
  const userAssignments = existingAssignments.filter(assignment => assignment.userId === userId)
  const assignmentDates = userAssignments.map(assignment => assignment.shift.date)

  // Add the proposed shift date
  const allDates = [...assignmentDates, proposedShift.date]

  // Sort dates and remove duplicates
  const uniqueDates = Array.from(new Set(allDates.map(d => d.getTime())))
    .map(time => new Date(time))
    .sort((a, b) => a.getTime() - b.getTime())

  // Find the sequence that includes the proposed shift date
  const proposedShiftDate = proposedShift.date
  let consecutiveDaysIncludingProposed = 1

  // Count backward from proposed date
  let currentDate = subDays(proposedShiftDate, 1)
  while (uniqueDates.some(date => timezoneService.areSameDay(date, currentDate))) {
    consecutiveDaysIncludingProposed++
    currentDate = subDays(currentDate, 1)
  }

  // Count forward from proposed date
  currentDate = addDays(proposedShiftDate, 1)
  while (uniqueDates.some(date => timezoneService.areSameDay(date, currentDate))) {
    consecutiveDaysIncludingProposed++
    currentDate = addDays(currentDate, 1)
  }

  // Check hard limit
  if (consecutiveDaysIncludingProposed >= CONSECUTIVE_DAYS_HARD_LIMIT) {
    if (!context.overrideFlags?.allowConsecutiveDays) {
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

        // Check if alternative user would have consecutive days issues
        const altUserAssignments = existingAssignments.filter(assignment =>
          assignment.userId === alternativeUser.id
        )
        const altAssignmentDates = altUserAssignments.map(assignment => assignment.shift.date)
        const altAllDates = [...altAssignmentDates, proposedShift.date]

        const altUniqueDates = Array.from(new Set(altAllDates.map(d => d.getTime())))
          .map(time => new Date(time))
          .sort((a, b) => a.getTime() - b.getTime())

        // Calculate consecutive days for alternative user
        let altConsecutiveDays = 1
        let altCurrentDate = subDays(proposedShiftDate, 1)
        while (altUniqueDates.some(date => timezoneService.areSameDay(date, altCurrentDate))) {
          altConsecutiveDays++
          altCurrentDate = subDays(altCurrentDate, 1)
        }

        altCurrentDate = addDays(proposedShiftDate, 1)
        while (altUniqueDates.some(date => timezoneService.areSameDay(date, altCurrentDate))) {
          altConsecutiveDays++
          altCurrentDate = addDays(altCurrentDate, 1)
        }

        return altConsecutiveDays < CONSECUTIVE_DAYS_HARD_LIMIT
      })

      return {
        valid: false,
        rule: ConstraintType.CONSECUTIVE_DAYS_LIMIT,
        message: `${user.firstName} ${user.lastName} would work ${consecutiveDaysIncludingProposed} consecutive days, reaching the ${CONSECUTIVE_DAYS_HARD_LIMIT}-day limit. Use override flag to allow.`,
        suggestions,
        severity: 'error'
      }
    }
  }

  // Check warning threshold
  if (consecutiveDaysIncludingProposed >= CONSECUTIVE_DAYS_WARNING) {
    return {
      valid: true,
      rule: ConstraintType.CONSECUTIVE_DAYS_LIMIT,
      message: `${consecutiveDaysIncludingProposed >= CONSECUTIVE_DAYS_HARD_LIMIT ? 'Override applied: ' : 'Warning: '}${user.firstName} ${user.lastName} would work ${consecutiveDaysIncludingProposed} consecutive days${consecutiveDaysIncludingProposed >= CONSECUTIVE_DAYS_HARD_LIMIT ? ', exceeding the limit' : ''}`,
      suggestions: [],
      severity: consecutiveDaysIncludingProposed >= CONSECUTIVE_DAYS_HARD_LIMIT ? 'error' : 'warning'
    }
  }

  return {
    valid: true,
    rule: ConstraintType.CONSECUTIVE_DAYS_LIMIT,
    message: `Consecutive days within acceptable limits (${consecutiveDaysIncludingProposed} days)`,
    suggestions: []
  }
}