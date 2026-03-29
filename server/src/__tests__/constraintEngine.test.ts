import { ConstraintEngine } from '../services/ConstraintEngine'
import { ConstraintType } from '../types/constraint'
import { createShiftAssignment, createExistingAssignment, createConstraintContext } from './utils/testData'

describe('ConstraintEngine', () => {
  let engine: ConstraintEngine

  beforeEach(() => {
    engine = new ConstraintEngine()
  })

  describe('validateAssignment', () => {
    it('should return valid result when all constraints pass', () => {
      const assignment = createShiftAssignment(1, {
        skillId: 1,
        locationId: 1,
        date: new Date('2024-01-15'), // Monday
        startTime: new Date('2024-01-15T14:00:00Z'), // Within availability
        endTime: new Date('2024-01-15T18:00:00Z')
      })

      const context = createConstraintContext(assignment, [])
      const result = engine.validateAssignment(context)

      expect(result.isValid).toBe(true)
      expect(result.violations).toHaveLength(0)
      expect(result.allResults).toHaveLength(8) // All 8 constraints
    })

    it('should return violations when constraints fail', () => {
      const assignment = createShiftAssignment(1, {
        skillId: 999, // Non-existent skill
        locationId: 999, // Non-certified location
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z')
      })

      const context = createConstraintContext(assignment, [])
      const result = engine.validateAssignment(context)

      expect(result.isValid).toBe(false)
      expect(result.violations.length).toBeGreaterThan(0)

      // Should have skill requirement and location certification violations
      const violationRules = result.violations.map(v => v.rule)
      expect(violationRules).toContain(ConstraintType.SKILL_REQUIREMENT)
      expect(violationRules).toContain(ConstraintType.LOCATION_CERTIFICATION)
    })

    it('should separate warnings from violations', () => {
      const assignment = createShiftAssignment(1, {
        skillId: 1,
        locationId: 1,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00Z'), // 6-hour shift
        endTime: new Date('2024-01-15T20:00:00Z')
      })

      const existingAssignments = [
        createExistingAssignment(1, {
          date: new Date('2024-01-15'),
          startTime: new Date('2024-01-15T08:00:00Z'), // 4-hour shift (total 10 hours > 8 warning threshold)
          endTime: new Date('2024-01-15T12:00:00Z')
        })
      ]

      const context = createConstraintContext(assignment, existingAssignments)
      const result = engine.validateAssignment(context)

      expect(result.isValid).toBe(true) // No hard violations
      expect(result.violations).toHaveLength(0)
      expect(result.warnings.length).toBeGreaterThan(0)

      const warningRule = result.warnings.find(w => w.rule === ConstraintType.DAILY_HOURS_LIMIT)
      expect(warningRule).toBeDefined()
      expect(warningRule?.severity).toBe('warning')
    })
  })

  describe('validateConstraint', () => {
    it('should validate a specific constraint', () => {
      const assignment = createShiftAssignment(1, {
        skillId: 1,
        locationId: 1
      })

      const context = createConstraintContext(assignment, [])
      const result = engine.validateConstraint(ConstraintType.SKILL_REQUIREMENT, context)

      expect(result.valid).toBe(true)
      expect(result.rule).toBe(ConstraintType.SKILL_REQUIREMENT)
    })

    it('should throw error for unknown constraint type', () => {
      const assignment = createShiftAssignment(1)
      const context = createConstraintContext(assignment, [])

      expect(() => {
        engine.validateConstraint('UNKNOWN_CONSTRAINT' as ConstraintType, context)
      }).toThrow('Unknown constraint type')
    })
  })

  describe('validateCriticalConstraints', () => {
    it('should only validate critical constraints', () => {
      const assignment = createShiftAssignment(1, {
        skillId: 1,
        locationId: 1,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T20:00:00Z')
      })

      // Add many hours to trigger non-critical warnings
      const existingAssignments = Array.from({ length: 5 }, (_, i) =>
        createExistingAssignment(1, {
          id: i + 100,
          date: new Date(`2024-01-${10 + i}`),
          startTime: new Date(`2024-01-${10 + i}T08:00:00Z`),
          endTime: new Date(`2024-01-${10 + i}T16:00:00Z`)
        })
      )

      const context = createConstraintContext(assignment, existingAssignments)
      const result = engine.validateCriticalConstraints(context)

      expect(result.isValid).toBe(true)
      expect(result.allResults.length).toBeLessThan(8) // Should be less than all constraints

      const resultRules = result.allResults.map(r => r.rule)
      expect(resultRules).toContain(ConstraintType.NO_DOUBLE_BOOKING)
      expect(resultRules).toContain(ConstraintType.SKILL_REQUIREMENT)
      expect(resultRules).toContain(ConstraintType.LOCATION_CERTIFICATION)
      expect(resultRules).not.toContain(ConstraintType.WEEKLY_HOURS_LIMIT)
    })
  })

  describe('findAlternativeStaff', () => {
    it('should find alternative staff and rank by fewest violations', () => {
      const assignment = createShiftAssignment(1, {
        skillId: 999, // Invalid skill that user 1 doesn't have
        locationId: 1
      })

      const context = createConstraintContext(assignment, [])
      const alternatives = engine.findAlternativeStaff(context)

      expect(alternatives.length).toBeGreaterThan(0)
      expect(alternatives[0].user.id).not.toBe(1) // Not the original user

      // Should be sorted by fewest violations
      for (let i = 1; i < alternatives.length; i++) {
        expect(alternatives[i].violations.length).toBeGreaterThanOrEqual(alternatives[i - 1].violations.length)
      }
    })

    it('should exclude the originally proposed user from alternatives', () => {
      const assignment = createShiftAssignment(2, {
        skillId: 999,
        locationId: 1
      })

      const context = createConstraintContext(assignment, [])
      const alternatives = engine.findAlternativeStaff(context)

      expect(alternatives.every(alt => alt.user.id !== 2)).toBe(true)
    })
  })

  describe('canOverrideViolations', () => {
    it('should identify overridable violations', () => {
      const assignment = createShiftAssignment(1, {
        skillId: 1,
        locationId: 1,
        date: new Date('2024-01-15'),
        startTime: new Date('2024-01-15T14:00:00Z'),
        endTime: new Date('2024-01-15T18:00:00Z')
      })

      // Create enough assignments to trigger weekly hours limit
      const existingAssignments = Array.from({ length: 10 }, (_, i) =>
        createExistingAssignment(1, {
          id: i + 100,
          date: new Date(`2024-01-${10 + i}`),
          startTime: new Date(`2024-01-${10 + i}T08:00:00Z`),
          endTime: new Date(`2024-01-${10 + i}T12:00:00Z`)
        })
      )

      const context = createConstraintContext(assignment, existingAssignments)
      const overrideInfo = engine.canOverrideViolations(context)

      expect(overrideInfo.canOverride).toBe(true)
      expect(overrideInfo.requiredOverrides).toContain('allowExcessiveHours')
      expect(overrideInfo.remainingViolations).toHaveLength(0)
    })

    it('should identify non-overridable violations', () => {
      const assignment = createShiftAssignment(1, {
        skillId: 999, // Invalid skill - cannot override
        locationId: 1
      })

      const context = createConstraintContext(assignment, [])
      const overrideInfo = engine.canOverrideViolations(context)

      expect(overrideInfo.canOverride).toBe(false)
      expect(overrideInfo.remainingViolations.length).toBeGreaterThan(0)

      const remainingRules = overrideInfo.remainingViolations.map(v => v.rule)
      expect(remainingRules).toContain(ConstraintType.SKILL_REQUIREMENT)
    })
  })

  describe('getAvailableConstraints', () => {
    it('should return all available constraint types', () => {
      const constraints = engine.getAvailableConstraints()

      expect(constraints).toContain(ConstraintType.NO_DOUBLE_BOOKING)
      expect(constraints).toContain(ConstraintType.SKILL_REQUIREMENT)
      expect(constraints).toContain(ConstraintType.LOCATION_CERTIFICATION)
      expect(constraints).toContain(ConstraintType.AVAILABILITY_WINDOW)
      expect(constraints).toContain(ConstraintType.DAILY_HOURS_LIMIT)
      expect(constraints).toContain(ConstraintType.WEEKLY_HOURS_LIMIT)
      expect(constraints).toContain(ConstraintType.CONSECUTIVE_DAYS_LIMIT)
      expect(constraints).toContain(ConstraintType.MINIMUM_REST_PERIOD)
      expect(constraints).toHaveLength(8)
    })
  })

  describe('error handling', () => {
    it('should handle validation errors gracefully', () => {
      // Create invalid context that might cause errors
      const assignment = createShiftAssignment(1)
      assignment.shift.location = null as any // Force an error condition

      const context = createConstraintContext(assignment, [])
      const result = engine.validateAssignment(context)

      // Should not throw, but should have error results
      expect(result.allResults.length).toBeGreaterThan(0)

      const errorResults = result.allResults.filter(r => !r.valid && r.message.includes('Validation error'))
      expect(errorResults.length).toBeGreaterThan(0)
    })
  })
})