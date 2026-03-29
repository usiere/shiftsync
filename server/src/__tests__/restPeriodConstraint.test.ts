import { validateMinimumRestPeriod } from '../services/constraints/restPeriodConstraint'
import { ConstraintType } from '../types/constraint'
import { createShiftAssignment, createExistingAssignment, createConstraintContext } from './utils/testData'

describe('Minimum Rest Period Constraint', () => {
  it('should pass when there is sufficient rest time after previous shift', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T14:00:00Z'), // 2 PM
      endTime: new Date('2024-01-15T18:00:00Z')   // 6 PM
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-14T08:00:00Z'), // Previous day 8 AM
        endTime: new Date('2024-01-14T16:00:00Z')    // Previous day 4 PM (22 hours rest)
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateMinimumRestPeriod(context)

    expect(result.valid).toBe(true)
    expect(result.rule).toBe(ConstraintType.MINIMUM_REST_PERIOD)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should fail when rest period is less than 10 hours after previous shift', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T06:00:00Z'), // 6 AM
      endTime: new Date('2024-01-15T10:00:00Z')   // 10 AM
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-14T16:00:00Z'), // Previous day 4 PM
        endTime: new Date('2024-01-14T22:00:00Z')    // Previous day 10 PM (only 8 hours rest)
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateMinimumRestPeriod(context)

    expect(result.valid).toBe(false)
    expect(result.rule).toBe(ConstraintType.MINIMUM_REST_PERIOD)
    expect(result.message).toContain('8.0 hours rest')
    expect(result.message).toContain('Minimum required: 10 hours')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should fail when rest period is less than 10 hours before next shift', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T14:00:00Z'), // 2 PM
      endTime: new Date('2024-01-15T22:00:00Z')   // 10 PM
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-16T06:00:00Z'), // Next day 6 AM (only 8 hours rest)
        endTime: new Date('2024-01-16T14:00:00Z')    // Next day 2 PM
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateMinimumRestPeriod(context)

    expect(result.valid).toBe(false)
    expect(result.rule).toBe(ConstraintType.MINIMUM_REST_PERIOD)
    expect(result.message).toContain('8.0 hours rest')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should pass when exactly 10 hours rest', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T06:00:00Z'), // 6 AM
      endTime: new Date('2024-01-15T10:00:00Z')   // 10 AM
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-14T14:00:00Z'), // Previous day 2 PM
        endTime: new Date('2024-01-14T20:00:00Z')    // Previous day 8 PM (exactly 10 hours rest)
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateMinimumRestPeriod(context)

    expect(result.valid).toBe(true)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should pass when no existing assignments', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const context = createConstraintContext(assignment, [])
    const result = validateMinimumRestPeriod(context)

    expect(result.valid).toBe(true)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should pass when existing assignments are for different users', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T06:00:00Z'),
      endTime: new Date('2024-01-15T10:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(2, { // Different user
        startTime: new Date('2024-01-14T20:00:00Z'),
        endTime: new Date('2024-01-15T02:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateMinimumRestPeriod(context)

    expect(result.valid).toBe(true)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should handle fractional hours correctly', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T05:30:00Z'), // 5:30 AM
      endTime: new Date('2024-01-15T09:30:00Z')   // 9:30 AM
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-14T16:00:00Z'), // Previous day 4 PM
        endTime: new Date('2024-01-14T19:00:00Z')    // Previous day 7 PM (10.5 hours rest)
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateMinimumRestPeriod(context)

    expect(result.valid).toBe(true)
  })

  it('should provide qualified suggestions when rest period is insufficient', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 1, // Bartender skill
      locationId: 1,
      startTime: new Date('2024-01-15T06:00:00Z'),
      endTime: new Date('2024-01-15T10:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-14T20:00:00Z'),
        endTime: new Date('2024-01-15T02:00:00Z') // Only 4 hours rest
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateMinimumRestPeriod(context)

    expect(result.valid).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)

    // Check that suggestions have the required qualifications
    const suggestion = result.suggestions[0]
    expect(suggestion.userSkills.some(us => us.skill.id === 1)).toBe(true)
    expect(suggestion.locationCertifications.some(lc => lc.locationId === 1)).toBe(true)
  })
})