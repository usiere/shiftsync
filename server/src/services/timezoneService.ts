import { DateTime } from 'luxon'

export interface StaffAvailability {
  id: number
  userId: number
  dayOfWeek?: number | null // 0-6 (Sunday-Saturday) for recurring
  startTime?: string | null // HH:mm format for recurring availability
  endTime?: string | null // HH:mm format for recurring availability
  specificDate?: Date | null // For one-off availability/unavailability
  startDateTime?: Date | null // For specific date/time availability (UTC)
  endDateTime?: Date | null // For specific date/time availability (UTC)
  isAvailable: boolean // false for unavailability/time-off
  isRecurring: boolean // true for weekly recurring, false for one-off
  notes?: string | null
}

export interface ShiftTimes {
  id: number
  date: Date // UTC date of shift
  startTime: Date // UTC start time
  endTime: Date // UTC end time
  locationTimezone: string
}

export interface TimezoneShiftDisplay {
  localDate: string // YYYY-MM-DD in location timezone
  localStartTime: string // HH:mm in location timezone
  localEndTime: string // HH:mm in location timezone
  localStartDateTime: string // ISO string in location timezone
  localEndDateTime: string // ISO string in location timezone
  duration: number // Duration in hours
  isOvernight: boolean
  timezone: string
  timezoneAbbreviation: string
}

export interface AvailabilityWindow {
  dayOfWeek: number
  startTime: string // HH:mm
  endTime: string // HH:mm
  isOvernight: boolean // true if endTime < startTime (crosses midnight)
}

export interface DSTTransition {
  date: Date
  type: 'spring' | 'fall' // spring forward, fall back
  offsetBefore: number // minutes from UTC before transition
  offsetAfter: number // minutes from UTC after transition
}

export class TimezoneService {

  /**
   * Convert UTC time to location's local time
   */
  toLocationTime(utcTime: Date, locationTimezone: string): DateTime {
    try {
      return DateTime.fromJSDate(utcTime, { zone: 'utc' }).setZone(locationTimezone)
    } catch (error) {
      throw new Error(`Invalid timezone: ${locationTimezone}. Error: ${error}`)
    }
  }

  /**
   * Convert location's local time to UTC for storage
   */
  toUTC(localTime: Date | string, locationTimezone: string): Date {
    try {
      let dateTime: DateTime

      if (typeof localTime === 'string') {
        // Parse ISO string or date string in location timezone
        dateTime = DateTime.fromISO(localTime, { zone: locationTimezone })
      } else {
        // Treat Date object as being in the location timezone
        dateTime = DateTime.fromJSDate(localTime, { zone: locationTimezone })
      }

      if (!dateTime.isValid) {
        throw new Error(`Invalid date/time: ${localTime}`)
      }

      return dateTime.toUTC().toJSDate()
    } catch (error) {
      throw new Error(`Failed to convert to UTC: ${error}`)
    }
  }

  /**
   * Get timezone display information for a shift
   */
  getShiftDisplay(shift: ShiftTimes): TimezoneShiftDisplay {
    const startLocal = this.toLocationTime(shift.startTime, shift.locationTimezone)
    const endLocal = this.toLocationTime(shift.endTime, shift.locationTimezone)

    // Check if shift crosses midnight in local time
    const isOvernight = endLocal.day !== startLocal.day || endLocal < startLocal

    // Calculate duration in hours
    const durationMs = shift.endTime.getTime() - shift.startTime.getTime()
    const duration = durationMs / (1000 * 60 * 60)

    return {
      localDate: startLocal.toFormat('yyyy-MM-dd'),
      localStartTime: startLocal.toFormat('HH:mm'),
      localEndTime: endLocal.toFormat('HH:mm'),
      localStartDateTime: startLocal.toISO()!,
      localEndDateTime: endLocal.toISO()!,
      duration,
      isOvernight,
      timezone: shift.locationTimezone,
      timezoneAbbreviation: startLocal.toFormat('ZZZZ')
    }
  }

  /**
   * Resolve overnight shift handling
   */
  resolveOvernightShift(startUTC: Date, endUTC: Date, locationTimezone: string): {
    isOvernight: boolean
    duration: number
    localStartDate: string
    localEndDate: string
    crossesMidnight: boolean
  } {
    const startLocal = this.toLocationTime(startUTC, locationTimezone)
    const endLocal = this.toLocationTime(endUTC, locationTimezone)

    const crossesMidnight = endLocal.day !== startLocal.day
    const isOvernight = crossesMidnight || endLocal < startLocal

    // Duration in hours
    const durationMs = endUTC.getTime() - startUTC.getTime()
    const duration = durationMs / (1000 * 60 * 60)

    return {
      isOvernight,
      duration,
      localStartDate: startLocal.toFormat('yyyy-MM-dd'),
      localEndDate: endLocal.toFormat('yyyy-MM-dd'),
      crossesMidnight
    }
  }

