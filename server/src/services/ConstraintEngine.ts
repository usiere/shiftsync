import { ValidationResult, ConstraintContext, ConstraintType } from '../types/constraint'
import { validateNoDoubleBooking } from './constraints/doubleBookingConstraint'
import { validateMinimumRestPeriod } from './constraints/restPeriodConstraint'
import { validateSkillRequirement } from './constraints/skillRequirementConstraint'
import { validateLocationCertification } from './constraints/locationCertificationConstraint'
import { validateAvailabilityWindow } from './constraints/availabilityConstraint'
import { validateDailyHours } from './constraints/dailyHoursConstraint'
import { validateWeeklyHours } from './constraints/weeklyHoursConstraint'
import { validateConsecutiveDays } from './constraints/consecutiveDaysConstraint'

export interface ConstraintEngineResult {
  isValid: boolean
  violations: ValidationResult[]
  warnings: ValidationResult[]
  allResults: ValidationResult[]
}

export class ConstraintEngine {
  private validators = new Map([
    [ConstraintType.NO_DOUBLE_BOOKING, validateNoDoubleBooking],
    [ConstraintType.MINIMUM_REST_PERIOD, validateMinimumRestPeriod],
    [ConstraintType.SKILL_REQUIREMENT, validateSkillRequirement],
    [ConstraintType.LOCATION_CERTIFICATION, validateLocationCertification],
    [ConstraintType.AVAILABILITY_WINDOW, validateAvailabilityWindow],
    [ConstraintType.DAILY_HOURS_LIMIT, validateDailyHours],
    [ConstraintType.WEEKLY_HOURS_LIMIT, validateWeeklyHours],
    [ConstraintType.CONSECUTIVE_DAYS_LIMIT, validateConsecutiveDays]
  ])

  /**
   * Validate a shift assignment against all constraints
   */
  validateAssignment(context: ConstraintContext): ConstraintEngineResult {
    const results: ValidationResult[] = []

    // Run all validations
    for (const [constraintType, validator] of this.validators) {
      try {
        const result = validator(context)
        results.push(result)
      } catch (error) {
        // Handle validation errors gracefully
        results.push({
          valid: false,
          rule: constraintType,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestions: [],
          severity: 'error'
        })
      }
    }

    // Separate violations and warnings
    const violations = results.filter(r => !r.valid)
    const warnings = results.filter(r => r.valid && r.severity === 'warning')

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      allResults: results
    }
  }

  /**
   * Validate a specific constraint
   */
  validateConstraint(constraintType: ConstraintType, context: ConstraintContext): ValidationResult {
    const validator = this.validators.get(constraintType)

    if (!validator) {
      throw new Error(`Unknown constraint type: ${constraintType}`)
    }

    return validator(context)
  }

  /**
   * Get all available constraint types
   */
  getAvailableConstraints(): ConstraintType[] {
    return Array.from(this.validators.keys())
  }

  /**
   * Validate only critical constraints (those that would block assignment)
   */
  validateCriticalConstraints(context: ConstraintContext): ConstraintEngineResult {
    const criticalConstraints = [
      ConstraintType.NO_DOUBLE_BOOKING,
      ConstraintType.MINIMUM_REST_PERIOD,
      ConstraintType.SKILL_REQUIREMENT,
      ConstraintType.LOCATION_CERTIFICATION,
      ConstraintType.AVAILABILITY_WINDOW
    ]

    const results: ValidationResult[] = []

    for (const constraintType of criticalConstraints) {
      const validator = this.validators.get(constraintType)
      if (validator) {
        try {
          const result = validator(context)
          results.push(result)
        } catch (error) {
          results.push({
            valid: false,
            rule: constraintType,
            message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            suggestions: [],
            severity: 'error'
          })
        }
      }
    }

    const violations = results.filter(r => !r.valid)
    const warnings = results.filter(r => r.valid && r.severity === 'warning')

    return {
      isValid: violations.length === 0,
      violations,
      warnings,
      allResults: results
    }
  }

  /**
   * Get suggestions for alternative staff when constraints are violated
   */
  findAlternativeStaff(context: ConstraintContext): { user: any; violations: ValidationResult[] }[] {
    const alternativeResults: { user: any; violations: ValidationResult[] }[] = []

    // Test each qualified user as an alternative
    for (const user of context.allQualifiedUsers) {
      if (user.id === context.proposedAssignment.userId) {
        continue // Skip the originally proposed user
      }

      // Create a new context with the alternative user
      const alternativeContext: ConstraintContext = {
        ...context,
        proposedAssignment: {
          ...context.proposedAssignment,
          userId: user.id,
          user: user as any
        }
      }

      // Run validation for this alternative user
      const result = this.validateAssignment(alternativeContext)

      alternativeResults.push({
        user,
        violations: result.violations
      })
    }

    // Sort by fewest violations (best alternatives first)
    return alternativeResults.sort((a, b) => a.violations.length - b.violations.length)
  }

  /**
   * Check if assignment can be made with override flags
   */
  canOverrideViolations(context: ConstraintContext): {
    canOverride: boolean;
    requiredOverrides: string[];
    remainingViolations: ValidationResult[]
  } {
    const result = this.validateAssignment(context)
    const requiredOverrides: string[] = []
    const remainingViolations: ValidationResult[] = []

    for (const violation of result.violations) {
      switch (violation.rule) {
        case ConstraintType.WEEKLY_HOURS_LIMIT:
          requiredOverrides.push('allowExcessiveHours')
          break
        case ConstraintType.CONSECUTIVE_DAYS_LIMIT:
          requiredOverrides.push('allowConsecutiveDays')
          break
        default:
          // This violation cannot be overridden
          remainingViolations.push(violation)
      }
    }

    return {
      canOverride: remainingViolations.length === 0,
      requiredOverrides: Array.from(new Set(requiredOverrides)),
      remainingViolations
    }
  }
}