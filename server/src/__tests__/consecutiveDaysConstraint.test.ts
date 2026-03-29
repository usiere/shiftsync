import { validateConsecutiveDays } from '../services/constraints/consecutiveDaysConstraint'
import { ConstraintType } from '../types/constraint'
import { createShiftAssignment, createExistingAssignment, createConstraintContext } from './utils/testData'

describe('Consecutive Days Constraint', () => {
  it('should pass when consecutive days are within limits', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15') // Monday
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16') // Tuesday
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-17') // Wednesday
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    expect(result.rule).toBe(ConstraintType.CONSECUTIVE_DAYS_LIMIT)
    expect(result.message).toContain('3 days') // Mon, Tue, Wed = 3 consecutive days
    expect(result.suggestions).toHaveLength(0)
  })

  it('should return warning at 6 consecutive days', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15') // Monday
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16') // Tuesday
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-17') // Wednesday
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-18') // Thursday
      }),
      createExistingAssignment(1, {
        id: 103,
        date: new Date('2024-01-19') // Friday
      }),
      createExistingAssignment(1, {
        id: 104,
        date: new Date('2024-01-20') // Saturday
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    expect(result.severity).toBe('warning')
    expect(result.message).toContain('Warning')
    expect(result.message).toContain('6 consecutive days')
  })

  it('should fail at 7 consecutive days without override', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15') // Monday
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16') // Tuesday
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-17') // Wednesday
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-18') // Thursday
      }),
      createExistingAssignment(1, {
        id: 103,
        date: new Date('2024-01-19') // Friday
      }),
      createExistingAssignment(1, {
        id: 104,
        date: new Date('2024-01-20') // Saturday
      }),
      createExistingAssignment(1, {
        id: 105,
        date: new Date('2024-01-21') // Sunday
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(false)
    expect(result.severity).toBe('error')
    expect(result.rule).toBe(ConstraintType.CONSECUTIVE_DAYS_LIMIT)
    expect(result.message).toContain('7 consecutive days')
    expect(result.message).toContain('reaching the 7-day limit')
    expect(result.message).toContain('Use override flag to allow')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should pass at 7 consecutive days with override flag', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-16')
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-17')
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-18')
      }),
      createExistingAssignment(1, {
        id: 103,
        date: new Date('2024-01-19')
      }),
      createExistingAssignment(1, {
        id: 104,
        date: new Date('2024-01-20')
      }),
      createExistingAssignment(1, {
        id: 105,
        date: new Date('2024-01-21')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments, {
      allowConsecutiveDays: true
    })
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    expect(result.severity).toBe('error') // Still flagged as error but allowed
    expect(result.message).toContain('Override applied')
    expect(result.message).toContain('7 consecutive days')
    expect(result.message).toContain('exceeding the limit')
  })

  it('should handle non-consecutive days correctly', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15') // Monday
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-17') // Wednesday (skipped Tuesday)
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-18') // Thursday
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-20') // Saturday (skipped Friday)
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    // Should only count the longest consecutive sequence
    expect(result.message).toContain('2 days') // Wed-Thu is longest sequence (2 days)
  })

  it('should count consecutive days including the proposed shift', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-17') // Wednesday - in the middle
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15') // Monday
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-16') // Tuesday
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-18') // Thursday
      }),
      createExistingAssignment(1, {
        id: 103,
        date: new Date('2024-01-19') // Friday
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('5 consecutive days') // Mon-Fri including proposed Wed
  })

  it('should handle assignments for different users correctly', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15')
    })

    const existingAssignments = [
      createExistingAssignment(2, { // Different user (should not count)
        date: new Date('2024-01-16')
      }),
      createExistingAssignment(2, {
        id: 101,
        date: new Date('2024-01-17')
      }),
      createExistingAssignment(1, { // Same user
        id: 102,
        date: new Date('2024-01-16')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('2 consecutive days') // Only count same user: Mon-Tue
  })

  it('should handle duplicate dates correctly', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-15')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15') // Same date as proposed (should deduplicate)
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-16')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('2 consecutive days') // Mon-Tue (deduplicated)
  })

  it('should provide qualified suggestions when limit exceeded', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 1,
      locationId: 1,
      date: new Date('2024-01-15')
    })

    // Create 6 consecutive days to trigger limit
    const existingAssignments = Array.from({ length: 6 }, (_, i) =>
      createExistingAssignment(1, {
        id: 100 + i,
        date: new Date(`2024-01-${16 + i}`) // Tue-Sun
      })
    )

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)

    // Suggestions should have proper qualifications and not exceed consecutive days limits
    for (const suggestion of result.suggestions) {
      expect(suggestion.userSkills.some(us => us.skill.id === 1)).toBe(true)
      expect(suggestion.locationCertifications.some(lc => lc.locationId === 1)).toBe(true)
    }
  })

  it('should handle sequence that starts before proposed date', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-18') // Thursday
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        date: new Date('2024-01-15') // Monday
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-16') // Tuesday
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-17') // Wednesday
      })
      // Thursday is the proposed shift
      // No Friday assignment - sequence ends
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('4 consecutive days') // Mon-Thu
  })

  it('should handle sequence that continues after proposed date', () => {
    const assignment = createShiftAssignment(1, {
      date: new Date('2024-01-17') // Wednesday
    })

    const existingAssignments = [
      // No assignments before Wednesday
      createExistingAssignment(1, {
        date: new Date('2024-01-18') // Thursday
      }),
      createExistingAssignment(1, {
        id: 101,
        date: new Date('2024-01-19') // Friday
      }),
      createExistingAssignment(1, {
        id: 102,
        date: new Date('2024-01-20') // Saturday
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateConsecutiveDays(context)

    expect(result.valid).toBe(true)
    expect(result.message).toContain('4 consecutive days') // Wed-Sat
  })
})