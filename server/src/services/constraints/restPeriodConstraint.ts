import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'
import { timezoneService } from '../timezoneService'

const MINIMUM_REST_HOURS = 10

export function validateMinimumRestPeriod(context: ConstraintContext): ValidationResult {
  const { proposedAssignment, existingAssignments } = context
  const { user, shift: proposedShift } = proposedAssignment
  const userId = user.id

  // Find assignments for the same user
  const userAssignments = existingAssignments.filter(assignment => assignment.userId === userId)

  // Check rest periods before and after the proposed shift
  for (const assignment of userAssignments) {
    const existingShift = assignment.shift

    // Check rest period after existing shift and before proposed shift
    if (existingShift.endTime <= proposedShift.startTime) {
      // Calculate rest time accounting for timezone differences
      const endTimeLocal = timezoneService.toLocationTime(existingShift.endTime, existingShift.location.timezone)
      const startTimeLocal = timezoneService.toLocationTime(proposedShift.startTime, proposedShift.location.timezone)
      const restHours = (startTimeLocal.toMillis() - endTimeLocal.toMillis()) / (1000 * 60 * 60)

      if (restHours < MINIMUM_REST_HOURS) {
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

          return hasCertification
        })

        return {
          valid: false,
          rule: ConstraintType.MINIMUM_REST_PERIOD,
          message: `${user.firstName} ${user.lastName} would only have ${restHours.toFixed(1)} hours rest between shifts. Minimum required: ${MINIMUM_REST_HOURS} hours.`,
          suggestions
        }
      }
    }

    // Check rest period after proposed shift and before existing shift
    if (proposedShift.endTime <= existingShift.startTime) {
      // Calculate rest time accounting for timezone differences
      const endTimeLocal = timezoneService.toLocationTime(proposedShift.endTime, proposedShift.location.timezone)
      const startTimeLocal = timezoneService.toLocationTime(existingShift.startTime, existingShift.location.timezone)
      const restHours = (startTimeLocal.toMillis() - endTimeLocal.toMillis()) / (1000 * 60 * 60)

      if (restHours < MINIMUM_REST_HOURS) {
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

          return hasCertification
        })

        return {
          valid: false,
          rule: ConstraintType.MINIMUM_REST_PERIOD,
          message: `${user.firstName} ${user.lastName} would only have ${restHours.toFixed(1)} hours rest between shifts. Minimum required: ${MINIMUM_REST_HOURS} hours.`,
          suggestions
        }
      }
    }
  }

  return {
    valid: true,
    rule: ConstraintType.MINIMUM_REST_PERIOD,
    message: 'Sufficient rest period between shifts',
    suggestions: []
  }
}