import { format, parseISO } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from 'date-fns-tz'

export class TimezoneUtils {
  /**
   * Format a time string in the specified timezone
   * @param timeString - Time in HH:mm:ss format or ISO string
   * @param timezone - Target timezone (e.g., 'America/New_York')
   * @param formatString - date-fns format string (default: 'h:mm a')
   */
  static formatTimeInTimezone(
    timeString: string,
    timezone: string,
    formatString: string = 'h:mm a'
  ): string {
    try {
      let date: Date

      if (timeString.includes('T')) {
        // ISO string
        date = parseISO(timeString)
      } else if (timeString.includes(':')) {
        // Time string like "14:30:00"
        const today = new Date()
        const [hours, minutes, seconds = '0'] = timeString.split(':').map(Number)
        date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, parseInt(seconds.toString()))
      } else {
        throw new Error('Invalid time format')
      }

      // Convert to target timezone
      const zonedDate = utcToZonedTime(date, timezone)
      return formatTz(zonedDate, formatString, { timeZone: timezone })
    } catch (error) {
      console.error('Error formatting time in timezone:', error)
      return timeString
    }
  }

  /**
   * Format a date string in the specified timezone
   * @param dateString - ISO date string
   * @param timezone - Target timezone
   * @param formatString - date-fns format string (default: 'MMM d, yyyy')
   */
  static formatDateInTimezone(
    dateString: string,
    timezone: string,
    formatString: string = 'MMM d, yyyy'
  ): string {
    try {
      const date = parseISO(dateString)
      const zonedDate = utcToZonedTime(date, timezone)
      return formatTz(zonedDate, formatString, { timeZone: timezone })
    } catch (error) {
      console.error('Error formatting date in timezone:', error)
      return dateString
    }
  }

  /**
   * Format a full datetime string in the specified timezone
   * @param datetimeString - ISO datetime string
   * @param timezone - Target timezone
   * @param formatString - date-fns format string (default: 'MMM d, yyyy h:mm a')
   */
  static formatDateTimeInTimezone(
    datetimeString: string,
    timezone: string,
    formatString: string = 'MMM d, yyyy h:mm a'
  ): string {
    try {
      const date = parseISO(datetimeString)
      const zonedDate = utcToZonedTime(date, timezone)
      return formatTz(zonedDate, formatString, { timeZone: timezone })
    } catch (error) {
      console.error('Error formatting datetime in timezone:', error)
      return datetimeString
    }
  }

  /**
   * Format shift time range in location timezone
   * @param startTime - Start time string
   * @param endTime - End time string
   * @param timezone - Location timezone
   * @param dateString - Optional date string for context
   */
  static formatShiftTimeRange(
    startTime: string,
    endTime: string,
    timezone: string,
    dateString?: string
  ): string {
    try {
      const baseDate = dateString ? parseISO(dateString) : new Date()

      // Create full datetime strings for start and end
      let startDateTime: Date
      let endDateTime: Date

      if (startTime.includes('T')) {
        startDateTime = parseISO(startTime)
      } else {
        const [startHour, startMin, startSec = '0'] = startTime.split(':').map(Number)
        startDateTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), startHour, startMin, parseInt(startSec.toString()))
      }

      if (endTime.includes('T')) {
        endDateTime = parseISO(endTime)
      } else {
        const [endHour, endMin, endSec = '0'] = endTime.split(':').map(Number)
        endDateTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), endHour, endMin, parseInt(endSec.toString()))

        // Handle overnight shifts (end time is next day)
        if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1)
        }
      }

      // Convert to timezone
      const startZoned = utcToZonedTime(startDateTime, timezone)
      const endZoned = utcToZonedTime(endDateTime, timezone)

      const startFormatted = formatTz(startZoned, 'h:mm a', { timeZone: timezone })
      const endFormatted = formatTz(endZoned, 'h:mm a', { timeZone: timezone })

      return `${startFormatted} - ${endFormatted}`
    } catch (error) {
      console.error('Error formatting shift time range:', error)
      return `${startTime} - ${endTime}`
    }
  }

  /**
   * Get timezone abbreviation
   * @param timezone - Timezone identifier
   * @param date - Date for context (for DST handling)
   */
  static getTimezoneAbbreviation(timezone: string, date?: Date): string {
    try {
      const targetDate = date || new Date()
      const zonedDate = utcToZonedTime(targetDate, timezone)

      // Get the timezone abbreviation
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'short'
      })

      const parts = formatter.formatToParts(zonedDate)
      const timeZoneName = parts.find(part => part.type === 'timeZoneName')

      return timeZoneName?.value || timezone
    } catch (error) {
      console.error('Error getting timezone abbreviation:', error)
      return timezone
    }
  }

  /**
   * Convert user's local time to UTC for API calls
   * @param localTimeString - Time in user's local timezone
   * @param userTimezone - User's timezone
   */
  static convertToUTC(localTimeString: string, userTimezone: string): Date {
    try {
      const localDate = parseISO(localTimeString)
      return zonedTimeToUtc(localDate, userTimezone)
    } catch (error) {
      console.error('Error converting to UTC:', error)
      return new Date()
    }
  }

  /**
   * Check if timezone supports DST
   * @param timezone - Timezone identifier
   */
  static supportsDST(timezone: string): boolean {
    const january = new Date(2024, 0, 1)
    const july = new Date(2024, 6, 1)

    const janOffset = this.getTimezoneOffset(timezone, january)
    const julOffset = this.getTimezoneOffset(timezone, july)

    return janOffset !== julOffset
  }

  private static getTimezoneOffset(timezone: string, date: Date): number {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const zonedDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    return utcDate.getTime() - zonedDate.getTime()
  }

  /**
   * Format relative time (e.g., "2 hours ago", "in 30 minutes")
   * @param dateString - ISO date string
   * @param timezone - Target timezone
   */
  static formatRelativeTime(dateString: string, timezone: string): string {
    try {
      const date = parseISO(dateString)
      const now = new Date()
      const zonedDate = utcToZonedTime(date, timezone)
      const zonedNow = utcToZonedTime(now, timezone)

      const diffMs = zonedDate.getTime() - zonedNow.getTime()
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (Math.abs(diffDays) >= 1) {
        return formatTz(zonedDate, 'MMM d', { timeZone: timezone })
      } else if (Math.abs(diffHours) >= 1) {
        return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`
      } else if (Math.abs(diffMinutes) >= 1) {
        return diffMinutes > 0 ? `in ${diffMinutes}m` : `${Math.abs(diffMinutes)}m ago`
      } else {
        return 'now'
      }
    } catch (error) {
      console.error('Error formatting relative time:', error)
      return 'unknown'
    }
  }
}