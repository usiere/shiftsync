import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'
import { isTimeInAvailabilityWindow, convertToTimezone, isSameDay } from '../../utils/timezone'

export function validateAvailabilityWindow(context: ConstraintContext): ValidationResult {
  const { proposedAssignment } = context
  const { user, shift } = proposedAssignment
  const timezone = shift.location.timezone

  // Convert shift times to local timezone
  const localShiftStart = convertToTimezone(shift.startTime, timezone)
  const localShiftEnd = convertToTimezone(shift.endTime, timezone)

  // Check recurring availability first
  const recurringAvailability = user.availability.filter(avail => avail.isRecurring && avail.isAvailable)
  const shiftDayOfWeek = localShiftStart.getDay()

  let hasRecurringAvailability = false
  for (const availability of recurringAvailability) {
    if (availability.dayOfWeek === shiftDayOfWeek &&
        availability.startTime && availability.endTime) {

      if (isTimeInAvailabilityWindow(
        shift.startTime,
        shift.endTime,
        availability.startTime,
        availability.endTime,
        shiftDayOfWeek,
        timezone
      )) {
        hasRecurringAvailability = true
        break
      }
    }
  }

  // Check for specific date unavailability
  const specificUnavailability = user.availability.filter(avail =>
    !avail.isRecurring &&
    !avail.isAvailable &&
    avail.specificDate &&
    isSameDay(avail.specificDate, shift.date)
  )

  // Check for specific date availability that might override recurring patterns
  const specificAvailability = user.availability.filter(avail =>
    !avail.isRecurring &&
    avail.isAvailable &&
    avail.specificDate &&
    avail.startDateTime &&
    avail.endDateTime &&
    isSameDay(avail.specificDate, shift.date)
  )

  let hasSpecificAvailability = false
  for (const availability of specificAvailability) {
    if (availability.startDateTime! <= shift.startTime &&
        availability.endDateTime! >= shift.endTime) {
      hasSpecificAvailability = true
      break
    }
  }

  // If there's specific unavailability, check if it's overridden by specific availability
  const hasSpecificUnavailability = specificUnavailability.length > 0

  let isAvailable = false
  let reasonMessage = ''

  if (hasSpecificAvailability) {
    // Specific availability overrides everything
    isAvailable = true
  } else if (hasSpecificUnavailability) {
    // Specific unavailability blocks the assignment
    isAvailable = false
    reasonMessage = 'has requested time off on this date'
  } else if (hasRecurringAvailability) {
    // Recurring availability and no specific conflicts
    isAvailable = true
  } else {
    // No availability window covers this shift
    isAvailable = false
    reasonMessage = 'is not available during these hours'
  }

  if (!isAvailable) {
    // Find alternative users who are available
    const suggestions = context.allQualifiedUsers.filter(alternativeUser => {
      if (alternativeUser.id === user.id) return false

      // Check basic qualifications first
      const hasCertification = alternativeUser.locationCertifications.some(
        cert => cert.locationId === shift.locationId
      )
      if (!hasCertification) return false

      if (shift.skill) {
        const hasSkill = alternativeUser.userSkills.some(us => us.skill.id === shift.skill!.id)
        if (!hasSkill) return false
      }

      // Check availability for this user
      const altRecurringAvailability = alternativeUser.availability.filter(
        avail => avail.isRecurring && avail.isAvailable
      )

      let altHasRecurringAvailability = false
      for (const availability of altRecurringAvailability) {
        if (availability.dayOfWeek === shiftDayOfWeek &&
            availability.startTime && availability.endTime) {

          if (isTimeInAvailabilityWindow(
            shift.startTime,
            shift.endTime,
            availability.startTime,
            availability.endTime,
            shiftDayOfWeek,
            timezone
          )) {
            altHasRecurringAvailability = true
            break
          }
        }
      }

      const altSpecificUnavailability = alternativeUser.availability.filter(avail =>
        !avail.isRecurring &&
        !avail.isAvailable &&
        avail.specificDate &&
        isSameDay(avail.specificDate, shift.date)
      )

      const altSpecificAvailability = alternativeUser.availability.filter(avail =>
        !avail.isRecurring &&
        avail.isAvailable &&
        avail.specificDate &&
        avail.startDateTime &&
        avail.endDateTime &&
        isSameDay(avail.specificDate, shift.date)
      )

      let altHasSpecificAvailability = false
      for (const availability of altSpecificAvailability) {
        if (availability.startDateTime! <= shift.startTime &&
            availability.endDateTime! >= shift.endTime) {
          altHasSpecificAvailability = true
          break
        }
      }

      const altHasSpecificUnavailability = altSpecificUnavailability.length > 0

      // Determine if alternative user is available
      if (altHasSpecificAvailability) {
        return true
      } else if (altHasSpecificUnavailability) {
        return false
      } else if (altHasRecurringAvailability) {
        return true
      }

      return false
    })

    return {
      valid: false,
      rule: ConstraintType.AVAILABILITY_WINDOW,
      message: `${user.firstName} ${user.lastName} ${reasonMessage || 'is not available'} for this shift (${localShiftStart.toLocaleString()} - ${localShiftEnd.toLocaleString()} ${timezone})`,
      suggestions
    }
  }

  return {
    valid: true,
    rule: ConstraintType.AVAILABILITY_WINDOW,
    message: 'User is available during the shift hours',
    suggestions: []
  }
}