  /**
   * Check if a shift falls within staff availability accounting for timezones
   */
  isWithinAvailability(
    shift: ShiftTimes,
    staffAvailability: StaffAvailability[]
  ): {
    isAvailable: boolean
    matchingAvailability?: StaffAvailability[]
    conflicts?: StaffAvailability[]
    details: string
  } {
    const shiftLocal = this.toLocationTime(shift.startTime, shift.locationTimezone)
    const shiftEndLocal = this.toLocationTime(shift.endTime, shift.locationTimezone)
    const shiftDayOfWeek = shiftLocal.weekday % 7 // Convert to Sunday=0 format

    const matchingAvailability: StaffAvailability[] = []
    const conflicts: StaffAvailability[] = []

    for (const availability of staffAvailability) {
      if (availability.isRecurring && availability.dayOfWeek !== null && availability.startTime && availability.endTime) {
        // Handle recurring weekly availability
        if (availability.dayOfWeek === shiftDayOfWeek) {
          const availWindow = this.parseAvailabilityWindow(availability)

          if (availability.isAvailable) {
            if (this.shiftFitsInWindow(shiftLocal, shiftEndLocal, availWindow)) {
              matchingAvailability.push(availability)
            }
          } else {
            // This is unavailability - check for conflicts
            if (this.shiftOverlapsWindow(shiftLocal, shiftEndLocal, availWindow)) {
              conflicts.push(availability)
            }
          }
        }
      } else if (!availability.isRecurring && availability.specificDate) {
        // Handle specific date availability/unavailability
        const specificDateLocal = this.toLocationTime(availability.specificDate, shift.locationTimezone)

        if (this.isSameDay(shiftLocal, specificDateLocal)) {
          if (availability.startDateTime && availability.endDateTime) {
            // Specific time window
            const availStartLocal = this.toLocationTime(availability.startDateTime, shift.locationTimezone)
            const availEndLocal = this.toLocationTime(availability.endDateTime, shift.locationTimezone)

            if (availability.isAvailable) {
              if (this.timeRangesOverlap(shiftLocal, shiftEndLocal, availStartLocal, availEndLocal)) {
                matchingAvailability.push(availability)
              }
            } else {
              if (this.timeRangesOverlap(shiftLocal, shiftEndLocal, availStartLocal, availEndLocal)) {
                conflicts.push(availability)
              }
            }
          } else {
            // All-day availability/unavailability
            if (availability.isAvailable) {
              matchingAvailability.push(availability)
            } else {
              conflicts.push(availability)
            }
          }
        }
      }
    }

    // Determine if shift is available
    const hasConflicts = conflicts.length > 0
    const hasMatchingAvailability = matchingAvailability.length > 0

    let isAvailable: boolean
    let details: string

    if (hasConflicts) {
      isAvailable = false
      details = `Conflicts with unavailability: ${conflicts.map(c => c.notes || 'time-off').join(', ')}`
    } else if (hasMatchingAvailability) {
      isAvailable = true
      details = `Matches availability windows: ${matchingAvailability.length} window(s)`
    } else {
      isAvailable = false
      details = 'No matching availability found for this time slot'
    }

    return {
      isAvailable,
      matchingAvailability: hasMatchingAvailability ? matchingAvailability : undefined,
      conflicts: hasConflicts ? conflicts : undefined,
      details
    }
  }

  /**
   * Parse availability window and handle overnight windows
   */
  private parseAvailabilityWindow(
    availability: StaffAvailability
  ): AvailabilityWindow {
    if (!availability.startTime || !availability.endTime) {
      throw new Error('Availability window missing start or end time')
    }

    const startTime = availability.startTime
    const endTime = availability.endTime
    const isOvernight = endTime < startTime

    return {
      dayOfWeek: availability.dayOfWeek!,
      startTime,
      endTime,
      isOvernight
    }
  }

  /**
   * Check if shift fits entirely within availability window
   */
  private shiftFitsInWindow(
    shiftStart: DateTime,
    shiftEnd: DateTime,
    availWindow: AvailabilityWindow
  ): boolean {
    const shiftStartTime = shiftStart.toFormat('HH:mm')
    const shiftEndTime = shiftEnd.toFormat('HH:mm')

    if (!availWindow.isOvernight) {
      // Normal window (e.g., 09:00 - 17:00)
      return shiftStartTime >= availWindow.startTime && shiftEndTime <= availWindow.endTime
    } else {
      // Overnight window (e.g., 22:00 - 06:00)
      // Shift must either be entirely in evening portion OR entirely in morning portion
      const inEveningPortion = shiftStartTime >= availWindow.startTime && shiftEndTime >= availWindow.startTime
      const inMorningPortion = shiftStartTime <= availWindow.endTime && shiftEndTime <= availWindow.endTime
      const spansFullWindow = shiftStartTime >= availWindow.startTime && shiftEndTime <= availWindow.endTime

      return inEveningPortion || inMorningPortion || spansFullWindow
    }
  }

