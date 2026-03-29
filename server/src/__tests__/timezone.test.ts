import { describe, test, expect, beforeAll } from '@jest/globals'
import { TimezoneService, ShiftTimes, StaffAvailability } from '../services/timezoneService'

describe('TimezoneService', () => {
  let timezoneService: TimezoneService

  beforeAll(() => {
    timezoneService = new TimezoneService()
  })

  describe('UTC/Local Time Conversion', () => {
    test('should convert UTC to location time', () => {
      const utcTime = new Date('2024-03-15T14:00:00Z')
      const eastern = timezoneService.toLocationTime(utcTime, 'America/New_York')
      const pacific = timezoneService.toLocationTime(utcTime, 'America/Los_Angeles')

      // EDT is UTC-4, PDT is UTC-7 in March
      expect(eastern.hour).toBe(10) // 14:00 UTC - 4 hours = 10:00 EDT
      expect(pacific.hour).toBe(7)  // 14:00 UTC - 7 hours = 07:00 PDT
    })

    test('should convert local time to UTC', () => {
      // 2:00 PM Eastern Time on March 15, 2024 - use ISO string with timezone
      const localTimeString = '2024-03-15T14:00:00'
      const utcTime = timezoneService.toUTC(localTimeString, 'America/New_York')

      // EDT is UTC-4, so 2:00 PM EDT = 6:00 PM UTC
      expect(utcTime.getUTCHours()).toBe(18)
    })

    test('should handle DST transitions correctly', () => {
      // Spring forward: March 10, 2024 in US
      const beforeDST = new Date('2024-03-10T06:00:00Z') // 1:00 AM EST
      const afterDST = new Date('2024-03-10T07:00:00Z')  // 3:00 AM EDT (2:00 AM skipped)

      const beforeLocal = timezoneService.toLocationTime(beforeDST, 'America/New_York')
      const afterLocal = timezoneService.toLocationTime(afterDST, 'America/New_York')

      expect(beforeLocal.hour).toBe(1) // 1:00 AM EST
      expect(afterLocal.hour).toBe(3)  // 3:00 AM EDT
    })
  })

  describe('Shift Display Information', () => {
    test('should generate correct display information for regular shift', () => {
      const shift: ShiftTimes = {
        id: 1,
        date: new Date('2024-03-15'),
        startTime: new Date('2024-03-15T14:00:00Z'),
        endTime: new Date('2024-03-15T22:00:00Z'),
        locationTimezone: 'America/New_York'
      }

      const display = timezoneService.getShiftDisplay(shift)

      expect(display.localDate).toBe('2024-03-15')
      expect(display.localStartTime).toBe('10:00')
      expect(display.localEndTime).toBe('18:00')
      expect(display.duration).toBe(8)
      expect(display.isOvernight).toBe(false)
      expect(display.timezone).toBe('America/New_York')
    })

    test('should handle overnight shifts correctly', () => {
      const shift: ShiftTimes = {
        id: 2,
        date: new Date('2024-03-15'),
        startTime: new Date('2024-03-16T02:00:00Z'), // 10:00 PM EST on 15th
        endTime: new Date('2024-03-16T10:00:00Z'),   // 06:00 AM EST on 16th
        locationTimezone: 'America/New_York'
      }

      const display = timezoneService.getShiftDisplay(shift)

      expect(display.localStartTime).toBe('22:00')
      expect(display.localEndTime).toBe('06:00')
      expect(display.duration).toBe(8)
      expect(display.isOvernight).toBe(true)
    })

    test('should calculate overnight shift duration correctly', () => {
      const startUTC = new Date('2024-03-16T02:00:00Z') // 10:00 PM EST
      const endUTC = new Date('2024-03-16T10:00:00Z')   // 06:00 AM EST

      const resolved = timezoneService.resolveOvernightShift(
        startUTC,
        endUTC,
        'America/New_York'
      )

      expect(resolved.isOvernight).toBe(true)
      expect(resolved.duration).toBe(8)
      expect(resolved.crossesMidnight).toBe(true)
      expect(resolved.localStartDate).toBe('2024-03-15')
      expect(resolved.localEndDate).toBe('2024-03-16')
    })
  })

  describe('Staff Availability Checking', () => {
    const shift: ShiftTimes = {
      id: 1,
      date: new Date('2024-03-15'), // Friday
      startTime: new Date('2024-03-15T14:00:00Z'), // 10:00 AM EST
      endTime: new Date('2024-03-15T22:00:00Z'),   // 06:00 PM EST
      locationTimezone: 'America/New_York'
    }

    test('should match recurring availability', () => {
      const availability: StaffAvailability[] = [
        {
          id: 1,
          userId: 1,
          dayOfWeek: 5, // Friday
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
          isRecurring: true
        }
      ]

      const result = timezoneService.isWithinAvailability(shift, availability)

      expect(result.isAvailable).toBe(true)
      expect(result.matchingAvailability).toHaveLength(1)
      expect(result.details).toContain('Matches availability')
    })

    test('should detect availability conflicts', () => {
      const availability: StaffAvailability[] = [
        {
          id: 1,
          userId: 1,
          dayOfWeek: 5, // Friday
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
          isRecurring: true
        },
        {
          id: 2,
          userId: 1,
          specificDate: new Date('2024-03-15'),
          startDateTime: new Date('2024-03-15T16:00:00Z'), // 12:00 PM EST
          endDateTime: new Date('2024-03-15T20:00:00Z'),   // 04:00 PM EST
          isAvailable: false, // Time off
          isRecurring: false,
          notes: 'Doctor appointment'
        }
      ]

      const result = timezoneService.isWithinAvailability(shift, availability)

      expect(result.isAvailable).toBe(false)
      expect(result.conflicts).toHaveLength(1)
      expect(result.details).toContain('Conflicts with unavailability')
    })

    test('should handle overnight availability windows', () => {
      const overnightShift: ShiftTimes = {
        id: 2,
        date: new Date('2024-03-16'),
        startTime: new Date('2024-03-16T02:00:00Z'), // 10:00 PM EST on 15th
        endTime: new Date('2024-03-16T06:00:00Z'),   // 02:00 AM EST on 16th
        locationTimezone: 'America/New_York'
      }

      const overnightAvailability: StaffAvailability[] = [
        {
          id: 1,
          userId: 1,
          dayOfWeek: 5, // Friday (shift starts Friday night)
          startTime: '22:00',
          endTime: '06:00', // Overnight window
          isAvailable: true,
          isRecurring: true
        }
      ]

      const result = timezoneService.isWithinAvailability(overnightShift, overnightAvailability)

      expect(result.isAvailable).toBe(true)
      expect(result.matchingAvailability).toHaveLength(1)
    })

    test('should handle staff not available case', () => {
      const availability: StaffAvailability[] = [
        {
          id: 1,
          userId: 1,
          dayOfWeek: 1, // Monday (shift is on Friday)
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
          isRecurring: true
        }
      ]

      const result = timezoneService.isWithinAvailability(shift, availability)

      expect(result.isAvailable).toBe(false)
      expect(result.details).toContain('No matching availability found')
    })
  })

  describe('DST Transitions', () => {
    test('should detect DST transitions for US timezones', () => {
      const transitions = timezoneService.getDSTTransitions('America/New_York', 2024)

      expect(transitions).toHaveLength(2)

      // Spring transition (second Sunday in March)
      const spring = transitions.find(t => t.type === 'spring')
      expect(spring).toBeDefined()
      expect(spring!.date.getMonth()).toBe(2) // March (0-indexed)

      // Fall transition (first Sunday in November)
      const fall = transitions.find(t => t.type === 'fall')
      expect(fall).toBeDefined()
      expect(fall!.date.getMonth()).toBe(10) // November (0-indexed)
    })

    test('should handle timezones without DST', () => {
      const transitions = timezoneService.getDSTTransitions('UTC', 2024)
      expect(transitions).toHaveLength(0)

      const arizonaTransitions = timezoneService.getDSTTransitions('America/Phoenix', 2024)
      expect(arizonaTransitions).toHaveLength(0)
    })
  })

  describe('Timezone Validation', () => {
    test('should validate correct timezone strings', () => {
      expect(timezoneService.isValidTimezone('America/New_York')).toBe(true)
      expect(timezoneService.isValidTimezone('Europe/London')).toBe(true)
      expect(timezoneService.isValidTimezone('Asia/Tokyo')).toBe(true)
      expect(timezoneService.isValidTimezone('UTC')).toBe(true)
    })

    test('should reject invalid timezone strings', () => {
      expect(timezoneService.isValidTimezone('Invalid/Timezone')).toBe(false)
      expect(timezoneService.isValidTimezone('EST')).toBe(false) // Abbreviations not supported
      expect(timezoneService.isValidTimezone('')).toBe(false)
    })
  })

  describe('Business Day Calculations', () => {
    test('should calculate normal business day', () => {
      const normalDay = new Date('2024-06-15') // Standard time
      const businessDay = timezoneService.calculateBusinessDay(
        normalDay,
        'America/New_York',
        9,
        17
      )

      expect(businessDay.duration).toBe(8)
      expect(businessDay.isDSTTransitionDay).toBe(false)
    })

    test('should handle DST spring transition day', () => {
      const springTransition = new Date('2024-03-10') // Spring forward day
      const businessDay = timezoneService.calculateBusinessDay(
        springTransition,
        'America/New_York',
        9,
        17
      )

      // Day is shorter due to spring forward
      expect(businessDay.duration).toBe(7)
      expect(businessDay.isDSTTransitionDay).toBe(true)
      expect(businessDay.transition?.type).toBe('spring')
    })

    test('should handle DST fall transition day', () => {
      const fallTransition = new Date('2024-11-03') // Fall back day
      const businessDay = timezoneService.calculateBusinessDay(
        fallTransition,
        'America/New_York',
        9,
        17
      )

      // Day is longer due to fall back
      expect(businessDay.duration).toBe(9)
      expect(businessDay.isDSTTransitionDay).toBe(true)
      expect(businessDay.transition?.type).toBe('fall')
    })
  })

  describe('Datetime Creation and Formatting', () => {
    test('should create location datetime correctly', () => {
      const utcDate = timezoneService.createLocationDateTime(
        '2024-03-15',
        '14:30',
        'America/New_York'
      )

      // 14:30 EST = 18:30 UTC (during DST, EDT is UTC-4)
      expect(utcDate.getUTCHours()).toBe(18)
      expect(utcDate.getUTCMinutes()).toBe(30)
    })

    test('should format UTC date for location display', () => {
      const utcDate = new Date('2024-03-15T18:30:00Z')
      const formatted = timezoneService.formatForLocation(
        utcDate,
        'America/New_York',
        'yyyy-MM-dd HH:mm'
      )

      expect(formatted).toBe('2024-03-15 14:30') // EDT is UTC-4
    })

    test('should get timezone abbreviation', () => {
      const summerDate = new Date('2024-07-15T12:00:00Z')
      const winterDate = new Date('2024-01-15T12:00:00Z')

      const summerAbbr = timezoneService.getTimezoneAbbreviation(summerDate, 'America/New_York')
      const winterAbbr = timezoneService.getTimezoneAbbreviation(winterDate, 'America/New_York')

      expect(summerAbbr).toBe('EDT')
      expect(winterAbbr).toBe('EST')
    })
  })

  describe('Edge Cases', () => {
    test('should handle shifts that span DST transition', () => {
      // Shift that starts before spring forward and ends after
      const startTime = new Date('2024-03-10T06:00:00Z') // 1:00 AM EST
      const endTime = new Date('2024-03-10T08:00:00Z')   // 4:00 AM EDT (3 actual hours)

      const resolved = timezoneService.resolveOvernightShift(
        startTime,
        endTime,
        'America/New_York'
      )

      expect(resolved.duration).toBe(2) // Only 2 hours due to DST spring forward
    })

    test('should handle availability check across timezone boundaries', () => {
      // Shift in New York during a time when staff is in London
      const nyShift: ShiftTimes = {
        id: 1,
        date: new Date('2024-03-15'),
        startTime: new Date('2024-03-15T14:00:00Z'),
        endTime: new Date('2024-03-15T22:00:00Z'),
        locationTimezone: 'America/New_York'
      }

      // Staff availability in London timezone
      const londonAvailability: StaffAvailability[] = [
        {
          id: 1,
          userId: 1,
          dayOfWeek: 5, // Friday
          startTime: '15:00', // 3:00 PM London time
          endTime: '23:00',   // 11:00 PM London time
          isAvailable: true,
          isRecurring: true
        }
      ]

      const result = timezoneService.isWithinAvailability(nyShift, londonAvailability)

      // This should work because the service converts everything to the shift's location timezone
      expect(result.isAvailable).toBe(true)
    })

    test('should handle invalid dates gracefully', () => {
      expect(() => {
        timezoneService.toUTC('invalid-date', 'America/New_York')
      }).toThrow()

      expect(() => {
        timezoneService.createLocationDateTime('2024-02-30', '14:00', 'America/New_York')
      }).toThrow()
    })
  })
})