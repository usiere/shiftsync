import { validateNoDoubleBooking } from '../services/constraints/doubleBookingConstraint'
import { ConstraintType } from '../types/constraint'
import { createShiftAssignment, createExistingAssignment, createConstraintContext } from './utils/testData'

describe('Double Booking Constraint', () => {
  it('should pass when no overlapping shifts exist', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T13:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateNoDoubleBooking(context)

    expect(result.valid).toBe(true)
    expect(result.rule).toBe(ConstraintType.NO_DOUBLE_BOOKING)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should fail when shifts overlap completely', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateNoDoubleBooking(context)

    expect(result.valid).toBe(false)
    expect(result.rule).toBe(ConstraintType.NO_DOUBLE_BOOKING)
    expect(result.message).toContain('already assigned')
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should fail when shifts overlap partially', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-15T16:00:00Z'),
        endTime: new Date('2024-01-15T20:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateNoDoubleBooking(context)

    expect(result.valid).toBe(false)
    expect(result.rule).toBe(ConstraintType.NO_DOUBLE_BOOKING)
    expect(result.suggestions.length).toBeGreaterThan(0)
  })

  it('should pass when overlapping shifts are for different users', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(2, { // Different user
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateNoDoubleBooking(context)

    expect(result.valid).toBe(true)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should provide qualified suggestions when double booking occurs', () => {
    const assignment = createShiftAssignment(1, {
      skillId: 1, // Bartender skill
      locationId: 1,
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z')
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateNoDoubleBooking(context)

    expect(result.valid).toBe(false)
    expect(result.suggestions.length).toBeGreaterThan(0)

    // Check that suggestions have the required skill and location certification
    const suggestion = result.suggestions[0]
    expect(suggestion.userSkills.some(us => us.skill.id === 1)).toBe(true) // Has bartender skill
    expect(suggestion.locationCertifications.some(lc => lc.locationId === 1)).toBe(true) // Certified for location 1
  })

  it('should handle touching shifts (end time = start time)', () => {
    const assignment = createShiftAssignment(1, {
      startTime: new Date('2024-01-15T14:00:00Z'),
      endTime: new Date('2024-01-15T18:00:00Z')
    })

    const existingAssignments = [
      createExistingAssignment(1, {
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T14:00:00Z') // Ends exactly when new shift starts
      })
    ]

    const context = createConstraintContext(assignment, existingAssignments)
    const result = validateNoDoubleBooking(context)

    expect(result.valid).toBe(true) // Touching shifts should not be considered overlapping
  })
})