  /**
   * Check if shift overlaps with availability window
   */
  private shiftOverlapsWindow(
    shiftStart: DateTime,
    shiftEnd: DateTime,
    availWindow: AvailabilityWindow
  ): boolean {
    const shiftStartTime = shiftStart.toFormat('HH:mm')
    const shiftEndTime = shiftEnd.toFormat('HH:mm')

    if (!availWindow.isOvernight) {
      // Normal window overlap check
      return !(shiftEndTime <= availWindow.startTime || shiftStartTime >= availWindow.endTime)
    } else {
      // Overnight window overlap check
      const overlapEvening = !(shiftEndTime <= availWindow.startTime)
      const overlapMorning = !(shiftStartTime >= availWindow.endTime)

      return overlapEvening || overlapMorning
    }
  }

  /**
   * Check if two time ranges overlap
   */
  private timeRangesOverlap(
    start1: DateTime,
    end1: DateTime,
    start2: DateTime,
    end2: DateTime
  ): boolean {
    return start1 < end2 && start2 < end1
  }

  /**
   * Check if two DateTime objects are on the same day
   */
  private isSameDay(date1: DateTime, date2: DateTime): boolean {
    return date1.toFormat('yyyy-MM-dd') === date2.toFormat('yyyy-MM-dd')
  }

  /**
   * Check if two Date objects are on the same day (public method)
   */
  areSameDay(date1: Date, date2: Date): boolean {
    const dt1 = DateTime.fromJSDate(date1)
    const dt2 = DateTime.fromJSDate(date2)
    return this.isSameDay(dt1, dt2)
  }

  /**
   * Calculate shift duration in hours accounting for timezone
   */
  getShiftDurationHours(startTime: Date, endTime: Date, timezone?: string): number {
    if (timezone) {
      const startLocal = this.toLocationTime(startTime, timezone)
      const endLocal = this.toLocationTime(endTime, timezone)
      const durationMs = endLocal.toMillis() - startLocal.toMillis()
      return durationMs / (1000 * 60 * 60)
    } else {
      // Fallback to simple UTC calculation
      const durationMs = endTime.getTime() - startTime.getTime()
      return durationMs / (1000 * 60 * 60)
    }
  }

  /**
   * Get week range (Monday to Sunday) for a given date
   */
  getWeekRange(date: Date): { start: Date; end: Date } {
    const dateTime = DateTime.fromJSDate(date)
    const startOfWeek = dateTime.startOf('week') // Monday
    const endOfWeek = dateTime.endOf('week') // Sunday

    return {
      start: startOfWeek.toJSDate(),
      end: endOfWeek.toJSDate()
    }
  }

  /**
   * Check if two shifts overlap accounting for timezones
   */
  doShiftsOverlap(
    shift1Start: Date,
    shift1End: Date,
    shift1Timezone: string,
    shift2Start: Date,
    shift2End: Date,
    shift2Timezone: string
  ): boolean {
    // Convert all times to UTC for comparison
    const shift1StartUTC = shift1Timezone ?
      this.toUTC(shift1Start, shift1Timezone) : shift1Start
    const shift1EndUTC = shift1Timezone ?
      this.toUTC(shift1End, shift1Timezone) : shift1End
    const shift2StartUTC = shift2Timezone ?
      this.toUTC(shift2Start, shift2Timezone) : shift2Start
    const shift2EndUTC = shift2Timezone ?
      this.toUTC(shift2End, shift2Timezone) : shift2End

    return shift1StartUTC < shift2EndUTC && shift2StartUTC < shift1EndUTC
  }

