import { ValidationResult, ConstraintContext, ConstraintType } from '../../types/constraint'
import { timezoneService, ShiftTimes, StaffAvailability } from '../timezoneService'

export function validateAvailabilityWindow(context: ConstraintContext): ValidationResult {
  const { proposedAssignment } = context
  const { user, shift } = proposedAssignment

  // Convert shift to TimezoneService format
  const shiftTimes: ShiftTimes = {
    id: shift.id,
    date: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    locationTimezone: shift.location.timezone
  }

  // Convert user availability to TimezoneService format
  const staffAvailability: StaffAvailability[] = user.availability.map(avail => ({
    id: avail.id,
    userId: avail.userId,
    dayOfWeek: avail.dayOfWeek,
    startTime: avail.startTime,
    endTime: avail.endTime,
    specificDate: avail.specificDate,
    startDateTime: avail.startDateTime,
    endDateTime: avail.endDateTime,
    isAvailable: avail.isAvailable,
    isRecurring: avail.isRecurring,
    notes: avail.notes
  }))

  // Check availability using TimezoneService
  const availabilityCheck = timezoneService.isWithinAvailability(shiftTimes, staffAvailability)

  let isAvailable = availabilityCheck.isAvailable
  let reasonMessage = availabilityCheck.details

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

      // Check availability using TimezoneService
      const altStaffAvailability: StaffAvailability[] = alternativeUser.availability.map(avail => ({
        id: avail.id,
        userId: avail.userId,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        specificDate: avail.specificDate,
        startDateTime: avail.startDateTime,
        endDateTime: avail.endDateTime,
        isAvailable: avail.isAvailable,
        isRecurring: avail.isRecurring,
        notes: avail.notes
      }))

      const altAvailabilityCheck = timezoneService.isWithinAvailability(shiftTimes, altStaffAvailability)
      return altAvailabilityCheck.isAvailable
    })

    // Get display information for error message
    const shiftDisplay = timezoneService.getShiftDisplay(shiftTimes)

    return {
      valid: false,
      rule: ConstraintType.AVAILABILITY_WINDOW,
      message: `${user.firstName} ${user.lastName} ${reasonMessage} for this shift (${shiftDisplay.localStartTime} - ${shiftDisplay.localEndTime} ${shiftDisplay.timezoneAbbreviation} on ${shiftDisplay.localDate})`,
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