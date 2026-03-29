import { validateDailyHours } from '../services/constraints/dailyHoursConstraint'
import { ConstraintType } from '../types/constraint'
import { createShiftAssignment, createExistingAssignment, createConstraintContext } from './utils/testData'

describe('Daily Hours Constraint', () => {
  it('should pass when daily hours are within normal limits', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 4-hour shift
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T08:00:00Z'), // 3-hour shift same day
        endTime: new Date('2024-01-15T11:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(true)
    expect(result.rule).toBe(ConstraintType.DAILY_HOURS_LIMIT)
    expect(result.message).toContain('7.0 hours') // 4 + 3 = 7 hours
    expect(result.suggestions).toHaveLength(0)
  })

  it('should return warning when daily hours exceed 8 but not 12', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 6-hour shift
      endTime: new Date('2024-01-15T20:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T08:00:00Z'), // 4-hour shift same day
        endTime: new Date('2024-01-15T12:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('Warning')
    expect(result.message).toContain('10.0 hours') // 6 + 4 = 10 hours
    expect(result.message).toContain('exceeding the 8-hour recommended')
  })

  it('should fail when daily hours exceed 12-hour hard limit', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T08:00:00Z'), // 6-hour shift same day
        endTime: new Date('2024-01-15T14:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(false)
    expect(result.severity).toBe('error')
    expect(result.rule).toBe(ConstraintType.DAILY_HOURS_LIMIT)
    expect(result.message).toContain('14.0 hours') // 8 + 6 = 14 hours
    expect(result.message).toContain('exceeding the 12-hour daily limit')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should pass when exactly at 12-hour limit', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 4-hour shift
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T06:00:00Z'), // 8-hour shift same day
        endTime: new Date('2024-01-15T14:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('12.0 hours')
  })

  it('should pass when assignments are on different days', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-14'), // Different day
        startTime: new Date('2024-01-14T08:00:00Z'), // 8-hour shift
        endTime: new Date('2024-01-14T16:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('8.0 hours') // Only count same-day hours
  })

  it('should handle assignments for different users correctly', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(2, { // Different user
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T08:00:00Z'), // 8-hour shift same day
        endTime: new Date('2024-01-15T16:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('8.0 hours') // Only count same-user hours
  })

  it('should provide qualified suggestions when limit exceeded', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 1,
      locationId: 1,
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T06:00:00Z'), // 8-hour shift (total 16 hours)
        endTime: new Date('2024-01-15T14:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)

    // Suggestions should not exceed daily limits themselves
    for (const suggestion of result.suggestions) {
      // Check that suggested users have proper qualifications
      expect(suggestion.userSkills.some(us => us.skill.id === 1)).toBe(true)
      expect(suggestion.locationCertifications.some(lc => lc.locationId === 1)).toBe(true)
    }
  })

  it('should handle fractional hours correctly', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:30:00Z') // 4.5-hour shift
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T08:30:00Z'),
        endTime: new Date('2024-01-15T12:00:00Z') // 3.5-hour shift
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('8.0 hours') // 4.5 + 3.5 = 8.0 hours exactly
    expect(result.severity).toBe('warning') // Exactly at warning threshold
  })

  it('should handle multiple shifts on same day', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T20:00:00Z'), // 2-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T08:00:00Z'), // 4-hour shift
        endTime: new Date('2024-01-15T12:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00Z'), // 4-hour shift
        endTime: new Date('2024-01-15T18:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateDailyHours(context)

    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('10.0 hours') // 2 + 4 + 4 = 10 hours
  })
})