  /**
   * Get DST transition information for a timezone and year
   */
  getDSTTransitions(timezone: string, year: number): DSTTransition[] {
    try {
      const transitions: DSTTransition[] = []

      // Check January and July to determine standard/daylight time offsets
      const winter = DateTime.fromObject({ year, month: 1, day: 15 }, { zone: timezone })
      const summer = DateTime.fromObject({ year, month: 7, day: 15 }, { zone: timezone })

      if (winter.offset === summer.offset) {
        // No DST in this timezone
        return []
      }

      // Find spring transition (usually March/April)
      for (let month = 3; month <= 4; month++) {
        for (let day = 1; day <= 31; day++) {
          try {
            const date = DateTime.fromObject({ year, month, day }, { zone: timezone })
            const nextDay = date.plus({ days: 1 })

            if (date.offset !== nextDay.offset && date.offset < nextDay.offset) {
              // Spring forward found
              transitions.push({
                date: date.toJSDate(),
                type: 'spring',
                offsetBefore: date.offset,
                offsetAfter: nextDay.offset
              })
              break
            }
          } catch {
            // Invalid date, continue
          }
        }
      }

      // Find fall transition (usually October/November)
      for (let month = 10; month <= 11; month++) {
        for (let day = 1; day <= 31; day++) {
          try {
            const date = DateTime.fromObject({ year, month, day }, { zone: timezone })
            const nextDay = date.plus({ days: 1 })

            if (date.offset !== nextDay.offset && date.offset > nextDay.offset) {
              // Fall back found
              transitions.push({
                date: date.toJSDate(),
                type: 'fall',
                offsetBefore: date.offset,
                offsetAfter: nextDay.offset
              })
              break
            }
          } catch {
            // Invalid date, continue
          }
        }
      }

      return transitions
    } catch (error) {
      throw new Error(`Failed to get DST transitions for ${timezone}: ${error}`)
    }
  }

  /**
   * Adjust recurring availability for DST transitions
   */
  adjustForDST(
    availability: AvailabilityWindow,
    checkDate: Date,
    timezone: string
  ): AvailabilityWindow {
    const year = new Date(checkDate).getFullYear()
    // Get DST transitions to potentially adjust availability windows
    this.getDSTTransitions(timezone, year)

    // For now, return the original availability
    // In a more complex implementation, you might adjust times based on DST rules
    return availability
  }

  /**
   * Create a time in location timezone from date and time strings
   */
  createLocationDateTime(
    dateStr: string, // YYYY-MM-DD
    timeStr: string, // HH:mm
    timezone: string
  ): Date {
    try {
      const dateTime = DateTime.fromFormat(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', {
        zone: timezone
      })

      if (!dateTime.isValid) {
        throw new Error(`Invalid date/time: ${dateStr} ${timeStr}`)
      }

      return dateTime.toUTC().toJSDate()
    } catch (error) {
      throw new Error(`Failed to create location date time: ${error}`)
    }
  }

  /**
   * Format a UTC date for display in location timezone
   */
  formatForLocation(
    utcDate: Date,
    timezone: string,
    formatString: string = 'yyyy-MM-dd HH:mm'
  ): string {
    const localTime = this.toLocationTime(utcDate, timezone)
    return localTime.toFormat(formatString)
  }

  /**
   * Get timezone abbreviation for a date
   */
  getTimezoneAbbreviation(date: Date, timezone: string): string {
    const localTime = this.toLocationTime(date, timezone)
    return localTime.toFormat('ZZZZ')
  }

  /**
   * Validate timezone string
   */
  isValidTimezone(timezone: string): boolean {
    try {
      DateTime.now().setZone(timezone)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get current time in location timezone
   */
  nowInLocation(timezone: string): DateTime {
    return DateTime.now().setZone(timezone)
  }

  /**
   * Calculate business hours for a location on a specific date
   * accounting for DST transitions
   */
  calculateBusinessDay(
    date: Date,
    timezone: string,
    startHour: number = 9,
    endHour: number = 17
  ): {
    startUTC: Date
    endUTC: Date
    duration: number
    isDSTTransitionDay: boolean
    transition?: DSTTransition
  } {
    const localDate = this.toLocationTime(date, timezone)
    const year = localDate.year
    const transitions = this.getDSTTransitions(timezone, year)

    const transitionOnDay = transitions.find(t =>
      this.isSameDay(localDate, DateTime.fromJSDate(t.date).setZone(timezone))
    )

    const startLocal = localDate.set({ hour: startHour, minute: 0, second: 0, millisecond: 0 })
    const endLocal = localDate.set({ hour: endHour, minute: 0, second: 0, millisecond: 0 })

    const startUTC = startLocal.toUTC().toJSDate()
    const endUTC = endLocal.toUTC().toJSDate()

    // Calculate actual duration (may be 23 or 25 hours on DST transition days)
    const durationMs = endUTC.getTime() - startUTC.getTime()
    const duration = durationMs / (1000 * 60 * 60)

    return {
      startUTC,
      endUTC,
      duration,
      isDSTTransitionDay: !!transitionOnDay,
      transition: transitionOnDay
    }
  }
}

// Global timezone service instance
export const timezoneService = new TimezoneService()