import { validateAvailabilityWindow } from '../services/constraints/availabilityConstraint'
import { ConstraintType } from '../types/constraint'
import { createShiftAssignment, createConstraintContext, mockUsers } from './utils/testData'

describe('Availability Window Constraint', () => {
  it('should pass when shift is within recurring availability window', () => {
    // User 1 is available Monday 9:00-17:00
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday
      startTime: new Date('2024-01-15T14:00:00Z'), // 9 AM EST (14:00 UTC)
      endTime: new Date('2024-01-15T18:00:00Z'),   // 1 PM EST (18:00 UTC)
      locationTimezone: 'America/New_York'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    expect(result.valid).toBe(true)
    expect(result.rule).toBe(ConstraintType.AVAILABILITY_WINDOW)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should fail when shift is outside recurring availability window', () => {
    // User 1 is available Monday 9:00-17:00
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday
      startTime: new Date('2024-01-15T23:00:00Z'), // 6 PM EST (23:00 UTC) - outside availability
      endTime: new Date('2024-01-16T03:00:00Z'),   // 10 PM EST (03:00 UTC next day)
      locationTimezone: 'America/New_York'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    expect(result.valid).toBe(false)
    expect(result.rule).toBe(ConstraintType.AVAILABILITY_WINDOW)
    expect(result.message).toContain('is not available')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should fail when shift is on a day with no recurring availability', () => {
    // User 1 only has availability for Monday (dayOfWeek: 1)
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-16'), // Tuesday
      startTime: new Date('2024-01-16T14:00:00Z'),
      endTime: new Date('2024-01-16T18:00:00Z'),
      locationTimezone: 'America/New_York'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    expect(result.valid).toBe(false)
    expect(result.message).toContain('is not available')
  })

  it('should pass with specific date availability that overrides recurring patterns', () => {
    // Add specific availability for user 1 on a Tuesday
    const user = mockUsers.find(u => u.id === 1)!
    user.availability.push({
      id: 99,
      userId: 1,
      dayOfWeek: null,
      startTime: null,
      endTime: null,
      specificDate: new Date('2024-01-16'),
      startDateTime: new Date('2024-01-16T14:00:00Z'),
      endDateTime: new Date('2024-01-16T20:00:00Z'),
      isAvailable: true,
      isRecurring: false,
      notes: 'Special availability',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    })

    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-16'), // Tuesday - normally not available
      startTime: new Date('2024-01-16T15:00:00Z'),
      endTime: new Date('2024-01-16T19:00:00Z'),
      locationTimezone: 'America/New_York'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    expect(result.valid).toBe(true)

    // Clean up
    user.availability.pop()
  })

  it('should fail with specific date unavailability that overrides recurring patterns', () => {
    // Add specific unavailability for user 1 on a Monday
    const user = mockUsers.find(u => u.id === 1)!
    user.availability.push({
      id: 98,
      userId: 1,
      dayOfWeek: null,
      startTime: null,
      endTime: null,
      specificDate: new Date('2024-01-15'),
      startDateTime: null,
      endDateTime: null,
      isAvailable: false,
      isRecurring: false,
      notes: 'Time off request',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    })

    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday - normally available but has time off
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:00:00Z'),
      locationTimezone: 'America/New_York'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    expect(result.valid).toBe(false)
    expect(result.message).toContain('has requested time off')

    // Clean up
    user.availability.pop()
  })

  it('should provide qualified suggestions when user is not available', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 1,
      locationId: 1,
      date: new Date('2024-01-16'), // Tuesday - user 1 not available
      startTime: new Date('2024-01-16T15:00:00Z'),
      endTime: new Date('2024-01-16T19:00:00Z'),
      locationTimezone: 'America/New_York'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    expect(result.valid).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)

    // Suggestions should have the required skill and location certification
    for (const suggestion of result.suggestions) {
      expect(suggestion.userSkills.some(us => us.skill.id === 1)).toBe(true)
      expect(suggestion.locationCertifications.some(lc => lc.locationId === 1)).toBe(true)
    }
  })

  it('should handle shifts that span across availability boundaries', () => {
    // User 1 is available Monday 9:00-17:00
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday
      startTime: new Date('2024-01-15T16:00:00Z'), // 11 AM EST - within availability
      endTime: new Date('2024-01-15T23:00:00Z'),   // 6 PM EST - extends beyond availability
      locationTimezone: 'America/New_York'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    expect(result.valid).toBe(false)
    expect(result.message).toContain('is not available')
  })

  it('should handle different timezones correctly', () => {
    // User 1 is available Monday 9:00-17:00
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday
      startTime: new Date('2024-01-15T17:00:00Z'), // 9 AM PST = 12 PM EST (within EST availability)
      endTime: new Date('2024-01-15T21:00:00Z'),   // 1 PM PST = 4 PM EST (within EST availability)
      locationTimezone: 'America/Los_Angeles'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    // This should fail because the shift is on PST time but user availability is checked against shift location timezone
    // The shift times in PST (9 AM - 1 PM) when converted to the location's timezone would need to match user's availability
    expect(result.valid).toBe(false)
  })

  it('should pass when shift exactly matches availability window', () => {
    // User 1 is available Monday 9:00-17:00
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday
      startTime: new Date('2024-01-15T14:00:00Z'), // 9 AM EST
      endTime: new Date('2024-01-15T22:00:00Z'),   // 5 PM EST
      locationTimezone: 'America/New_York'
    })

    const context = createConstraintContext(assignment)
    const result = validateAvailabilityWindow(context)

    expect(result.valid).toBe(true)
  })
})