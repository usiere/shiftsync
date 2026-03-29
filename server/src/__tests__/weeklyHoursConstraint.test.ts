import { validateWeeklyHours } from '../services/constraints/weeklyHoursConstraint'
import { ConstraintType } from '../types/constraint'
import { createShiftAssignment, createExistingAssignment, createConstraintContext } from './utils/testData'

describe('Weekly Hours Constraint', () => {
  it('should pass when weekly hours are within normal limits', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16'), // Tuesday (same week)
        startTime: new Date('2024-01-16T08:00:00Z'), // 8-hour shift
        endTime: new Date('2024-01-16T16:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(true)
    expect(result.rule).toBe(ConstraintType.WEEKLY_HOURS_LIMIT)
    expect(result.message).toContain('16.0 hours') // 8 + 8 = 16 hours
    expect(result.suggestions).toHaveLength(0)
  })

  it('should return warning when weekly hours exceed 35 but not 40', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    // Create existing assignments for 30 hours (total 38 with new assignment)
    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16'), // Tuesday
        startTime: new Date('2024-01-16T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-16T16:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-17'), // Wednesday
        startTime: new Date('2024-01-17T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-17T16:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-18'), // Thursday
        startTime: new Date('2024-01-18T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-18T16:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 103,
        date: new Date('2024-01-19'), // Friday
        startTime: new Date('2024-01-19T08:00:00Z'), // 6 hours
        endTime: new Date('2024-01-19T14:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('Warning')
    expect(result.message).toContain('38.0 hours')
    expect(result.message).toContain('above the recommended limit')
  })

  it('should fail when weekly hours exceed 40-hour hard limit without override', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    // Create existing assignments for 40 hours (total 48 with new assignment)
    const existingAssignments = Array.from({ length: 5 }, (_, i) =>
      createExistingAssignment(1, {
        id: 100 + i,
        date: new Date(`2024-01-${16 + i}`), // Tue-Sat
        startTime: new Date(`2024-01-${16 + i}T08:00:00Z`), // 8 hours each
        endTime: new Date(`2024-01-${16 + i}T16:00:00Z`)
      })
    )

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(false)
    expect(result.severity).toBe('error')
    expect(result.rule).toBe(ConstraintType.WEEKLY_HOURS_LIMIT)
    expect(result.message).toContain('48.0 hours')
    expect(result.message).toContain('exceeding the 40-hour weekly limit')
    expect(result.message).toContain('Use override flag to allow')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should pass when weekly hours exceed 40 but override flag is set', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = Array.from({ length: 5 }, (_, i) =>
      createExistingAssignment(1, {
        id: 100 + i,
        date: new Date(`2024-01-${16 + i}`),
        startTime: new Date(`2024-01-${16 + i}T08:00:00Z`), // 8 hours each
        endTime: new Date(`2024-01-${16 + i}T16:00:00Z`)
      })
    )

    const context = createConstraintContext(assignment, existingAssignments, {
      allowExcessiveHours: true
    })
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(true)
    expect(result.severity).toBe('error') // Still flagged as error severity but allowed
    expect(result.message).toContain('Override applied')
    expect(result.message).toContain('48.0 hours')
    expect(result.message).toContain('exceeding the hard limit')
  })

  it('should only count assignments within the same week', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'), // Monday week 1
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16'), // Tuesday week 1 (should count)
        startTime: new Date('2024-01-16T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-16T16:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-22'), // Monday week 2 (should not count)
        startTime: new Date('2024-01-22T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-22T16:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-08'), // Monday previous week (should not count)
        startTime: new Date('2024-01-08T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-08T16:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('16.0 hours') // Only count same week: 8 + 8 = 16
  })

  it('should handle assignments for different users correctly', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(2, { // Different user (should not count)
        date: new Date('2024-01-16'),
        startTime: new Date('2024-01-16T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-16T16:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('8.0 hours') // Only count same user
  })

  it('should provide qualified suggestions when limit exceeded', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 1,
      locationId: 1,
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    const existingAssignments = Array.from({ length: 5 }, (_, i) =>
      createExistingAssignment(1, {
        id: 100 + i,
        date: new Date(`2024-01-${16 + i}`),
        startTime: new Date(`2024-01-${16 + i}T08:00:00Z`),
        endTime: new Date(`2024-01-${16 + i}T16:00:00Z`)
      })
    )

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)

    // Suggestions should have proper qualifications and not exceed limits themselves
    for (const suggestion of result.suggestions) {
      expect(suggestion.userSkills.some(us => us.skill.id === 1)).toBe(true)
      expect(suggestion.locationCertifications.some(lc => lc.locationId === 1)).toBe(true)
    }
  })

  it('should handle exactly 40 hours', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'), // 8-hour shift
      endTime: new Date('2024-01-15T22:00:00Z')
    })

    // Create exactly 32 hours of existing assignments (total 40 with new)
    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16'),
        startTime: new Date('2024-01-16T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-16T16:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-17'),
        startTime: new Date('2024-01-17T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-17T16:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-18'),
        startTime: new Date('2024-01-18T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-18T16:00:00Z')
      }),
      createExistingAssignment(1, {
        id: 103,
        date: new Date('2024-01-19'),
        startTime: new Date('2024-01-19T08:00:00Z'), // 8 hours
        endTime: new Date('2024-01-19T16:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('40.0 hours')
    expect(result.message).toContain('above the recommended limit of 35 hours')
  })

  it('should handle fractional hours correctly', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15'),
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:30:00Z') // 4.5-hour shift
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16'),
        startTime: new Date('2024-01-16T08:30:00Z'),
        endTime: new Date('2024-01-16T16:00:00Z') // 7.5-hour shift
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateWeeklyHours(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('12.0 hours') // 4.5 + 7.5 = 12.0
  })
})